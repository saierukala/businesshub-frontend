// Shrinks a picked photo before upload: crops the centre square and scales it to 512x512 JPEG.
// A 4 MB phone photo becomes ~40 KB, well under the server's 300 KB limit.
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SIZE = 512;

export async function shrinkImage(file: File): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type)) throw new Error("Choose a JPEG, PNG or WebP photo");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That file could not be read as a photo");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
