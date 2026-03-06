# Elite Flow

## Current State

Elite Flow is a full-stack SaaS dashboard with:
- Internet Identity authentication and user profiles (username, displayName)
- Dashboard with Habit Tracker, Task Manager, Cash Flow System, Wealth Goal progress bar
- Community tab with Announcements (Founder-only), General chat, Direct Messages
- Founder badge for account named "Fyodor" (username check via `isFounderUsername`)
- Blob storage component already selected for media in messages
- Color theme uses OKLCH tokens with a deep navy/indigo palette in index.css
- Avatars are letter-based (initials + `stringToColor`) with no photo support

## Requested Changes (Diff)

### Add
- Profile picture upload on Profile Settings page: file input from device gallery, local preview before saving, stored via blob-storage, saved as `avatarId` (blob storage asset ID) on the user profile
- `avatarId` field on `UserProfile` type in backend
- `getProfilePictureUrl(avatarId)` helper in frontend to resolve blob URL
- `AvatarImage` component usage everywhere a user avatar appears, falling back to initials when no picture is set
- Profile picture display in: AppLayout sidebar user section, AppLayout header (mobile and desktop), CommunityPage (GeneralTab MessageBubble, DirectMessages conversation header and list, Announcements author row, NewDMDialog user list), ProfilePage avatar section

### Modify
- `UserProfile` Motoko type: add `avatarId: ?Text` field
- `saveCallerUserProfile` to accept `avatarId` alongside username and displayName
- `UserProfile` TypeScript type in `backend.d.ts`: add `avatarId?: string`
- `index.css` color tokens: restore to the specified Deep Blue (#2563EB) primary, Dark Navy (#0F172A) background, Purple (#7C3AED) accent in OKLCH equivalents. The dark theme should be the default/only theme (dark navy background). All existing utility classes (gradient-brand, glass-card, message bubbles, etc.) must stay compatible.
- ProfilePage: add profile picture upload section (file input, preview, upload button, change button)
- AppLayout: show profile photo in sidebar and header avatars
- CommunityPage: show profile photo in message bubbles and user list items

### Remove
- Nothing removed. All existing features remain intact.

## Implementation Plan

1. **Backend**: Update `UserProfile` type to include `avatarId: ?Text`. Update `saveCallerUserProfile` to accept the new field. Ensure `getUserList` returns `avatarId` too so community pages can show photos.

2. **Frontend - index.css**: Update OKLCH color tokens to match:
   - Background (dark): Deep Navy #0F172A → oklch(~0.12 0.03 264)
   - Primary: Deep Blue #2563EB → oklch(~0.55 0.22 262)
   - Accent: Purple #7C3AED → oklch(~0.50 0.25 292)
   - Force dark mode as default (set `dark` class on `<html>` or ensure dark tokens apply by default)

3. **Frontend - ProfilePage**: Add profile picture upload section above the Edit Profile form. Upload button opens file input; selected file shows as circular preview. On save, upload blob via blob-storage SDK, get back `assetId`, then call `saveCallerUserProfile` with the `avatarId`. Also handle "Change Photo" flow.

4. **Frontend - Shared avatar helper**: Create `useProfilePictureUrl(avatarId?)` hook or helper that returns the HTTP URL for a blob asset ID (using blob-storage URL pattern from the SDK).

5. **Frontend - AppLayout**: Replace letter avatar with `<AvatarImage>` using the profile photo URL when available, fallback to initials.

6. **Frontend - CommunityPage**: Update `MessageBubble` to accept and display an optional `authorAvatarId`. Update `GeneralTab`, `AnnouncementsTab`, and `DMConversation` to pass the author's avatar ID where available. Update `NewDMDialog` user list to show profile photos.

7. All changes must preserve: Founder badge, Habit Tracker, Task Manager, Cash Flow, Wealth Goal, Community channels, DM system.
