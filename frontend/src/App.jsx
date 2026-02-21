import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle, uploading, analyzing, complete
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState('media'); // 'media' or 'audio'

  const resetAnalysis = () => {
    setAnalysisStatus('idle');
    setFile(null);
    setResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;

    setAnalysisStatus('uploading');

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload
      const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData);
      const jobId = uploadRes.data.job_id;

      setAnalysisStatus('analyzing');

      // 2. Poll for results
      const pollInterval = setInterval(async () => {
        const statusRes = await axios.get(`${API_BASE_URL}/status/${jobId}`);
        if (statusRes.data.status === 'completed') {
          clearInterval(pollInterval);
          setResult(statusRes.data.result);
          setAnalysisStatus('complete');
        } else if (statusRes.data.status === 'failed') {
          clearInterval(pollInterval);
          alert('Analysis failed');
          setAnalysisStatus('idle');
        }
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please ensure the backend is running.');
      setAnalysisStatus('idle');
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo" onClick={() => { setCurrentPage('media'); resetAnalysis(); }} style={{ cursor: 'pointer' }}>
          <span style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>🛡️</span> RAKSHAK
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <span
            className={`nav-item ${currentPage === 'media' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('media'); resetAnalysis(); }}
            style={{ cursor: 'pointer', fontWeight: 600, color: currentPage === 'media' ? 'var(--primary)' : 'var(--text-dim)' }}
          >
            Media Scan
          </span>
          <span
            className={`nav-item ${currentPage === 'audio' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('audio'); resetAnalysis(); }}
            style={{ cursor: 'pointer', fontWeight: 600, color: currentPage === 'audio' ? 'var(--primary)' : 'var(--text-dim)' }}
          >
            Voice Scan
          </span>
          <button className="btn-primary" style={{ marginLeft: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🔌</span> API Connected
          </button>
        </div>
      </nav>

      <main>
        <div className="hero-section" style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div className="hero-content">
            <div className="hero-text-side">
              <div className="tag tag-success" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>V1.2.0 LIVE • ADVANCED FORENSICS</div>
              {currentPage === 'media' ? (
                <>
                  <h1 style={{ textAlign: 'left' }}>Protect Your <span style={{ color: 'var(--primary)' }}>Digital Identity</span> <br /> with AI Detection</h1>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2.5rem', textAlign: 'left' }}>
                    Defend against the rising threat of deepfakes with RAKSHAK's cutting-edge AI technology, designed for seamless integration and real-time accuracy.
                  </p>
                </>
              ) : (
                <>
                  <h1 style={{ textAlign: 'left' }}>Secure Your <span style={{ color: 'var(--primary)' }}>Voice Identity</span> <br /> with Spectral Scan</h1>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2.5rem', textAlign: 'left' }}>
                    Identify AI-cloned audio and synthetic voice synthesis with our advanced frequency-domain forensic engine.
                  </p>
                </>
              )}

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button
                  onClick={() => { setCurrentPage('media'); resetAnalysis(); }}
                  className="btn-primary"
                  style={{
                    background: currentPage === 'media' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: currentPage === 'media' ? 'none' : '1px solid var(--glass-border)',
                    padding: '1rem 2rem',
                    fontSize: '1rem'
                  }}
                >
                  Media Scan
                </button>
                <button
                  onClick={() => { setCurrentPage('audio'); resetAnalysis(); }}
                  className="btn-primary"
                  style={{
                    background: currentPage === 'audio' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: currentPage === 'audio' ? 'none' : '1px solid var(--glass-border)',
                    padding: '1rem 2rem',
                    fontSize: '1rem'
                  }}
                >
                  Voice Scan
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="moving-face-container">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop"
                  className="hero-face"
                  alt="Forensic Subject"
                />
                <div className="scanning-mesh"></div>
                <div className="scan-line"></div>
              </div>
            </div>
          </div>

          <div className="scroll-indicator" onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}>
            <span>SCROLL DOWN</span>
            <div className="scroll-dot"></div>
          </div>
        </div>

        <div className="upload-container glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {!analysisStatus || analysisStatus === 'idle' ? (
            <div className="fade-in">
              <div className="upload-icon">
                <span style={{ fontSize: '2.5rem' }}>{currentPage === 'media' ? '📤' : '🎙️'}</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {currentPage === 'media' ? 'Start New Forensic Scan' : 'Start Voice Verification'}
              </h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>
                {currentPage === 'media' ? 'Upload MP4, JPG, or PNG for deep neural analysis' : 'Upload WAV, MP3, or M4A for voice clone detection'}
              </p>

              <input
                type="file"
                id="file-upload"
                accept={currentPage === 'media' ? "image/*,video/*" : "audio/*"}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
                <label htmlFor="file-upload" className="btn-primary" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                  {file ? file.name : (currentPage === 'media' ? 'Select Media' : 'Select Audio')}
                </label>

                {file && (
                  <button
                    onClick={startAnalysis}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}
                  >
                    <span>⚡</span> {currentPage === 'media' ? 'Initiate Deep Scan' : 'Check Authenticity'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="analysis-progress fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div className="upload-icon pulse-glow" style={{ margin: 0, animation: 'pulse-glow 2s infinite' }}>
                  <span style={{ fontSize: '2.5rem' }}>🔍</span>
                </div>
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {analysisStatus === 'complete' ? 'Forensic Scan Result' : 'Neural Processing...'}
              </h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
                {analysisStatus === 'uploading' && 'Establishing secure transmission tunnel...'}
                {analysisStatus === 'analyzing' && (currentPage === 'media' ? 'Analyzing frequency domains and temporal consistency...' : 'Decoding neural voice features and frequency anomalies...')}
                {analysisStatus === 'complete' && `Analysis finalized for ${file?.name}`}
              </p>

              {analysisStatus !== 'complete' && (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <div className="progress-bar-container" style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div className="progress-bar" style={{
                      width: analysisStatus === 'uploading' ? '35%' : '75%',
                      height: '100%',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    <span>{analysisStatus === 'uploading' ? 'UPLOADING' : 'SCANNING'}</span>
                    <span>{analysisStatus === 'uploading' ? '35%' : '75%'}</span>
                  </div>
                </div>
              )}

              {result && (
                <div className="result-view fade-in">
                  <div style={{
                    padding: '3rem',
                    background: result.classification === 'Deepfake' ? 'rgba(244, 63, 94, 0.05)' : (result.classification === 'Filtered' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(16, 185, 129, 0.05)'),
                    borderRadius: '2rem',
                    border: `1px solid ${result.classification === 'Deepfake' ? 'rgba(244, 63, 94, 0.2)' : (result.classification === 'Filtered' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)')}`,
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '4.5rem', fontWeight: '800', color: result.classification === 'Deepfake' ? 'var(--error)' : (result.classification === 'Filtered' ? 'var(--accent)' : 'var(--success)'), lineHeight: 1 }}>
                      {result.score}<span style={{ fontSize: '2rem' }}>%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div className={`tag ${result.classification === 'Deepfake' ? 'tag-warning' : (result.classification === 'Filtered' ? 'tag-success' : 'tag-success')}`} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', background: result.classification === 'Filtered' ? 'var(--accent)' : '' }}>
                        {result.classification ? result.classification.toUpperCase() : result.status.toUpperCase()}
                      </div>
                    </div>

                    <p style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px', margin: '2rem auto' }}>
                      {result.details}
                    </p>

                    <div className="metric-grid">
                      <div className="metric-card">
                        <div className="metric-value">{result.fingerprint_score}%</div>
                        <div className="metric-label">Neural Fingerprint</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">99.8%</div>
                        <div className="metric-label">Confidence</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">{currentPage === 'media' ? 'GPU' : 'TPU'}</div>
                        <div className="metric-label">Processing</div>
                      </div>
                    </div>

                    <button
                      onClick={resetAnalysis}
                      className="btn-primary"
                      style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                    >
                      New Forensic Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
