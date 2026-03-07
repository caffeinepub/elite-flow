import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { Bell, Loader2, MessageSquare, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FounderBadge } from "../components/FounderBadge";
import MessageBubble from "../components/MessageBubble";
import MessageComposer from "../components/MessageComposer";
import { getAvatarUrl } from "../hooks/useAvatarUrl";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  CommunityChannel,
  useGetChannelMessages,
  useGetConversationList,
  useGetDirectMessages,
  useGetUserList,
  useIsFounder,
  usePostToChannel,
  useSendDirectMessage,
} from "../hooks/useQueries";
import { formatTimestamp, getInitials, stringToColor } from "../lib/helpers";

// ─── Avatar helper ────────────────────────────────────────────────────────────

function UserAvatar({
  displayName,
  avatarId,
  size = "sm",
}: {
  displayName: string;
  avatarId?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClass =
    size === "xs" ? "w-6 h-6" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textClass = size === "xs" ? "text-[10px]" : "text-xs";
  const avatarUrl = getAvatarUrl(avatarId);

  return (
    <Avatar className={cn(sizeClass, "flex-shrink-0")}>
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={displayName}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(textClass, "font-semibold text-white")}
        style={{ background: stringToColor(displayName) }}
      >
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

// ─── Announcements ────────────────────────────────────────────────────────────

function AnnouncementsTab() {
  const { data: messages = [], isLoading } = useGetChannelMessages(
    CommunityChannel.announcements,
  );
  const { data: isFounder } = useIsFounder();
  const { data: userList = [] } = useGetUserList();
  const postToChannel = usePostToChannel();

  // Build a map from principal string -> avatarId for quick lookups
  const avatarMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const u of userList) {
      map.set(u.principal.toString(), u.avatarId);
    }
    return map;
  }, [userList]);

  const handlePost = async (content: string, imageId: string | null) => {
    await postToChannel.mutateAsync({
      channel: CommunityChannel.announcements,
      content,
      imageId,
    });
  };

  const sorted = [...messages].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="flex flex-col h-full">
      {isFounder && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold">Post Announcement</span>
            <span className="text-xs text-muted-foreground">
              (Founder only)
            </span>
          </div>
          <MessageComposer
            onSend={handlePost}
            isPending={postToChannel.isPending}
            placeholder="Write an announcement..."
          />
        </div>
      )}

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="community.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="community.empty_state"
            >
              <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No announcements yet.</p>
              {isFounder && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Post the first announcement above!
                </p>
              )}
            </div>
          ) : (
            sorted.map((msg) => {
              const authorAvatarId = avatarMap.get(
                msg.authorPrincipal.toString(),
              );
              const authorAvatarUrl = getAvatarUrl(authorAvatarId);
              return (
                <div
                  key={msg.id.toString()}
                  className="p-4 rounded-xl bg-secondary/50 border border-border"
                >
                  <div className="flex items-start gap-3">
                    {authorAvatarUrl ? (
                      <UserAvatar
                        displayName={msg.authorUsername}
                        avatarId={authorAvatarId}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-gold" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold">
                          {msg.authorUsername}
                        </span>
                        <FounderBadge />
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── General Channel ──────────────────────────────────────────────────────────

function GeneralTab() {
  const { data: messages = [], isLoading } = useGetChannelMessages(
    CommunityChannel.general,
  );
  const { data: userList = [] } = useGetUserList();
  const postToChannel = usePostToChannel();
  const { identity } = useInternetIdentity();

  // Build a map from principal string -> avatarId
  const avatarMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const u of userList) {
      map.set(u.principal.toString(), u.avatarId);
    }
    return map;
  }, [userList]);

  const handlePost = async (content: string, imageId: string | null) => {
    await postToChannel.mutateAsync({
      channel: CommunityChannel.general,
      content,
      imageId,
    });
  };

  const sorted = [...messages].sort((a, b) =>
    Number(a.timestamp - b.timestamp),
  );
  const selfPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="general.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="general.empty_state"
            >
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No messages yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Be the first to say hello! 👋
              </p>
            </div>
          ) : (
            sorted.map((msg) => (
              <MessageBubble
                key={msg.id.toString()}
                authorUsername={msg.authorUsername}
                authorAvatarId={avatarMap.get(msg.authorPrincipal.toString())}
                content={msg.content}
                timestamp={msg.timestamp}
                isSelf={msg.authorPrincipal.toString() === selfPrincipal}
                imageId={msg.imageId}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <MessageComposer
          onSend={handlePost}
          isPending={postToChannel.isPending}
          placeholder="Message #general..."
        />
      </div>
    </div>
  );
}

// ─── Direct Messages ──────────────────────────────────────────────────────────

function DMConversation({
  otherPrincipal,
  otherUsername,
  otherAvatarId,
}: {
  otherPrincipal: Principal;
  otherUsername: string;
  otherAvatarId?: string;
}) {
  const { data: messages = [], isLoading } =
    useGetDirectMessages(otherPrincipal);
  const { data: userList = [] } = useGetUserList();
  const sendDM = useSendDirectMessage();
  const { identity } = useInternetIdentity();

  // Build a map from principal string -> avatarId
  const avatarMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const u of userList) {
      map.set(u.principal.toString(), u.avatarId);
    }
    return map;
  }, [userList]);

  const selfPrincipal = identity?.getPrincipal().toString();
  const sorted = [...messages].sort((a, b) =>
    Number(a.timestamp - b.timestamp),
  );

  const handleSend = async (content: string, imageId: string | null) => {
    await sendDM.mutateAsync({ toPrincipal: otherPrincipal, content, imageId });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <UserAvatar
            displayName={otherUsername}
            avatarId={otherAvatarId}
            size="xs"
          />
          <span className="font-semibold text-sm">{otherUsername}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No messages yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Start the conversation!
              </p>
            </div>
          ) : (
            sorted.map((msg) => (
              <MessageBubble
                key={msg.id.toString()}
                authorUsername={msg.fromUsername}
                authorAvatarId={avatarMap.get(msg.fromPrincipal.toString())}
                content={msg.content}
                timestamp={msg.timestamp}
                isSelf={msg.fromPrincipal.toString() === selfPrincipal}
                imageId={msg.imageId}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <MessageComposer
          onSend={handleSend}
          isPending={sendDM.isPending}
          placeholder={`Message ${otherUsername}...`}
        />
      </div>
    </div>
  );
}

function NewDMDialog({
  onSelect,
  onClose,
}: {
  onSelect: (principal: Principal, username: string, avatarId?: string) => void;
  onClose: () => void;
}) {
  const { data: users = [], isLoading } = useGetUserList();
  const { identity } = useInternetIdentity();
  const [search, setSearch] = useState("");

  const selfPrincipal = identity?.getPrincipal().toString();
  const filtered = users.filter(
    (u) =>
      u.principal.toString() !== selfPrincipal &&
      (u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="p-4 space-y-3" data-ocid="community.dialog">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">New Direct Message</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-ocid="community.close_button"
        >
          Cancel
        </Button>
      </div>
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
        data-ocid="community.search_input"
      />
      <div className="space-y-1 max-h-48 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users found
          </p>
        ) : (
          filtered.map((u) => (
            <button
              key={u.principal.toString()}
              type="button"
              onClick={() => onSelect(u.principal, u.username, u.avatarId)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/20 transition-colors text-left"
            >
              <UserAvatar
                displayName={u.displayName}
                avatarId={u.avatarId}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">
                    {u.displayName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  @{u.username}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function DirectMessagesTab() {
  const { data: conversations = [], isLoading } = useGetConversationList();
  const { data: userList = [] } = useGetUserList();
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(
    null,
  );
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(
    undefined,
  );
  const [showNewDM, setShowNewDM] = useState(false);

  // Build a map from principal string -> avatarId
  const avatarMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const u of userList) {
      map.set(u.principal.toString(), u.avatarId);
    }
    return map;
  }, [userList]);

  const handleSelectConversation = (
    principal: Principal,
    username: string,
    avatarId?: string,
  ) => {
    setSelectedPrincipal(principal);
    setSelectedUsername(username);
    setSelectedAvatarId(avatarId);
    setShowNewDM(false);
  };

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-card/30",
          selectedPrincipal ? "hidden md:flex md:w-64" : "w-full md:w-64",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Direct Messages</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setShowNewDM(true)}
            data-ocid="community.open_modal_button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showNewDM ? (
          <NewDMDialog
            onSelect={handleSelectConversation}
            onClose={() => setShowNewDM(false)}
          />
        ) : (
          <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center px-4"
                  data-ocid="community.empty_state"
                >
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No conversations yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewDM(true)}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    Start one!
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const convAvatarId = avatarMap.get(
                    conv.otherPrincipal.toString(),
                  );
                  return (
                    <button
                      key={conv.otherPrincipal.toString()}
                      type="button"
                      onClick={() =>
                        handleSelectConversation(
                          conv.otherPrincipal,
                          conv.otherUsername,
                          convAvatarId,
                        )
                      }
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left",
                        selectedPrincipal?.toString() ===
                          conv.otherPrincipal.toString()
                          ? "bg-accent/20"
                          : "hover:bg-accent/10",
                      )}
                    >
                      <UserAvatar
                        displayName={conv.otherUsername}
                        avatarId={convAvatarId}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium truncate">
                            {conv.otherUsername}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatTimestamp(conv.timestamp)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Conversation view */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !selectedPrincipal ? "hidden md:flex" : "flex",
        )}
      >
        {selectedPrincipal ? (
          <DMConversation
            otherPrincipal={selectedPrincipal}
            otherUsername={selectedUsername}
            otherAvatarId={selectedAvatarId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-semibold text-muted-foreground mb-1">
              Select a conversation
            </h3>
            <p className="text-sm text-muted-foreground/60">
              Choose from the list or start a new conversation
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowNewDM(true)}
              data-ocid="community.primary_button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

export default function CommunityPage() {
  return (
    <div className="h-[calc(100vh-57px)] lg:h-[calc(100vh-56px)] flex flex-col">
      <div className="px-4 lg:px-6 py-4 border-b border-border">
        <h1 className="font-display text-xl lg:text-2xl font-bold">
          Community
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect, share, and grow together
        </p>
      </div>

      <Tabs
        defaultValue="general"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 lg:px-6 py-2 border-b border-border">
          <TabsList className="h-9">
            <TabsTrigger
              value="announcements"
              className="text-sm"
              data-ocid="community.announcements_tab"
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="text-sm"
              data-ocid="community.general_tab"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="dm"
              className="text-sm"
              data-ocid="community.dm_tab"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Messages
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="announcements"
          className="flex-1 overflow-hidden mt-0"
        >
          <AnnouncementsTab />
        </TabsContent>
        <TabsContent value="general" className="flex-1 overflow-hidden mt-0">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="dm" className="flex-1 overflow-hidden mt-0">
          <DirectMessagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
