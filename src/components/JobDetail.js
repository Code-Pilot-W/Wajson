import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import JobApplicationForm from './JobApplicationForm';
import './JobDetail.css';

function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [slug]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJob(slug);
      if (response.success) {
        setJob(response.job);
        // Check if user has already applied
        if (user) {
          checkApplicationStatus(response.job._id);
        }
      } else {
        setError('Job not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async (jobId) => {
    try {
      const response = await applicationsAPI.getMyApplications();
      if (response.success) {
        const existingApplication = response.applications.find(
          app => app.job._id === jobId
        );
        if (existingApplication) {
          setApplied(true);
          setApplicationStatus(existingApplication.status);
        }
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      const response = await applicationsAPI.submitApplication({
        jobId: job._id,
        ...applicationData
      });
      
      if (response.success) {
        setApplied(true);
        setApplicationStatus('pending');
        setShowApplicationForm(false);
        // Update job application count
        setJob(prev => ({ ...prev, applications: prev.applications + 1 }));
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) {
      return 'Competitive';
    }
    
    const format = (amount) => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
      return `$${amount}`;
    };
    
    if (salary.min && salary.max) {
      return `${format(salary.min)} - ${format(salary.max)} ${salary.currency || 'USD'}`;
    } else if (salary.min) {
      return `From ${format(salary.min)} ${salary.currency || 'USD'}`;
    } else if (salary.max) {
      return `Up to ${format(salary.max)} ${salary.currency || 'USD'}`;
    }
    
    return 'Competitive';
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="loading">Loading job details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/careers')} className="back-btn">
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="error-message">Job not found</div>
        <button onClick={() => navigate('/careers')} className="back-btn">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <button onClick={() => navigate('/careers')} className="back-btn">
          ← Back to Jobs
        </button>
        
        <div className="job-header-content">
          <h1>{job.title}</h1>
          <div className="job-meta">
            <div className="meta-badges">
              <span className={`department-badge ${job.department}`}>
                {job.department.replace('-', ' ')}
              </span>
              <span className={`type-badge ${job.type}`}>
                {job.type.replace('-', ' ')}
              </span>
              {job.remote && <span className="remote-badge">Remote</span>}
            </div>
            <div className="job-stats">
              <span>{job.applications} applications</span>
              <span>{job.views} views</span>
            </div>
          </div>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-main">
          <div className="job-section">
            <h2>Job Description</h2>
            <div className="job-description">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="job-section">
            <h2>Requirements</h2>
            <ul className="job-list">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>

          <div className="job-section">
            <h2>Responsibilities</h2>
            <ul className="job-list">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>

          <div className="job-section">
            <h2>Required Skills</h2>
            <div className="skills-grid">
              {job.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {job.benefits && job.benefits.length > 0 && (
            <div className="job-section">
              <h2>Benefits</h2>
              <ul className="job-list">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="job-sidebar">
          <div className="job-info-card">
            <h3>Job Information</h3>
            <div className="info-item">
              <strong>Location:</strong>
              <span>{job.location}</span>
            </div>
            <div className="info-item">
              <strong>Department:</strong>
              <span>{job.department.replace('-', ' ')}</span>
            </div>
            <div className="info-item">
              <strong>Job Type:</strong>
              <span>{job.type.replace('-', ' ')}</span>
            </div>
            <div className="info-item">
              <strong>Experience:</strong>
              <span>{job.experience.min}-{job.experience.max} years</span>
            </div>
            <div className="info-item">
              <strong>Salary:</strong>
              <span>{formatSalary(job.salary)}</span>
            </div>
            <div className="info-item">
              <strong>Application Deadline:</strong>
              <span>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Posted:</strong>
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="apply-section">
            {!user ? (
              <div className="login-prompt">
                <h3>Login Required</h3>
                <p>Please login to apply for this position</p>
                <button onClick={() => navigate('/login')} className="login-btn">
                  Login to Apply
                </button>
              </div>
            ) : applied ? (
              <div className="applied-message">
                <span className="success-icon">✓</span>
                <h3>Application Submitted!</h3>
                <p>Status: <span className={`status-badge ${applicationStatus}`}>{applicationStatus}</span></p>
                <p>We'll contact you at: <strong>{job.contactEmail}</strong></p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="apply-btn"
                >
                  Apply Now
                </button>
                <p className="contact-info">
                  Questions? Email us at <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onSubmit={handleApplicationSubmit}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
}

export default JobDetail;
