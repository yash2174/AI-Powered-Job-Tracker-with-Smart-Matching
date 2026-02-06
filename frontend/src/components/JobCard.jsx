import React, { useState } from 'react';
import { ExternalLink, MapPin, Briefcase, Calendar, DollarSign, Info } from 'lucide-react';
import api from '../services/api';

function JobCard({ job, onApplicationCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleApplyClick = () => {
    // Open job URL in new tab
    window.open(job.redirect_url, '_blank');
    
    // Show application prompt after a short delay
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  };

  const handleApplicationResponse = async (didApply) => {
    if (didApply) {
      try {
        await api.createApplication({
          jobId: job.id || job.adref,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.redirect_url,
          status: didApply === 'earlier' ? 'applied' : 'applied'
        });
        
        if (onApplicationCreated) {
          onApplicationCreated();
        }
      } catch (error) {
        console.error('Error creating application:', error);
      }
    }
    
    setShowModal(false);
  };

  const getMatchBadge = () => {
    const score = job.matchScore || 0;
    let color, bgColor, label;

    if (score > 70) {
      color = '#065f46';
      bgColor = '#d1fae5';
      label = 'Great Match';
    } else if (score >= 40) {
      color = '#92400e';
      bgColor = '#fef3c7';
      label = 'Good Match';
    } else {
      color = '#4b5563';
      bgColor = '#f3f4f6';
      label = 'Low Match';
    }

    return { color, bgColor, label, score };
  };

  const matchBadge = getMatchBadge();
  const salaryRange = job.salary_min && job.salary_max 
    ? `₹${(job.salary_min / 100000).toFixed(1)}L - ₹${(job.salary_max / 100000).toFixed(1)}L`
    : 'Not specified';

  const contractTypeMap = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship'
  };

  const postedDate = job.created ? new Date(job.created).toLocaleDateString() : 'Recently';

  return (
    <>
      <div style={styles.card}>
        {/* Match Badge */}
        {job.matchScore > 0 && (
          <div 
            style={{
              ...styles.matchBadge,
              background: matchBadge.bgColor,
              color: matchBadge.color
            }}
          >
            <span style={styles.matchScore}>{matchBadge.score}%</span>
            <span>{matchBadge.label}</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={styles.infoBtn}
              title="View match details"
            >
              <Info size={14} />
            </button>
          </div>
        )}

        {/* Job Details */}
        <div style={styles.content}>
          <h3 style={styles.jobTitle}>{job.title}</h3>
          <div style={styles.company}>{job.company}</div>

          <div style={styles.metadata}>
            <div style={styles.metaItem}>
              <MapPin size={14} style={{ color: '#6b7280' }} />
              <span>{job.location}</span>
            </div>
            <div style={styles.metaItem}>
              <Briefcase size={14} style={{ color: '#6b7280' }} />
              <span>{contractTypeMap[job.contract_type] || 'Full-time'}</span>
            </div>
            <div style={styles.metaItem}>
              <DollarSign size={14} style={{ color: '#6b7280' }} />
              <span>{salaryRange}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={14} style={{ color: '#6b7280' }} />
              <span>{postedDate}</span>
            </div>
          </div>

          <p style={styles.description}>
            {job.description.substring(0, 150)}...
          </p>

          {/* Match Details */}
          {showDetails && job.matchDetails && (
            <div style={styles.matchDetails}>
              <div style={styles.matchDetailSection}>
                <strong>Matching Skills:</strong>
                <div style={styles.skills}>
                  {job.matchDetails.matchingSkills.slice(0, 5).map((skill, idx) => (
                    <span key={idx} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
              <div style={styles.matchDetailText}>
                <strong>Why this matches:</strong> {job.matchDetails.explanation}
              </div>
            </div>
          )}

          <button onClick={handleApplyClick} style={styles.applyBtn}>
            <ExternalLink size={16} />
            Apply Now
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              Did you apply to {job.title} at {job.company}?
            </h3>
            <div style={styles.modalButtons}>
              <button
                onClick={() => handleApplicationResponse('yes')}
                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
              >
                Yes, Applied
              </button>
              <button
                onClick={() => handleApplicationResponse('earlier')}
                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
              >
                Applied Earlier
              </button>
              <button
                onClick={() => handleApplicationResponse('no')}
                style={{ ...styles.modalBtn, ...styles.modalBtnGhost }}
              >
                No, Just Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'all 0.2s',
    border: '1px solid #e5e7eb',
    position: 'relative'
  },
  matchBadge: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  matchScore: {
    fontSize: '15px',
    fontWeight: 'bold'
  },
  infoBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    opacity: 0.7
  },
  content: {
    padding: '20px'
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  company: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px'
  },
  metadata: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6b7280'
  },
  description: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  matchDetails: {
    background: '#f9fafb',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px'
  },
  matchDetailSection: {
    marginBottom: '12px'
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px'
  },
  skillTag: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  matchDetailText: {
    lineHeight: '1.5',
    color: '#4b5563'
  },
  applyBtn: {
    width: '100%',
    padding: '10px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px',
    lineHeight: '1.4'
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  modalBtn: {
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalBtnPrimary: {
    background: '#4f46e5',
    color: 'white'
  },
  modalBtnSecondary: {
    background: '#e0e7ff',
    color: '#4f46e5'
  },
  modalBtnGhost: {
    background: '#f3f4f6',
    color: '#6b7280'
  }
};

export default JobCard;
