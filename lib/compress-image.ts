/** Client-side image compress — max long edge ~2400, WebP/JPEG ~0.82 */
export const MAX_LONG = 2400;
export const QUALITY = 0.82;

export async function compressImage(file: File): Promise<{ blob: Blob; name: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Kun billedfiler er tilladt (JPEG, PNG, WebP).");
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const long = Math.max(width, height);
  const scale = long > MAX_LONG ? MAX_LONG / long : 1;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kunne ikke behandle billedet.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    const tryType = (type: string, q: number) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else if (type === "image/webp") tryType("image/jpeg", q);
          else reject(new Error("Komprimering fejlede."));
        },
        type,
        q
      );
    };
    tryType("image/webp", QUALITY);
  });

  const ext = blob.type.includes("webp") ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "upload";
  return { blob, name: `${base}.${ext}` };
}
