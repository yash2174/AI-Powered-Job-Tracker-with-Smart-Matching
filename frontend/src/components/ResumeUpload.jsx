import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import api from '../services/api';

function ResumeUpload({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only PDF and TXT files are supported');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await api.uploadResume(file);
      setSuccess(true);
      setTimeout(() => {
        onUploaded();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Upload Your Resume</h2>
            <p style={styles.subtitle}>Get AI-powered job matching based on your experience</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {!success ? (
            <>
              <div style={styles.uploadArea}>
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                <label htmlFor="resume-upload" style={styles.uploadLabel}>
                  {file ? (
                    <div style={styles.fileInfo}>
                      <FileText size={32} style={{ color: '#4f46e5' }} />
                      <div>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileSize}>
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} style={{ color: '#9ca3af' }} />
                      <div style={styles.uploadText}>
                        Click to upload or drag and drop
                      </div>
                      <div style={styles.uploadHint}>PDF or TXT (max 10MB)</div>
                    </>
                  )}
                </label>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.benefits}>
                <h3 style={styles.benefitsTitle}>Why upload your resume?</h3>
                <ul style={styles.benefitsList}>
                  <li>✓ Get AI match scores for every job (0-100%)</li>
                  <li>✓ See which skills match each position</li>
                  <li>✓ Discover best job opportunities for you</li>
                  <li>✓ Save time with smart filtering</li>
                </ul>
              </div>

              <div style={styles.actions}>
                <button onClick={onClose} style={styles.cancelBtn}>
                  Skip for now
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  style={{
                    ...styles.uploadBtn,
                    ...((!file || uploading) ? styles.uploadBtnDisabled : {})
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </div>
            </>
          ) : (
            <div style={styles.successContent}>
              <CheckCircle size={64} style={{ color: '#10b981' }} />
              <h3 style={styles.successTitle}>Resume Uploaded!</h3>
              <p style={styles.successText}>
                Your resume has been processed. You'll now see AI match scores for all jobs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px'
  },
  content: {
    padding: '24px'
  },
  uploadArea: {
    marginBottom: '20px'
  },
  fileInput: {
    display: 'none'
  },
  uploadLabel: {
    display: 'block',
    padding: '40px 20px',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  fileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
  },
  fileSize: {
    fontSize: '14px',
    color: '#6b7280'
  },
  uploadText: {
    fontSize: '16px',
    color: '#374151',
    marginTop: '12px',
    fontWeight: '500'
  },
  uploadHint: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  error: {
    padding: '12px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  benefits: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  benefitsList: {
    listStyle: 'none',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '2'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  uploadBtn: {
    padding: '10px 20px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },
  uploadBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  successContent: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: '16px',
    marginBottom: '8px'
  },
  successText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6'
  }
};

export default ResumeUpload;
