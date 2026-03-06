import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

const EMOJI_LIST = [
  "😀",
  "😂",
  "🔥",
  "👍",
  "❤️",
  "🚀",
  "✅",
  "💡",
  "🎉",
  "💪",
  "👏",
  "🤔",
  "😎",
  "🌟",
  "💯",
  "🙏",
  "😍",
  "🤝",
  "👑",
  "⚡",
];

interface MessageComposerProps {
  onSend: (content: string, imageId: string | null) => Promise<void>;
  isPending: boolean;
  placeholder?: string;
}

export default function MessageComposer({
  onSend,
  isPending,
  placeholder = "Write a message...",
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!content.trim() || isPending || uploading) return;
    try {
      await onSend(content.trim(), null);
      setContent("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const uploadedBytes = await blob.getBytes();
      const uploaded = ExternalBlob.fromBytes(uploadedBytes);
      const url = uploaded.getDirectURL();

      const trimmed = content.trim();
      const msgWithImage = trimmed
        ? `${trimmed}\n[image:${url}]`
        : `[image:${url}]`;
      await onSend(msgWithImage, null);
      setContent("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setEmojiOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="resize-none min-h-[72px] max-h-32 text-sm"
        data-ocid="community.message_input"
        disabled={isPending || uploading}
      />
      <div className="flex items-center gap-2">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground"
              type="button"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" data-ocid="community.popover">
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl p-1.5 rounded hover:bg-accent transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground"
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-ocid="community.image_upload_button"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Image className="w-4 h-4" />
          )}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">Enter to send</span>
        <Button
          onClick={handleSend}
          size="sm"
          className="h-8 px-3"
          disabled={!content.trim() || isPending || uploading}
          data-ocid="community.send_button"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
