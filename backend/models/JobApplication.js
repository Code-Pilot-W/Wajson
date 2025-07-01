const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    }
  },
  professionalInfo: {
    currentPosition: {
      type: String,
      required: [true, 'Current position is required'],
      trim: true
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    expectedSalary: {
      type: Number,
      min: 0
    },
    availableStartDate: {
      type: Date,
      required: [true, 'Available start date is required']
    }
  },
  links: {
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/.*/.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    },
    portfolio: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.*/.test(v);
        },
        message: 'Please enter a valid portfolio URL'
      }
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?github\.com\/.*/.test(v);
        },
        message: 'Please enter a valid GitHub URL'
      }
    }
  },
  documents: {
    cv: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    coverLetter: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Virtual for full name
jobApplicationSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Instance method to update status
jobApplicationSchema.methods.updateStatus = function(status, reviewerId, notes) {
  this.status = status;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.adminNotes = notes;
  }
  return this.save();
};

// Static method to get applications for a job
jobApplicationSchema.statics.getJobApplications = function(jobId, options = {}) {
  const { status = null, limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
  
  let query = { job: jobId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('applicant', 'username email profile.profileImage createdAt')
    .populate('job', 'title department')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to get applications by user
jobApplicationSchema.statics.getUserApplications = function(userId, options = {}) {
  const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
  
  return this.find({ applicant: userId })
    .populate('job', 'title department company location status applicationDeadline')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
