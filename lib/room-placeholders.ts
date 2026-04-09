/** Bundled generic room photos when `imageUrl` is not set on a room. */
export const ROOM_PLACEHOLDER_IMAGES = [
  '/room-placeholders/1.jpg',
  '/room-placeholders/2.jpg',
  '/room-placeholders/3.jpg',
  '/room-placeholders/4.jpg',
] as const;

/** Stable pick so the same room always maps to the same placeholder. */
export function getRoomPlaceholderImage(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % ROOM_PLACEHOLDER_IMAGES.length;
  return ROOM_PLACEHOLDER_IMAGES[idx];
}

export function resolveRoomImageUrl(imageUrl: string | null | undefined, seed: string) {
  if (imageUrl && imageUrl.trim().length > 0) {
    return imageUrl.trim();
  }
  return getRoomPlaceholderImage(seed);
}
