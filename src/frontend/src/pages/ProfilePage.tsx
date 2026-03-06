import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Shield, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import Footer from "../components/Footer";
import { FounderBadge, isFounderUsername } from "../components/FounderBadge";
import { getAvatarUrl } from "../hooks/useAvatarUrl";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { getInitials, stringToColor } from "../lib/helpers";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { identity } = useInternetIdentity();

  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  // Revoke object URL on unmount or when changed
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    if (!selectedFile || !profile) return;
    setIsUploadingPhoto(true);
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const uploadedBytes = await blob.getBytes();
      const url = ExternalBlob.fromBytes(uploadedBytes).getDirectURL();

      await saveProfile.mutateAsync({
        username: profile.username,
        displayName: profile.displayName,
        avatarId: url,
      });

      // Cleanup local preview state
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !profile) return;
    try {
      await saveProfile.mutateAsync({
        username: profile.username,
        displayName: displayName.trim(),
        avatarId: profile.avatarId,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const username = profile?.username ?? "";
  const currentDisplayName = profile?.displayName ?? "";
  const initials = getInitials(currentDisplayName || username);
  const avatarColor = stringToColor(currentDisplayName || username);
  const isFounder = isFounderUsername(username);
  const principal = identity?.getPrincipal().toString();

  // Resolve the display avatar URL: prefer local preview, then saved avatarId
  const savedAvatarUrl = getAvatarUrl(profile?.avatarId);
  const displayAvatarUrl = previewUrl ?? savedAvatarUrl;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 p-4 lg:p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Avatar section */}
          <div className="p-6 rounded-2xl bg-card card-glow">
            <div className="flex items-center gap-5">
              {/* Avatar with photo upload */}
              <div
                className="relative flex-shrink-0"
                data-ocid="profile.avatar_preview"
              >
                <Avatar className="w-20 h-20">
                  {displayAvatarUrl && (
                    <AvatarImage
                      src={displayAvatarUrl}
                      alt={currentDisplayName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback
                    className="text-2xl font-bold text-white"
                    style={{ background: avatarColor }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Camera overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-brand flex items-center justify-center shadow-glow-pink hover:opacity-90 transition-opacity"
                  title="Change photo"
                  data-ocid="profile.upload_button"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-display text-xl font-bold">
                    {currentDisplayName}
                  </h2>
                  {isFounder && <FounderBadge />}
                </div>
                <p className="text-muted-foreground text-sm">@{username}</p>
                {isFounder && (
                  <p className="text-xs text-gold mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Founder — Full community access
                  </p>
                )}

                {/* Upload / Change photo buttons */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    data-ocid="profile.upload_button"
                  >
                    <Upload className="w-3 h-3 mr-1.5" />
                    {savedAvatarUrl ? "Change Photo" : "Upload Photo"}
                  </Button>

                  {selectedFile && (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleSavePhoto}
                      disabled={isUploadingPhoto}
                      data-ocid="profile.save_photo_button"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Save Photo"
                      )}
                    </Button>
                  )}

                  {selectedFile && !isUploadingPhoto && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Preview: {selectedFile.name} — click "Save Photo" to apply
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Edit profile form */}
          <div className="p-6 rounded-2xl bg-card card-glow">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Edit Profile
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-display">Username</Label>
                <Input
                  id="username-display"
                  value={username}
                  readOnly
                  className="h-10 bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10"
                  placeholder="Your display name"
                  data-ocid="profile.display_name_input"
                />
              </div>

              <Button
                type="submit"
                disabled={
                  !displayName.trim() ||
                  saveProfile.isPending ||
                  displayName === profile?.displayName
                }
                className="h-10"
                data-ocid="profile.save_button"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </div>

          {/* Account info */}
          <div className="p-6 rounded-2xl bg-card card-glow">
            <h3 className="font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Authentication
                </span>
                <span className="text-sm font-medium">Internet Identity</span>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Principal ID
                </span>
                <span
                  className="text-xs font-mono text-muted-foreground max-w-[200px] truncate text-right"
                  title={principal}
                >
                  {principal
                    ? `${principal.slice(0, 12)}...${principal.slice(-8)}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
