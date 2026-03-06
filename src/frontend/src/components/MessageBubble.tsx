import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalBlob } from "../backend";
import { getAvatarUrl } from "../hooks/useAvatarUrl";
import { formatTimestamp, getInitials, stringToColor } from "../lib/helpers";
import { FounderBadge, isFounderUsername } from "./FounderBadge";

interface MessageBubbleProps {
  authorUsername: string;
  authorDisplayName?: string;
  authorAvatarId?: string;
  content: string;
  timestamp: bigint;
  isSelf?: boolean;
  imageId?: string;
}

function renderContent(content: string): React.ReactNode[] {
  // Handle image URL embedding like [image:https://...]
  const imageRegex = /\[image:(https?:\/\/[^\]]+)\]/g;
  const tokens = content.split(imageRegex);
  const result: React.ReactNode[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (i % 2 === 1) {
      // This is a captured URL from the image regex
      result.push(
        <img
          key={`img-${i}`}
          src={token}
          alt="Shared"
          className="max-w-full rounded-lg mt-2 max-h-60 object-cover"
          loading="lazy"
        />,
      );
    } else {
      // Plain text — linkify URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = token.split(urlRegex);
      const linked: React.ReactNode[] = parts.map((part, j) => {
        if (j % 2 === 1) {
          const key = `${i}-${part.slice(0, 20)}`;
          return (
            <a
              key={key}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 opacity-80 hover:opacity-100"
            >
              {part}
            </a>
          );
        }
        return part;
      });
      result.push(<span key={`text-${i}`}>{linked}</span>);
    }
  }

  return result;
}

export default function MessageBubble({
  authorUsername,
  authorDisplayName,
  authorAvatarId,
  content,
  timestamp,
  isSelf = false,
  imageId,
}: MessageBubbleProps) {
  const displayName = authorDisplayName || authorUsername;
  const initials = getInitials(displayName);
  const avatarColor = stringToColor(displayName);
  const isFounder = isFounderUsername(authorUsername);
  const avatarUrl = getAvatarUrl(authorAvatarId);

  if (isSelf) {
    return (
      <div className="flex items-end gap-2 justify-end">
        <div className="max-w-[75%] space-y-1">
          <div className="text-xs text-muted-foreground text-right">
            {formatTimestamp(timestamp)}
          </div>
          <div className="message-bubble-self px-3.5 py-2.5 text-sm">
            {renderContent(content)}
            {imageId && (
              <img
                src={ExternalBlob.fromURL(imageId).getDirectURL()}
                alt="Attachment"
                className="max-w-full rounded-lg mt-2 max-h-60 object-cover"
                loading="lazy"
              />
            )}
          </div>
        </div>
        <Avatar className="w-6 h-6 flex-shrink-0">
          {avatarUrl && (
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
          )}
          <AvatarFallback
            className="text-[10px] font-semibold text-white"
            style={{ background: avatarColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <Avatar className="w-6 h-6 flex-shrink-0">
        {avatarUrl && (
          <AvatarImage
            src={avatarUrl}
            alt={displayName}
            className="object-cover"
          />
        )}
        <AvatarFallback
          className="text-[10px] font-semibold text-white"
          style={{ background: avatarColor }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground/80">
            {displayName}
          </span>
          {isFounder && <FounderBadge />}
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(timestamp)}
          </span>
        </div>
        <div className="message-bubble-other px-3.5 py-2.5 text-sm">
          {renderContent(content)}
          {imageId && (
            <img
              src={ExternalBlob.fromURL(imageId).getDirectURL()}
              alt="Attachment"
              className="max-w-full rounded-lg mt-2 max-h-60 object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
