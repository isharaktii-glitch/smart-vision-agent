'use client';
import { useRef, useState } from 'react';
import { startCameraWithFallback, enhanceFullFrame } from '../utils/imageEnhance';

export default function MoodAnalyzer({ onClose }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Camera එක start කරන්න');
  const [moodResult, setMoodResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      await startCameraWithFallback(videoRef);
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setCameraOn(true);
        setStatus('Photo ගන්න ready (Enhanced mode)');
      };
    } catch (err) {
      setStatus('Camera error: ' + err.message);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const enhancedCanvas = enhanceFullFrame(video);
    const imageData = enhancedCanvas.toDataURL('image/jpeg', 0.9);

    setLoading(true);
    setStatus('Gemini AI mood analyze කරනවා (enhanced image)...');
    setMoodResult('');

    try {
      const res = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus('Error: ' + data.error);
      } else {
        setMoodResult(data.mood);
        setStatus('Analysis ඉවරයි!');
      }
    } catch (err) {
      setStatus('Request error: ' + err.message);
    }
    setLoading(false);
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '15px' }}>
      <p style={{ fontSize: '13px', marginBottom: '10px' }}>{status}</p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} muted playsInline />
      </div>

      {moodResult && (
        <div style={{ marginTop: '10px', padding: '12px', background: '#e6f7e6', borderRadius: '8px' }}>
          <strong>Mood Result:</strong>
          <p style={{ marginTop: '5px' }}>{moodResult}</p>
        </div>
      )}

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!cameraOn && (
          <button
            onClick={startCamera}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white' }}
          >
            Start Camera
          </button>
        )}
        {cameraOn && (
          <button
            onClick={capturePhoto}
            disabled={loading}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white' }}
          >
            {loading ? 'Analyzing...' : 'Capture & Analyze'}
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
