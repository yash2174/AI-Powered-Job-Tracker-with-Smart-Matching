import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../services/api';
import JobCard from './JobCard';

function JobFeed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    jobType: '',
    workMode: '',
    matchScore: 'all',
    datePosted: 'any'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Listen for AI filter changes
  useEffect(() => {
    const handleAIFilter = (event) => {
      const aiFilters = event.detail;
      
      if (aiFilters.clear) {
        // Clear all filters
        setFilters({
          query: '',
          location: '',
          jobType: '',
          workMode: '',
          matchScore: 'all',
          datePosted: 'any'
        });
      } else {
        // Apply AI filters
        setFilters(prev => ({
          ...prev,
          ...(aiFilters.workMode && { workMode: aiFilters.workMode }),
          ...(aiFilters.jobType && { jobType: aiFilters.jobType }),
          ...(aiFilters.location && { location: aiFilters.location }),
          ...(aiFilters.matchScore && { matchScore: aiFilters.matchScore })
        }));
      }
    };

    window.addEventListener('aiFilterChange', handleAIFilter);
    return () => window.removeEventListener('aiFilterChange', handleAIFilter);
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(debounce);
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.searchJobs({
        query: filters.query,
        location: filters.location,
        jobType: filters.jobType === 'full_time' ? 'full_time' : 
                 filters.jobType === 'part_time' ? 'part_time' :
                 filters.jobType === 'contract' ? 'contract' :
                 filters.jobType === 'internship' ? 'internship' : ''
      });

      let filteredJobs = response.jobs || [];

      // Apply client-side filters
      if (filters.workMode) {
        if (filters.workMode === 'remote') {
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes('remote') || 
            job.title.toLowerCase().includes('remote')
          );
        } else if (filters.workMode === 'hybrid') {
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes('hybrid') ||
            job.description.toLowerCase().includes('hybrid')
          );
        } else if (filters.workMode === 'onsite') {
          filteredJobs = filteredJobs.filter(job => 
            !job.location.toLowerCase().includes('remote') &&
            !job.location.toLowerCase().includes('hybrid')
          );
        }
      }

      // Match score filter
      if (filters.matchScore === 'high') {
        filteredJobs = filteredJobs.filter(job => job.matchScore > 70);
      } else if (filters.matchScore === 'medium') {
        filteredJobs = filteredJobs.filter(job => job.matchScore >= 40 && job.matchScore <= 70);
      }

      // Date filter
      if (filters.datePosted !== 'any') {
        const now = new Date();
        const cutoffDays = filters.datePosted === '24h' ? 1 :
                          filters.datePosted === 'week' ? 7 :
                          filters.datePosted === 'month' ? 30 : 0;
        
        if (cutoffDays > 0) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.created) return true;
            const jobDate = new Date(job.created);
            const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= cutoffDays;
          });
        }
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      jobType: '',
      workMode: '',
      matchScore: 'all',
      datePosted: 'any'
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all' && v !== 'any');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Feed</h1>
          <p style={styles.subtitle}>
            Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
        >
          <Filter size={18} />
          Filters
          {hasActiveFilters && <span style={styles.filterBadge}>•</span>}
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <div style={styles.searchInput}>
          <Search size={18} style={{ color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by job title or skills..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.locationInput}>
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                style={styles.select}
              >
                <option value="">All Types</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Work Mode</label>
              <select
                value={filters.workMode}
                onChange={(e) => handleFilterChange('workMode', e.target.value)}
                style={styles.select}
              >
                <option value="">All Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Match Score</label>
              <select
                value={filters.matchScore}
                onChange={(e) => handleFilterChange('matchScore', e.target.value)}
                style={styles.select}
              >
                <option value="all">All Matches</option>
                <option value="high">High (&gt;70%)</option>
                <option value="medium">Medium (40-70%)</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Date Posted</label>
              <select
                value={filters.datePosted}
                onChange={(e) => handleFilterChange('datePosted', e.target.value)}
                style={styles.select}
              >
                <option value="any">Any Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} style={styles.clearBtn}>
              <X size={14} />
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div style={styles.loading}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No jobs found</h3>
          <p style={styles.emptyText}>
            Try adjusting your filters or search criteria
          </p>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {jobs.map(job => (
            <JobCard key={job.id || job.adref} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
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
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    position: 'relative'
  },
  filterBadge: {
    color: '#4f46e5',
    fontSize: '20px',
    lineHeight: '1'
  },
  searchBar: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '12px',
    marginBottom: '20px'
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  locationInput: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1f2937'
  },
  filtersPanel: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb'
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1f2937',
    outline: 'none',
    background: 'white'
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
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
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280'
  }
};

export default JobFeed;
