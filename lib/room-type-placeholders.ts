import { getRoomPlaceholderImage } from '@/lib/room-placeholders';

/** Room type catalog image: optional URL from API, else same stable placeholders as physical rooms. */
export function resolveRoomTypeImageUrl(imageUrl: string | null | undefined, roomTypeId: string) {
  if (imageUrl && imageUrl.trim().length > 0) {
    return imageUrl.trim();
  }
  return getRoomPlaceholderImage(roomTypeId);
}
