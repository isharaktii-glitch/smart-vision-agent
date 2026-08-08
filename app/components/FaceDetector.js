'use client';
import { useRef, useState } from 'react';

export default function FaceDetector({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Loading models...');
  const [faceCount, setFaceCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const startCamera = async () => {
    try {
      setStatus('Loading face detection models...');
      const faceapi = await import('face-api.js');
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      setStatus('Starting camera...');

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setStatus('Detecting faces...');
        detectLoop(faceapi);
      };
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const detectLoop = async (faceapi) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    const interval = setInterval(async () => {
      if (!video || video.paused || video.ended) return;
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      setFaceCount(detections.length);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const resized = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resized);
    }, 300);

    videoRef.current.dataset.intervalId = interval;
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (video?.dataset.intervalId) {
      clearInterval(video.dataset.intervalId);
    }
    onClose();
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '15px' }}>
      <p style={{ fontSize: '13px', marginBottom: '10px' }}>{status}</p>
      {faceCount > 0 && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>Faces detected: {faceCount}</p>
      )}

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} muted playsInline />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        {!modelsLoaded && (
          <button
            onClick={startCamera}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white' }}
          >
            Start Camera
          </button>
        )}
        <button
          onClick={stopCamera}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
