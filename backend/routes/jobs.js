const express = require('express');
const Job = require('../models/Job');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, department = '', type = '', remote = '', search = '' } = req.query;
    
    let query = { 
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    };
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (remote !== '') {
      query.remote = remote === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-description -requirements -responsibilities'); // Exclude full details for list view

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/admin
// @desc    Get all jobs for admin (Admin only)
// @access  Private/Admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', department = '', search = '' } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Get admin jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/stats
// @desc    Get job statistics (Admin only)
// @access  Private/Admin
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const total = await Job.countDocuments();
    const active = await Job.countDocuments({ status: 'active' });
    const draft = await Job.countDocuments({ status: 'draft' });
    const closed = await Job.countDocuments({ status: 'closed' });
    const paused = await Job.countDocuments({ status: 'paused' });
    
    // Jobs by department
    const departments = await Job.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    // Jobs by type
    const types = await Job.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Total applications
    const applicationsResult = await Job.aggregate([
      { $group: { _id: null, totalApplications: { $sum: '$applications' } } }
    ]);
    const totalApplications = applicationsResult.length > 0 ? applicationsResult[0].totalApplications : 0;
    
    // Total views
    const viewsResult = await Job.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    res.json({
      success: true,
      stats: {
        total,
        active,
        draft,
        closed,
        paused,
        totalApplications,
        totalViews,
        departments: departments.reduce((acc, dept) => {
          acc[dept._id] = dept.count;
          return acc;
        }, {}),
        types: types.reduce((acc, type) => {
          acc[type._id] = type.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/:slug
// @desc    Get single job by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ 
      slug: req.params.slug,
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    }).populate('postedBy', 'username email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications'
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job posting (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      responsibilities,
      skills,
      department,
      type,
      location,
      remote,
      experience,
      salary,
      benefits,
      applicationDeadline,
      contactEmail,
      status
    } = req.body;

    // Validation
    if (!title || !description || !requirements || !responsibilities || !skills) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, requirements, responsibilities, and skills are required'
      });
    }

    if (!department || !type || !location || !applicationDeadline || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Department, type, location, application deadline, and contact email are required'
      });
    }

    if (!experience || !experience.min || !experience.max) {
      return res.status(400).json({
        success: false,
        message: 'Experience range (min and max) is required'
      });
    }

    const job = new Job({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities],
      skills: Array.isArray(skills) ? skills : [skills],
      department,
      type,
      location,
      remote: remote || false,
      experience,
      salary: salary || {},
      benefits: Array.isArray(benefits) ? benefits : (benefits ? [benefits] : []),
      applicationDeadline: new Date(applicationDeadline),
      contactEmail,
      postedBy: req.user._id,
      status: status || 'draft'
    });

    await job.save();

    const populatedJob = await Job.findById(job._id).populate('postedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job: populatedJob
    });

  } catch (error) {
    console.error('Create job error:', error);
    
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

// @route   PUT /api/jobs/:id
// @desc    Update job posting (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update fields
    const updateFields = [
      'title', 'description', 'requirements', 'responsibilities', 'skills',
      'department', 'type', 'location', 'remote', 'experience', 'salary',
      'benefits', 'applicationDeadline', 'contactEmail', 'status'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'applicationDeadline') {
          job[field] = new Date(req.body[field]);
        } else {
          job[field] = req.body[field];
        }
      }
    });

    await job.save();

    const updatedJob = await Job.findById(job._id).populate('postedBy', 'username email');

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      job: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);
    
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

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job (increment application count)
// @access  Public
router.post('/:id/apply', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
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

    await job.incrementApplications();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      contactEmail: job.contactEmail
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
