import React, { useState, useEffect } from 'react';
import { applicationsAPI, jobsAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import './ApplicationsManager.css';

function ApplicationsManager() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJobApplications();
    } else {
      fetchAllApplications();
    }
  }, [selectedJob, selectedStatus, pagination.current]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, jobsResponse] = await Promise.all([
        applicationsAPI.getApplicationsStats(),
        jobsAPI.getAdminJobs({ limit: 100 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs);
      }

      if (selectedJob) {
        fetchJobApplications();
      } else {
        fetchAllApplications();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      // Show message to select a specific job instead
      setApplications([]);
      setPagination({ current: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchJobApplications = async () => {
    try {
      const response = await applicationsAPI.getJobApplications(selectedJob, {
        status: selectedStatus,
        page: pagination.current,
        limit: 10
      });
      
      if (response.success) {
        setApplications(response.applications);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      const response = await applicationsAPI.updateApplicationStatus(applicationId, newStatus, notes);
      
      if (response.success) {
        // Update the application in the list
        setApplications(prev => prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus, reviewedAt: new Date(), adminNotes: notes }
            : app
        ));
        
        // Refresh stats
        const statsResponse = await applicationsAPI.getApplicationsStats();
        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      reviewing: '#007bff',
      shortlisted: '#28a745',
      interview: '#6f42c1',
      hired: '#198754',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const downloadCV = (application) => {
    if (application.documents?.cv?.path) {
      const baseUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
      window.open(`${baseUrl}${application.documents.cv.path}`, '_blank');
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="applications-manager">
      <div className="manager-header">
        <h2>Job Applications</h2>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total || 0}</span>
            <span className="stat-label">Total Applications</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.pending || 0}</span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.hired || 0}</span>
            <span className="stat-label">Hired</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Job:</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applications} applications)
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="no-applications">
            <h3>{selectedJob ? 'No applications found' : 'Select a Job'}</h3>
            <p>{selectedJob ? 'No applications match your current filters.' : 'Please select a specific job from the dropdown to view its applications.'}</p>
          </div>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Experience</th>
                  <th>CV</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application._id}>
                    <td>
                      <div className="applicant-info">
                        <div className="applicant-avatar">
                          {application.applicant?.profile?.profileImage ? (
                            <img 
                              src={getImageUrl(application.applicant.profile.profileImage)} 
                              alt="Profile" 
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {application.personalInfo?.firstName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="applicant-details">
                          <div className="applicant-name">
                            {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                          </div>
                          <div className="applicant-email">{application.personalInfo?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="job-info">
                        <div className="job-title">{application.job?.title}</div>
                        <div className="job-department">{application.job?.department}</div>
                      </div>
                    </td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(application.status) }}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td>{application.professionalInfo?.experience} years</td>
                    <td>
                      {application.documents?.cv && (
                        <button 
                          onClick={() => downloadCV(application)}
                          className="download-btn"
                        >
                          📄 Download CV
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                              className="action-btn review-btn"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                              className="action-btn shortlist-btn"
                            >
                              Shortlist
                            </button>
                          </>
                        )}
                        {application.status === 'reviewing' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                              className="action-btn shortlist-btn"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                              className="action-btn reject-btn"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'interview')}
                              className="action-btn interview-btn"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                              className="action-btn reject-btn"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'interview' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'hired')}
                              className="action-btn hire-btn"
                            >
                              Hire
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                              className="action-btn reject-btn"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              disabled={pagination.current === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {pagination.current} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              disabled={pagination.current === pagination.pages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationsManager;
