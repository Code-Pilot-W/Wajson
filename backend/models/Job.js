const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  requirements: [{
    type: String,
    required: true,
    trim: true
  }],
  responsibilities: [{
    type: String,
    required: true,
    trim: true
  }],
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'ui-ux', 'qa', 'project-management'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  experience: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  salary: {
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'NGN']
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'draft'
  },
  applications: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
jobSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }
  next();
});

// Virtual for formatted salary range
jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Competitive';
  
  const format = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  
  if (this.salary.min && this.salary.max) {
    return `${format(this.salary.min)} - ${format(this.salary.max)} ${this.salary.currency}`;
  } else if (this.salary.min) {
    return `From ${format(this.salary.min)} ${this.salary.currency}`;
  } else if (this.salary.max) {
    return `Up to ${format(this.salary.max)} ${this.salary.currency}`;
  }
  
  return 'Competitive';
});

// Static method to get active jobs
jobSchema.statics.getActive = function(options = {}) {
  const { limit = 10, skip = 0, department = null, type = null, remote = null, sort = { createdAt: -1 } } = options;
  
  let query = { 
    status: 'active',
    applicationDeadline: { $gte: new Date() }
  };
  
  if (department) query.department = department;
  if (type) query.type = type;
  if (remote !== null) query.remote = remote;
  
  return this.find(query)
    .populate('postedBy', 'username email')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Instance method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

// Instance method to check if job is still accepting applications
jobSchema.methods.isAcceptingApplications = function() {
  return this.status === 'active' && this.applicationDeadline > new Date();
};

module.exports = mongoose.model('Job', jobSchema);
