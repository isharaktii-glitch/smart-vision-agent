'use client';
import { useState } from 'react';
import FaceDetector from './components/FaceDetector';
import MoodAnalyzer from './components/MoodAnalyzer';

export default function Home() {
  const [features, setFeatures] = useState({
    faceDetection: false,
    moodAnalysis: false,
    dbMatch: false,
    videoCallMood: false,
  });

  const toggleFeature = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const featureList = [
    { key: 'faceDetection', label: '1. Face Detection & Extraction' },
    { key: 'moodAnalysis', label: '2. Mood/Expression Analysis (Gemini)' },
    { key: 'dbMatch', label: '3. Known-Person Database Match' },
    { key: 'videoCallMood', label: '4. Video Call Aggregate Mood' },
  ];

  return (
    <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Smart Vision Agent</h1>
      <p style={{ textAlign: 'center', color: 'gray' }}>Feature Control Panel</p>

      <div style={{ marginTop: '30px' }}>
        {featureList.map((f) => (
          <div key={f.key} style={{ marginBottom: '10px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: features[f.key] ? '#e6f7e6' : '#f9f9f9',
              }}
            >
              <span style={{ fontSize: '14px' }}>{f.label}</span>
              <button
                onClick={() => toggleFeature(f.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  color: 'white',
                  background: features[f.key] ? '#22c55e' : '#9ca3af',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {features[f.key] ? 'ON' : 'OFF'}
              </button>
            </div>

            {f.key === 'faceDetection' && features.faceDetection && (
              <FaceDetector onClose={() => toggleFeature('faceDetection')} />
            )}

            {f.key === 'moodAnalysis' && features.moodAnalysis && (
              <MoodAnalyzer onClose={() => toggleFeature('moodAnalysis')} />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p style={{ fontSize: '13px', color: '#555' }}>
          දැනට Active Features: {Object.values(features).filter(Boolean).length} / {featureList.length}
        </p>
      </div>
    </main>
  );
}
