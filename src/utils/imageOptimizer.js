/**
 * Optimizes an uploaded image file on the client before uploading to R2:
 * 1. Resizes down to max dimensions (default 1920px)
 * 2. Converts to modern WebP format
 * 3. Applies ~85% quality compression
 */
export async function optimizeImageForWeb(file, maxDimension = 1920, quality = 0.85) {
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  // Skip SVG or GIF animations to preserve animation frames / vector math
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob || blob.size >= file.size) {
      return file; // Keep original if WebP compression didn't reduce file size
    }

    const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([blob], newFilename, { type: "image/webp" });
  } catch {
    return file; // Fallback to raw file if browser doesn't support createImageBitmap
  }
}
