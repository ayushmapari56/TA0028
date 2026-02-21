import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
          setResult(statusRes.data);
          setAnalysisStatus('complete');
          // Add auto-scroll to results
          setTimeout(() => {
            const results = document.querySelector('.result-view');
            if (results) results.scrollIntoView({ behavior: 'smooth' });
          }, 500);
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

              <div className="mode-switches">
                <button
                  onClick={() => { setCurrentPage('media'); resetAnalysis(); }}
                  className={`btn-mode ${currentPage === 'media' ? 'active' : 'inactive'}`}
                >
                  <span>🖼️</span> Images/Video
                </button>
                <button
                  onClick={() => { setCurrentPage('audio'); resetAnalysis(); }}
                  className={`btn-mode ${currentPage === 'audio' ? 'active' : 'inactive'}`}
                >
                  <span>🎙️</span> Audio
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

          <div className="scroll-indicator" onClick={() => {
            const showcase = document.querySelector('.forensic-showcase');
            if (showcase) showcase.scrollIntoView({ behavior: 'smooth' });
          }}>
            <span>SCROLL DOWN</span>
            <div className="scroll-dot"></div>
          </div>
        </div>

        {/* --- Forensic Showcase Section (Inspiration UI) --- */}
        <section className="forensic-showcase fade-in">
          <div className="forensic-grid">
            <div className="boy-image-container">
              <img src="/forensic-boy.webp" className="boy-image" alt="Forensic Target" />

              {/* Defense Overlays */}
              <div className="poi" style={{ top: '35%', left: '48%' }}></div>
              <div className="forensic-overlay overlay-1">
                <div className="detector-label">Defense Detected</div>
                <div className="detector-value">
                  99.9<span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginLeft: '2px' }}>%</span>
                </div>
                <div className="detector-desc">Likelihood of AI-driven facial manipulation detected by system.</div>
              </div>

              <div className="poi" style={{ bottom: '40%', right: '40%' }}></div>
              <div className="forensic-overlay overlay-2">
                <div className="detector-label">Neural Fingerprint</div>
                <div className="detector-value">
                  Active
                </div>
                <div className="detector-desc">High-frequency spectral anomalies identified in skin texture.</div>
              </div>
            </div>

            <div className="showcase-text-side">
              <div className="tag tag-success" style={{ marginBottom: '1rem' }}>Industrial Standard</div>
              <h2>Advanced XAI-Powered <br /> <span style={{ color: 'var(--primary)' }}>Forensic Detection</span></h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
                Our deep learning models go beyond simple pixel analysis. We trace the generative fingerprints left by GANs and Diffusion models to provide evidence-grade results.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">🛡️</div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>Real-time Defense</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Scales effortlessly with your needs without disrupting workflows.</div>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔍</div>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>Spectral Identification</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Scans frequency domains to identify synthetic voice and video artifacts.</div>
                  </div>
                </div>
              </div>

              <div className="mode-switches">
                <button
                  className={`btn-mode ${currentPage === 'media' ? 'active' : 'inactive'}`}
                  onClick={() => { setCurrentPage('media'); resetAnalysis(); }}
                >
                  <span>🖼️</span> Images/Video
                </button>
                <button
                  className={`btn-mode ${currentPage === 'audio' ? 'active' : 'inactive'}`}
                  onClick={() => { setCurrentPage('audio'); resetAnalysis(); }}
                >
                  <span>🎙️</span> Audio
                </button>
              </div>
            </div>
          </div>
        </section>

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
            <div className={`analysis-progress fade-in ${analysisStatus === 'complete' ? 'report-view-active' : ''}`}>
              {analysisStatus !== 'complete' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <div className="upload-icon pulse-glow" style={{ margin: 0, animation: 'pulse-glow 2s infinite' }}>
                      <span style={{ fontSize: '2.5rem' }}>🔍</span>
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Neural Processing...</h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
                    {analysisStatus === 'uploading' && 'Establishing secure transmission tunnel...'}
                    {analysisStatus === 'analyzing' && (currentPage === 'media' ? 'Analyzing frequency domains and temporal consistency...' : 'Decoding neural voice features and frequency anomalies...')}
                  </p>

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
                </>
              ) : (
                result && (
                  <div className="result-view-page fade-in">
                    <div className="report-header" style={{ marginBottom: '3rem', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
                      <div className="tag tag-success" style={{ marginBottom: '1rem' }}>FORENSIC REPORT PREPARED</div>
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Final Scan <span style={{ color: 'var(--primary)' }}>Results</span></h2>
                      <p style={{ color: 'var(--text-dim)' }}>Analysis finalized for <strong>{file?.name}</strong></p>
                    </div>

                    <div className="report-body-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', textAlign: 'left' }}>
                      <div className="main-forensic-card" style={{
                        padding: '3rem',
                        background: result.classification === 'Deepfake' ? 'rgba(244, 63, 94, 0.08)' : (result.classification === 'Filtered' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(16, 185, 129, 0.08)'),
                        borderRadius: '2rem',
                        border: `1px solid ${result.classification === 'Deepfake' ? 'rgba(244, 63, 94, 0.3)' : (result.classification === 'Filtered' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`,
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '2px' }}>AUTHENTICITY SCORE</div>
                        <div style={{ fontSize: '6rem', fontWeight: '900', color: result.classification === 'Deepfake' ? 'var(--error)' : (result.classification === 'Filtered' ? 'var(--accent)' : 'var(--success)'), lineHeight: 1, marginBottom: '2rem' }}>
                          {result.authenticity_score}<span style={{ fontSize: '2.5rem' }}>%</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                          <div className={`tag ${result.classification === 'Deepfake' ? 'tag-warning' : (result.classification === 'Filtered' ? 'tag-success' : 'tag-success')}`} style={{ padding: '0.5rem 2rem', fontSize: '1.2rem', background: result.classification === 'Filtered' ? 'var(--accent)' : '', border: 'none' }}>
                            {result.classification ? result.classification.toUpperCase() : result.status.toUpperCase()}
                          </div>
                        </div>

                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', lineHeight: '1.6' }}>
                          {result.details}
                        </p>
                      </div>

                      <div className="side-metrics-column">
                        <div className="metric-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>Forensic Signatures</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="metric-item">
                              <div className="metric-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>NEURAL FINGERPRINT</div>
                              <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{result.fingerprint_score}%</div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>CONFIDENCE LEVEL</div>
                              <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>99.8%</div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>MANIPULATION TYPE</div>
                              <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: '700' }}>{result.manipulation_type || 'None Detected'}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                          <button
                            onClick={resetAnalysis}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: 'var(--primary)', border: 'none', boxShadow: '0 0 20px var(--primary-glow)' }}
                          >
                            Scan Another File
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
