import sharp from "sharp";

export async function optimizeImage(buffer, width = 1200) {
  return sharp(buffer)
    .resize({ width, withoutEnlargement: true }) // Prevent upscaling
    .webp({ quality: 80 })                       // Compress & Convert to WebP
    .toBuffer();
}
