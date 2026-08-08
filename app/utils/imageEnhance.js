// Shared image enhancement utility — dark/distant faces වඩා පැහැදිලි කරගන්න
// හැම feature එකකම (Face Detection, Mood Analysis, Database Match, Video Call) පාවිච්චි කරන්න පුළුවන්

export function getHighResConstraints() {
  return {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: 'user',
    },
  };
}

// Canvas එකක brightness/contrast enhance කරන function එක
export function enhanceCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Auto brightness/contrast: histogram min/max සොයාගෙන stretch කරනවා
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (gray < min) min = gray;
    if (gray > max) max = gray;
  }

  const range = max - min || 1;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      // Contrast stretch
      val = ((val - min) / range) * 255;
      // Brightness boost (dark images වලට ටිකක් වැඩිපුර)
      val = val * 1.15;
      data[i + c] = Math.min(255, Math.max(0, val));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Face region එක විතරක් crop කරලා, enlarge කරලා, enhance කරන function එක
export function cropAndEnhanceFace(sourceCanvas, box, padding = 0.3) {
  const { x, y, width, height } = box;
  const padX = width * padding;
  const padY = height * padding;

  const cropX = Math.max(0, x - padX);
  const cropY = Math.max(0, y - padY);
  const cropW = Math.min(sourceCanvas.width - cropX, width + padX * 2);
  const cropH = Math.min(sourceCanvas.height - cropY, height + padY * 2);

  const outCanvas = document.createElement('canvas');
  const targetSize = 512; // enlarge කරලා Gemini ට clear image එකක් යවනවා
  outCanvas.width = targetSize;
  outCanvas.height = targetSize;

  const ctx = outCanvas.getContext('2d');
  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, targetSize, targetSize);

  enhanceCanvas(outCanvas);
  return outCanvas;
}

// Full frame එකක් enhance කරන convenience function එක (face-crop නැති අවස්ථා සඳහා)
export function enhanceFullFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  enhanceCanvas(canvas);
  return canvas;
}
