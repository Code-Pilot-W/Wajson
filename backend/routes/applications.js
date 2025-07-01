const express = require('express');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadMultiple, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/applications
// @desc    Submit job application
// @access  Private
router.post('/', auth, uploadMultiple([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      jobId,
      personalInfo,
      professionalInfo,
      links,
      message
    } = req.body;

    // Parse JSON strings if they come as strings
    const parsedPersonalInfo = typeof personalInfo === 'string' ? JSON.parse(personalInfo) : personalInfo;
    const parsedProfessionalInfo = typeof professionalInfo === 'string' ? JSON.parse(professionalInfo) : professionalInfo;
    const parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;

    // Validate required fields
    if (!jobId || !parsedPersonalInfo || !parsedProfessionalInfo) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, personal info, and professional info are required'
      });
    }

    // Check if job exists and is accepting applications
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isAcceptingApplications()) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Validate CV file is uploaded
    if (!req.files || !req.files.cv || req.files.cv.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }

    // Prepare documents
    const documents = {};
    
    if (req.files.cv && req.files.cv[0]) {
      const cvFile = req.files.cv[0];
      documents.cv = {
        filename: cvFile.filename,
        originalName: cvFile.originalname,
        path: getFileUrl(cvFile.filename, 'document'),
        size: cvFile.size
      };
    }

    if (req.files.coverLetter && req.files.coverLetter[0]) {
      const coverLetterFile = req.files.coverLetter[0];
      documents.coverLetter = {
        filename: coverLetterFile.filename,
        originalName: coverLetterFile.originalname,
        path: getFileUrl(coverLetterFile.filename, 'document'),
        size: coverLetterFile.size
      };
    }

    // Create job application
    const application = new JobApplication({
      job: jobId,
      applicant: req.user._id,
      personalInfo: parsedPersonalInfo,
      professionalInfo: parsedProfessionalInfo,
      links: parsedLinks || {},
      documents,
      message: message || ''
    });

    await application.save();

    // Increment job applications count
    await job.incrementApplications();

    // Populate the application for response
    const populatedApplication = await JobApplication.findById(application._id)
      .populate('job', 'title department')
      .populate('applicant', 'username email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApplication
    });

  } catch (error) {
    console.error('Submit application error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
});

// @route   GET /api/applications/my
// @desc    Get user's applications
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const applications = await JobApplication.getUserApplications(
      req.user._id,
      {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }
    );

    const total = await JobApplication.countDocuments({ applicant: req.user._id });

    res.json({
      success: true,
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job (Admin only)
// @access  Private/Admin
router.get('/job/:jobId', auth, adminAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;
    
    const applications = await JobApplication.getJobApplications(
      jobId,
      {
        status: status || null,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }
    );

    let query = { job: jobId };
    if (status) query.status = status;
    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get application details (Admin only)
// @access  Private/Admin
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'title department company location')
      .populate('applicant', 'username email profile createdAt')
      .populate('reviewedBy', 'username email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await JobApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.updateStatus(status, req.user._id, notes);

    const updatedApplication = await JobApplication.findById(application._id)
      .populate('job', 'title department')
      .populate('applicant', 'username email profile')
      .populate('reviewedBy', 'username email');

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/stats/overview
// @desc    Get applications statistics (Admin only)
// @access  Private/Admin
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const totalApplications = await JobApplication.countDocuments();
    const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
    const reviewingApplications = await JobApplication.countDocuments({ status: 'reviewing' });
    const shortlistedApplications = await JobApplication.countDocuments({ status: 'shortlisted' });
    const hiredApplications = await JobApplication.countDocuments({ status: 'hired' });
    const rejectedApplications = await JobApplication.countDocuments({ status: 'rejected' });

    // Applications by status
    const statusStats = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApplications = await JobApplication.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total: totalApplications,
        pending: pendingApplications,
        reviewing: reviewingApplications,
        shortlisted: shortlistedApplications,
        hired: hiredApplications,
        rejected: rejectedApplications,
        recent: recentApplications,
        statusBreakdown: statusStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get applications stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
