import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import './Careers.css';

function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    type: '',
    remote: '',
    search: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJobs(filters);
      if (response.success) {
        setJobs(response.jobs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const formatSalary = (job) => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) {
      return 'Competitive';
    }
    
    const format = (amount) => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
      return `$${amount}`;
    };
    
    if (job.salary.min && job.salary.max) {
      return `${format(job.salary.min)} - ${format(job.salary.max)}`;
    } else if (job.salary.min) {
      return `From ${format(job.salary.min)}`;
    } else if (job.salary.max) {
      return `Up to ${format(job.salary.max)}`;
    }
    
    return 'Competitive';
  };

  return (
    <div className="careers-container">
      <div className="careers-hero">
        <div className="hero-content">
          <h1>Join Our Team</h1>
          <p>Build the future of full-stack development with us</p>
        </div>
      </div>

      <div className="careers-content">
        <div className="filters-section">
          <h2>Find Your Perfect Role</h2>
          
          <div className="filters">
            <div className="filter-group">
              <label>Search Jobs:</label>
              <input
                type="text"
                placeholder="Search by title, skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Department:</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Full Stack</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
                <option value="ui-ux">UI/UX</option>
                <option value="qa">QA</option>
                <option value="project-management">Project Management</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type:</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Work Style:</label>
              <select
                value={filters.remote}
                onChange={(e) => handleFilterChange('remote', e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Remote</option>
                <option value="false">On-site</option>
              </select>
            </div>
          </div>
        </div>

        <div className="jobs-section">
          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <h3>
                      <Link to={`/careers/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <div className="job-meta">
                      <span className={`department-badge ${job.department}`}>
                        {job.department.replace('-', ' ')}
                      </span>
                      <span className={`type-badge ${job.type}`}>
                        {job.type.replace('-', ' ')}
                      </span>
                      {job.remote && <span className="remote-badge">Remote</span>}
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="detail-item">
                      <strong>Location:</strong> {job.location}
                    </div>
                    <div className="detail-item">
                      <strong>Experience:</strong> {job.experience.min}-{job.experience.max} years
                    </div>
                    <div className="detail-item">
                      <strong>Salary:</strong> {formatSalary(job)}
                    </div>
                  </div>

                  <div className="job-skills">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="skill-tag more">+{job.skills.length - 4} more</span>
                    )}
                  </div>

                  <div className="job-footer">
                    <div className="job-stats">
                      <span>{job.applications} applications</span>
                      <span>{job.views} views</span>
                    </div>
                    <div className="deadline">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>

                  <Link to={`/careers/${job.slug}`} className="apply-btn">
                    View Details & Apply
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="careers-cta">
        <div className="cta-content">
          <h2>Don't See Your Perfect Role?</h2>
          <p>We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.</p>
          <a href="mailto:careers@company.com" className="cta-btn">
            Send Your Resume
          </a>
        </div>
      </div>
    </div>
  );
}

export default Careers;
