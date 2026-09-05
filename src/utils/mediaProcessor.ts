export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compresses an image File or Base64 data URL via HTMLCanvas.
 * Optimized for vehicle photos, dealer logos, and web page backgrounds.
 */
export async function compressImage(
  source: File | string,
  options: ImageCompressionOptions = {}
): Promise<{
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    format = 'image/jpeg'
  } = options;

  let originalSize = 0;
  let srcUrl = '';

  if (source instanceof File) {
    originalSize = source.size;
    srcUrl = URL.createObjectURL(source);
  } else {
    // source is base64 string
    const stringLength = source.length - (source.indexOf(',') + 1);
    originalSize = Math.round(4 * Math.ceil(stringLength / 3) * 0.5624896334383435);
    srcUrl = source;
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (source instanceof File) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error('Image compression timed out (10s)'));
    }, 10000);

    const img = new Image();
    // Only set crossOrigin for remote HTTP(S) resources. Never on data: or blob: URLs (prevents CORS blocks & hangs)
    if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      clearTimeout(timeout);
      if (source instanceof File) {
        URL.revokeObjectURL(srcUrl);
      }

      let { width, height } = img;

      // Calculate proportional downscaling if exceeds bounds
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio);
        width = Math.max(10, Math.round(width * scale));
        height = Math.max(10, Math.round(height * scale));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If format is JPEG, draw white background first in case PNG has transparency
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(format, quality);

      canvas.toBlob(
        (blob) => {
          const compressedSize = blob ? blob.size : Math.round((dataUrl.length * 3) / 4);
          resolve({
            dataUrl,
            blob: blob || new Blob([], { type: format }),
            width,
            height,
            originalSize,
            compressedSize
          });
        },
        format,
        quality
      );
    };

    img.onerror = (err) => {
      clearTimeout(timeout);
      if (source instanceof File) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(err);
    };

    img.src = srcUrl;
  });
}

