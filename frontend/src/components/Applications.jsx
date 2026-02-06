import React, { useState, useEffect } from 'react';
import { Clock, MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.getApplications();
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus, note = '') => {
    setUpdatingStatus(appId);
    try {
      await api.updateApplication(appId, {
        status: newStatus,
        note: note || `Status updated to ${newStatus}`
      });
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['applied', 'interview', 'offer', 'rejected'];
    return allStatuses.filter(s => s !== currentStatus);
  };

  const getStatusStyle = (status) => {
    const styles = {
      applied: { bg: '#dbeafe', color: '#1e40af', label: 'Applied' },
      interview: { bg: '#fef3c7', color: '#92400e', label: 'Interview' },
      offer: { bg: '#d1fae5', color: '#065f46', label: 'Offer' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' }
    };
    return styles[status] || styles.applied;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupByStatus = () => {
    const groups = {
      applied: [],
      interview: [],
      offer: [],
      rejected: []
    };

    applications.forEach(app => {
      if (groups[app.status]) {
        groups[app.status].push(app);
      }
    });

    return groups;
  };

  const grouped = groupByStatus();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading applications...</div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Applications</h1>
        <div style={styles.emptyState}>
          <Clock size={48} style={{ color: '#9ca3af' }} />
          <h3 style={styles.emptyTitle}>No applications yet</h3>
          <p style={styles.emptyText}>
            Start applying to jobs to track your progress here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Applications</h1>
          <p style={styles.subtitle}>Track and manage your job applications</p>
        </div>
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{applications.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{grouped.interview.length}</span>
            <span style={styles.statLabel}>Interviews</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{grouped.offer.length}</span>
            <span style={styles.statLabel}>Offers</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={styles.kanban}>
        {Object.entries(grouped).map(([status, apps]) => {
          const statusStyle = getStatusStyle(status);
          return (
            <div key={status} style={styles.column}>
              <div style={styles.columnHeader}>
                <div
                  style={{
                    ...styles.columnBadge,
                    background: statusStyle.bg,
                    color: statusStyle.color
                  }}
                >
                  {statusStyle.label}
                </div>
                <span style={styles.columnCount}>{apps.length}</span>
              </div>

              <div style={styles.columnContent}>
                {apps.map(app => (
                  <div key={app.id} style={styles.appCard}>
                    <div style={styles.appHeader}>
                      <h3 style={styles.appTitle}>{app.jobTitle}</h3>
                      <button
                        onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                        style={styles.expandBtn}
                      >
                        {expandedApp === app.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <div style={styles.appCompany}>{app.company}</div>
                    
                    <div style={styles.appMeta}>
                      <div style={styles.metaItem}>
                        <MapPin size={12} />
                        <span>{app.location}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <Clock size={12} />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.viewJobLink}
                      >
                        <ExternalLink size={12} />
                        View Job Posting
                      </a>
                    )}

                    {expandedApp === app.id && (
                      <div style={styles.expandedContent}>
                        {/* Timeline */}
                        <div style={styles.timeline}>
                          <div style={styles.timelineTitle}>Timeline</div>
                          {app.timeline && app.timeline.slice().reverse().map((event, idx) => (
                            <div key={idx} style={styles.timelineItem}>
                              <div style={styles.timelineDot} />
                              <div style={styles.timelineContent}>
                                <div style={styles.timelineStatus}>
                                  {getStatusStyle(event.status).label}
                                </div>
                                <div style={styles.timelineDate}>
                                  {formatDate(event.date)}
                                </div>
                                {event.note && (
                                  <div style={styles.timelineNote}>{event.note}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Status Update */}
                        <div style={styles.statusUpdate}>
                          <div style={styles.statusUpdateTitle}>Update Status:</div>
                          <div style={styles.statusButtons}>
                            {getStatusOptions(app.status).map(newStatus => {
                              const statusStyle = getStatusStyle(newStatus);
                              return (
                                <button
                                  key={newStatus}
                                  onClick={() => handleStatusUpdate(app.id, newStatus)}
                                  disabled={updatingStatus === app.id}
                                  style={{
                                    ...styles.statusBtn,
                                    background: statusStyle.bg,
                                    color: statusStyle.color
                                  }}
                                >
                                  {statusStyle.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {apps.length === 0 && (
                  <div style={styles.emptyColumn}>No applications</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280'
  },
  stats: {
    display: 'flex',
    gap: '24px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '2px'
  },
  kanban: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    alignItems: 'start'
  },
  column: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '16px',
    minHeight: '400px'
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  columnBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600'
  },
  columnCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600'
  },
  columnContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  appCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px'
  },
  appTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    flex: 1
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    padding: '4px',
    cursor: 'pointer'
  },
  appCompany: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '12px'
  },
  appMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6b7280'
  },
  viewJobLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500'
  },
  expandedContent: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  timeline: {
    marginBottom: '16px'
  },
  timelineTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    position: 'relative'
  },
  timelineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4f46e5',
    marginTop: '6px',
    flexShrink: 0
  },
  timelineContent: {
    flex: 1
  },
  timelineStatus: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937'
  },
  timelineDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  timelineNote: {
    fontSize: '12px',
    color: '#4b5563',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  statusUpdate: {
    background: '#f9fafb',
    padding: '12px',
    borderRadius: '6px'
  },
  statusUpdateTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  statusButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  statusBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyColumn: {
    textAlign: 'center',
    padding: '40px 20px',
    fontSize: '13px',
    color: '#9ca3af'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    fontSize: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: '16px',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280'
  }
};

export default Applications;
