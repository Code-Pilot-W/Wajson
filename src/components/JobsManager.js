import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import './JobsManager.css';

function JobsManager() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
    department: 'fullstack',
    type: 'full-time',
    location: '',
    remote: false,
    experience: { min: 0, max: 5 },
    salary: { min: '', max: '', currency: 'USD' },
    benefits: '',
    applicationDeadline: '',
    contactEmail: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, statsResponse] = await Promise.all([
        jobsAPI.getAdminJobs(filters),
        jobsAPI.getStats()
      ]);

      if (jobsResponse.success) {
        setJobs(jobsResponse.jobs);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        responsibilities: formData.responsibilities.split('\n').filter(resp => resp.trim()),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        benefits: formData.benefits.split('\n').filter(benefit => benefit.trim()),
        salary: {
          min: formData.salary.min ? parseInt(formData.salary.min) : null,
          max: formData.salary.max ? parseInt(formData.salary.max) : null,
          currency: formData.salary.currency
        }
      };

      if (editingJob) {
        const response = await jobsAPI.updateJob(editingJob._id, jobData);
        if (response.success) {
          setError('');
          resetForm();
          fetchData();
        }
      } else {
        const response = await jobsAPI.createJob(jobData);
        if (response.success) {
          setError('');
          resetForm();
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      skills: job.skills.join(', '),
      department: job.department,
      type: job.type,
      location: job.location,
      remote: job.remote,
      experience: job.experience,
      salary: {
        min: job.salary?.min || '',
        max: job.salary?.max || '',
        currency: job.salary?.currency || 'USD'
      },
      benefits: job.benefits.join('\n'),
      applicationDeadline: job.applicationDeadline.split('T')[0],
      contactEmail: job.contactEmail,
      status: job.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await jobsAPI.deleteJob(jobId);
        if (response.success) {
          fetchData();
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      skills: '',
      department: 'fullstack',
      type: 'full-time',
      location: '',
      remote: false,
      experience: { min: 0, max: 5 },
      salary: { min: '', max: '', currency: 'USD' },
      benefits: '',
      applicationDeadline: '',
      contactEmail: '',
      status: 'draft'
    });
    setEditingJob(null);
    setShowCreateForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div className="jobs-manager">
      <div className="manager-header">
        <h2>Jobs Management</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-btn"
        >
          Create New Job
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <div className="stat-number">{stats.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="stat-number">{stats.active || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Applications</h3>
          <div className="stat-number">{stats.totalApplications || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <div className="stat-number">{stats.totalViews || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
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
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job' : 'Create New Job'}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="job-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-group">
                  <label>Job Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department:</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
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

                  <div className="form-group">
                    <label>Job Type:</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="remote"
                        checked={formData.remote}
                        onChange={handleChange}
                      />
                      Remote Work Available
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Job Description</h4>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Requirements (one per line):</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Responsibilities (one per line):</label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Develop user interfaces&#10;Collaborate with design team"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Skills (comma separated):</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, JavaScript, TypeScript"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Experience & Compensation</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Experience (years):</label>
                    <input
                      type="number"
                      name="experience.min"
                      value={formData.experience.min}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Experience (years):</label>
                    <input
                      type="number"
                      name="experience.max"
                      value={formData.experience.max}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Salary:</label>
                    <input
                      type="number"
                      name="salary.min"
                      value={formData.salary.min}
                      onChange={handleChange}
                      placeholder="50000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Salary:</label>
                    <input
                      type="number"
                      name="salary.max"
                      value={formData.salary.max}
                      onChange={handleChange}
                      placeholder="80000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency:</label>
                    <select
                      name="salary.currency"
                      value={formData.salary.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Benefits (one per line):</label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Health insurance&#10;Flexible working hours&#10;Professional development budget"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Application Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Application Deadline:</label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Email:</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="jobs-table">
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs found. Create your first job posting!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td>
                    <div className="job-title">
                      <strong>{job.title}</strong>
                      <div className="job-experience">{job.experience.min}-{job.experience.max} years</div>
                    </div>
                  </td>
                  <td>
                    <span className={`department-badge ${job.department}`}>
                      {job.department.replace('-', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`type-badge ${job.type}`}>
                      {job.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td>
                    {job.location}
                    {job.remote && <div className="remote-text">Remote OK</div>}
                  </td>
                  <td>
                    <span className={`status-badge ${job.status}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.applications}</td>
                  <td>{new Date(job.applicationDeadline).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(job)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(job._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default JobsManager;
