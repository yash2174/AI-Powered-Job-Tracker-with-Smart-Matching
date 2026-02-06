import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Briefcase, FileText, Star } from 'lucide-react';
import api from '../services/api';
import JobCard from './JobCard';

function Dashboard() {
  const [bestMatches, setBestMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, appsRes] = await Promise.all([
        api.getBestMatches(),
        api.getApplications()
      ]);

      setBestMatches(matchesRes.jobs || []);
      setApplications(appsRes.applications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0
    };

    applications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Track your job search progress</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
          <div style={styles.statIcon}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={styles.statValue}>{applications.length}</div>
            <div style={styles.statLabel}>Total Applications</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
          <div style={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div>
            <div style={styles.statValue}>{statusCounts.interview}</div>
            <div style={styles.statLabel}>Interviews</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
          <div style={styles.statIcon}>
            <Star size={24} />
          </div>
          <div>
            <div style={styles.statValue}>{statusCounts.offer}</div>
            <div style={styles.statLabel}>Offers</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardYellow }}>
          <div style={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={styles.statValue}>{bestMatches.length}</div>
            <div style={styles.statLabel}>Best Matches</div>
          </div>
        </div>
      </div>

      {/* Best Matches Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Best Matches For You</h2>
            <p style={styles.sectionSubtitle}>
              Top jobs based on your resume (match score &gt; 40%)
            </p>
          </div>
          <Link to="/jobs" style={styles.viewAllLink}>
            View All Jobs →
          </Link>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading best matches...</div>
        ) : bestMatches.length === 0 ? (
          <div style={styles.emptyState}>
            <Briefcase size={48} style={{ color: '#9ca3af' }} />
            <h3 style={styles.emptyTitle}>No matches yet</h3>
            <p style={styles.emptyText}>
              Upload your resume to see AI-powered job matches
            </p>
          </div>
        ) : (
          <div style={styles.jobsGrid}>
            {bestMatches.map(job => (
              <JobCard 
                key={job.id || job.adref} 
                job={job}
                onApplicationCreated={fetchData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Applications</h2>
            <Link to="/applications" style={styles.viewAllLink}>
              View All →
            </Link>
          </div>

          <div style={styles.applicationsList}>
            {applications.slice(0, 5).map(app => (
              <div key={app.id} style={styles.applicationItem}>
                <div style={styles.applicationInfo}>
                  <div style={styles.applicationTitle}>{app.jobTitle}</div>
                  <div style={styles.applicationCompany}>{app.company}</div>
                </div>
                <div style={styles.applicationStatus}>
                  <span style={getStatusStyle(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500'
  };

  const statusStyles = {
    applied: { background: '#dbeafe', color: '#1e40af' },
    interview: { background: '#fef3c7', color: '#92400e' },
    offer: { background: '#d1fae5', color: '#065f46' },
    rejected: { background: '#fee2e2', color: '#991b1b' }
  };

  return { ...baseStyle, ...statusStyles[status] };
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statCardBlue: {
    borderLeft: '4px solid #3b82f6'
  },
  statCardGreen: {
    borderLeft: '4px solid #10b981'
  },
  statCardPurple: {
    borderLeft: '4px solid #8b5cf6'
  },
  statCardYellow: {
    borderLeft: '4px solid #f59e0b'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  },
  section: {
    marginBottom: '40px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  },
  viewAllLink: {
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: '16px',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
  },
  applicationsList: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  applicationItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  applicationInfo: {
    flex: 1
  },
  applicationTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  applicationCompany: {
    fontSize: '13px',
    color: '#6b7280'
  },
  applicationStatus: {
    marginLeft: '16px'
  }
};

export default Dashboard;
