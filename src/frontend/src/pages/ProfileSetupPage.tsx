import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) return;

    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
      });
      toast.success("Profile created! Welcome to Elite Flow.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">Elite Flow</span>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Set up your profile
              </h2>
              <p className="text-muted-foreground text-sm">
                One-time setup to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. fyodor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                autoComplete="username"
                data-ocid="auth.username_input"
              />
              <p className="text-xs text-muted-foreground">
                Used for mentions and DMs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g. Fyodor D."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11"
                data-ocid="auth.password_input"
              />
              <p className="text-xs text-muted-foreground">
                Shown in messages and your profile
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={
                !username.trim() || !displayName.trim() || saveProfile.isPending
              }
              data-ocid="auth.signup_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Elite Flow"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
