import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './JobApplicationForm.css';

function JobApplicationForm({ job, onSubmit, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || ''
    },
    professionalInfo: {
      currentPosition: '',
      experience: '',
      expectedSalary: '',
      availableStartDate: ''
    },
    links: {
      linkedin: user?.profile?.socialLinks?.linkedin || '',
      portfolio: user?.profile?.socialLinks?.portfolio || '',
      github: user?.profile?.socialLinks?.github || ''
    },
    message: '',
    cv: null,
    coverLetter: null
  });

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const { firstName, lastName, email, phone } = formData.personalInfo;
        return firstName && lastName && email && phone;
      case 2:
        const { currentPosition, experience, availableStartDate } = formData.professionalInfo;
        return currentPosition && experience && availableStartDate;
      case 3:
        return formData.cv; // CV is required
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setError('');
      setStep(step + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      setError('Please complete all required fields');
      return;
    }

    if (!formData.cv) {
      setError('CV file is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await onSubmit(formData);
      
      if (response.success) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.personalInfo.firstName}
            onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.personalInfo.lastName}
            onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.personalInfo.phone}
            onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Professional Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Current Position *</label>
          <input
            type="text"
            value={formData.professionalInfo.currentPosition}
            onChange={(e) => handleChange('professionalInfo', 'currentPosition', e.target.value)}
            placeholder="e.g., Senior Software Developer"
            required
          />
        </div>
        <div className="form-group">
          <label>Years of Experience *</label>
          <input
            type="number"
            min="0"
            value={formData.professionalInfo.experience}
            onChange={(e) => handleChange('professionalInfo', 'experience', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Expected Salary</label>
          <input
            type="number"
            min="0"
            value={formData.professionalInfo.expectedSalary}
            onChange={(e) => handleChange('professionalInfo', 'expectedSalary', e.target.value)}
            placeholder="Annual salary expectation"
          />
        </div>
        <div className="form-group">
          <label>Available Start Date *</label>
          <input
            type="date"
            value={formData.professionalInfo.availableStartDate}
            onChange={(e) => handleChange('professionalInfo', 'availableStartDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Professional Links</label>
        <div className="links-grid">
          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              value={formData.links.linkedin}
              onChange={(e) => handleChange('links', 'linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="form-group">
            <label>Portfolio Website</label>
            <input
              type="url"
              value={formData.links.portfolio}
              onChange={(e) => handleChange('links', 'portfolio', e.target.value)}
              placeholder="https://your-portfolio.com"
            />
          </div>
          <div className="form-group">
            <label>GitHub Profile</label>
            <input
              type="url"
              value={formData.links.github}
              onChange={(e) => handleChange('links', 'github', e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Documents & Additional Information</h3>
      
      <div className="form-group">
        <label>CV/Resume * (PDF, DOC, DOCX - Max 10MB)</label>
        <div className="file-upload">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange('cv', e.target.files[0])}
            className="file-input"
            id="cv-upload"
            required
          />
          <label htmlFor="cv-upload" className="file-label">
            {formData.cv ? formData.cv.name : 'Choose CV file'}
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Cover Letter (Optional - PDF, DOC, DOCX - Max 10MB)</label>
        <div className="file-upload">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange('coverLetter', e.target.files[0])}
            className="file-input"
            id="cover-letter-upload"
          />
          <label htmlFor="cover-letter-upload" className="file-label">
            {formData.coverLetter ? formData.coverLetter.name : 'Choose cover letter file'}
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Additional Message (Optional)</label>
        <textarea
          value={formData.message}
          onChange={(e) => handleChange(null, 'message', e.target.value)}
          placeholder="Tell us why you're interested in this position..."
          rows="4"
          maxLength="1000"
        />
        <small>{formData.message.length}/1000 characters</small>
      </div>
    </div>
  );

  return (
    <div className="application-modal-overlay">
      <div className="application-modal">
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span>1</span>
            <label>Personal</label>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span>2</span>
            <label>Professional</label>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <span>3</span>
            <label>Documents</label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          {error && <div className="error-message">{error}</div>}
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="form-actions">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="back-btn">
                Back
              </button>
            )}
            
            <div className="right-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="next-btn">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplicationForm;
