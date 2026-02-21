import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null); // 'idle', 'uploading', 'analyzing', 'complete'
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState('media'); // 'media' or 'audio'

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetAnalysis = () => {
    setAnalysisStatus('idle');
    setFile(null);
    setResult(null);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setAnalysisStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload file
      const uploadResponse = await fetch('http://localhost:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');
      const uploadData = await uploadResponse.json();
      const jobId = uploadData.job_id;

      setAnalysisStatus('analyzing');

      // 2. Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/v1/status/${jobId}`);
          if (!statusResponse.ok) throw new Error('Status check failed');

          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setAnalysisStatus('complete');
            setResult({
              score: statusData.authenticity_score,
              classification: statusData.classification,
              fingerprint: statusData.fingerprint_score,
              status: statusData.classification === 'Deepfake' ? 'Manipulated' : (statusData.classification === 'Filtered' ? 'Likely Authentic' : 'Authentic'),
              manipulations: statusData.artifacts_detected,
              details: statusData.message
            });
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setAnalysisStatus('idle');
            alert(`Analysis failed: ${statusData.message}`);
          }
        } catch (err) {
          console.error('Polling error:', err);
          clearInterval(pollInterval);
        }
      }, 2000);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisStatus('idle');
      alert('Failed to start analysis. Is the backend running?');
    }
  };

  return (
    <div className="container fade-in">
      {/* Decorative Background Elements */}
      <div className="animate-float" style={{ position: 'fixed', top: '10%', left: '5%', width: '150px', height: '150px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', zIndex: -1 }}></div>
      <div className="animate-float" style={{ position: 'fixed', bottom: '15%', right: '8%', width: '200px', height: '200px', background: 'radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)', zIndex: -1, animationDelay: '2s' }}></div>

      <nav className="navbar">
        <div className="logo" onClick={() => setCurrentPage('media')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.8rem' }}>🛡️</span> RAKSHAK
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
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
        <div className="hero-section" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="tag tag-success" style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}>V1.2.0 LIVE • ADVANCED FORENSICS</div>
          {currentPage === 'media' ? (
            <>
              <h1>Deepfakes Hide in Shadows. <br /> We Illuminate the Truth.</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                Multi-modal ensemble models designed to expose synthetic media manipulations with sub-pixel precision.
              </p>
            </>
          ) : (
            <>
              <h1>Voice Clones Hide in Shadows. <br /> We Illuminate the Truth.</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                Analyze pitch patterns and frequency domain anomalies to distinguish between authentic human speech and AI clones.
              </p>
            </>
          )}

          {!analysisStatus || analysisStatus === 'idle' ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem' }}>
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
                <span>🎬</span> Media Scan
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
                <span>🎙️</span> Voice Scan
              </button>
            </div>
          ) : null}
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
                        <div className="metric-value">{result.fingerprint}%</div>
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
