export const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    // ✅ CORS fix (IMPORTANT for Cloudinary / external images)
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = crop.width;
      canvas.height = crop.height;

      // ✅ WHITE BACKGROUND (black issue fix)
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    };

    image.onerror = (error) => reject(error);
  });
};