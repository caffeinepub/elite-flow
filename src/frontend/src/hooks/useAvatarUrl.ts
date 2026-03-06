import { ExternalBlob } from "../backend";

/**
 * Returns a displayable HTTP URL for a stored avatarId.
 * Returns null if avatarId is not provided.
 */
export function getAvatarUrl(
  avatarId: string | undefined | null,
): string | null {
  if (!avatarId) return null;
  try {
    return ExternalBlob.fromURL(avatarId).getDirectURL();
  } catch {
    return null;
  }
}
