import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, jobsAPI } from '../services/api';
import './Home.css';
import './HomeExtensions.css';
import {
  LaptopGold,
  PhoneGold,
  CloudGold,
  PaintGold,
  LockGold,
  RobotGold
} from './dashboard/GoldIcons';

function AnimatedCounter({ value, duration = 1500, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    const increment = Math.max(1, Math.ceil(end / (duration / 16)));
    let current = start;
    let frame;
    function animate() {
      current += increment;
      if (current < end) {
        setDisplay(current);
        frame = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    }
    animate();
    return () => frame && cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span style={{ fontSize: '3rem', fontWeight: 'bold', color }}>{display}+</span>;
}

function Home() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme switcher for Home page
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [postsResponse, jobsResponse] = await Promise.all([
        postsAPI.getPosts({ limit: 3 }),
        jobsAPI.getJobs({ limit: 3 })
      ]);

      if (postsResponse.success) {
        setRecentPosts(postsResponse.posts);
      }

      if (jobsResponse.success) {
        setRecentJobs(jobsResponse.jobs);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Function to generate placeholder images for blog posts
  const getBlogPlaceholder = (category) => {
    const placeholders = {
      technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
      development: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
      design: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop',
      business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
      default: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=200&fit=crop'
    };
    return placeholders[category?.toLowerCase()] || placeholders.default;
  };

  // Wajson Logo Component (SVG)
  const WajsonLogo = ({ size = 40, color = "white" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Modern W logo design */}
      <circle cx="50" cy="50" r="45" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
      <path 
        d="M25 30 L35 70 L45 45 L55 70 L65 45 L75 70" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="50" cy="75" r="3" fill={color}/>
    </svg>
  );

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-logo-section">
            <WajsonLogo size={80} color="white" />
            <h1>Wajson Technologies</h1>
          </div>
          <p className="hero-main-desc">We build cutting-edge web applications, mobile apps, and digital solutions that drive your business forward</p>
          
          {!user ? (
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/register" className="btn btn-secondary">Learn More</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </header>
      
      <section className="features-section">
        <div className="container">
          <h2>Our Development Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><LaptopGold /></div>
              <h3>Web Development</h3>
              <p>Custom web applications using React, Node.js, and modern frameworks for scalable solutions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><PhoneGold /></div>
              <h3>Mobile Apps</h3>
              <p>Native and cross-platform mobile applications for iOS and Android with seamless user experience</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><CloudGold /></div>
              <h3>Cloud Solutions</h3>
              <p>Scalable cloud infrastructure and deployment solutions using AWS, Azure, and Google Cloud</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><PaintGold /></div>
              <h3>UI/UX Design</h3>
              <p>Beautiful, user-friendly interfaces that convert visitors to customers and enhance engagement</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><LockGold /></div>
              <h3>Cybersecurity</h3>
              <p>Comprehensive security solutions including penetration testing, vulnerability assessments, and secure coding practices</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><RobotGold /></div>
              <h3>AI & Machine Learning</h3>
              <p>Intelligent automation, predictive analytics, and AI-powered solutions to transform your business processes</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest Blog Posts */}
      <section className="blog-section">
        <div className="container">
          <div className="section-header">
            <h2>Latest From Our Blog</h2>
            <Link to="/blog" className="view-all-btn">View All Posts</Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : recentPosts.length > 0 ? (
            <div className="blog-grid">
              {recentPosts.map(post => (
                <article key={post._id} className="blog-card">
                  <div className="blog-image">
                    {post.featuredImage ? (
                      <img src={post.featuredImage} alt={post.title} />
                    ) : (
                      <img 
                        src={getBlogPlaceholder(post.category)} 
                        alt={post.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">${post.category || 'Blog'}</div>`;
                        }}
                      />
                    )}
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="category">{post.category || 'General'}</span>
                      <span className="date">{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt || post.content?.substring(0, 120) + '...'}</p>
                    <div className="blog-footer">
                      <span className="author">By {post.author?.username || 'Wajson Team'}</span>
                      <span className="views">{post.views || 0} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-content">
              <p>No blog posts available yet. Check back soon for exciting content!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="jobs-section">
        <div className="container">
          <div className="section-header">
            <h2>Join Our Team</h2>
            <Link to="/careers" className="view-all-btn">View All Jobs</Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading opportunities...</div>
          ) : recentJobs.length > 0 ? (
            <div className="jobs-grid">
              {recentJobs.map(job => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <h3>
                      <Link to={`/careers/${job.slug}`}>{job.title}</Link>
                    </h3>
                    <div className="job-badges">
                      <span className="department-badge">{job.department || 'Engineering'}</span>
                      <span className="type-badge">{job.type || 'Full-time'}</span>
                      {job.remote && <span className="remote-badge">Remote</span>}
                    </div>
                  </div>
                  <p className="job-location">📍 {job.location || 'Remote'}</p>
                  <div className="job-skills">
                    {(job.skills || ['React', 'Node.js', 'MongoDB']).slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <Link to={`/careers/${job.slug}`} className="job-apply-btn">
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-content">
              <p>No job openings available at the moment. Check back soon for exciting opportunities!</p>
            </div>
          )}
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Wajson Technologies</h2>
              <p>
                We are a cutting-edge technology company specializing in modern web and mobile applications. 
                At Wajson, our team of experienced developers creates scalable, secure, and user-friendly solutions 
                that help businesses thrive in the digital age.
              </p>
              <p>
                With a focus on innovation and excellence, we deliver exceptional 
                digital experiences that drive growth and transformation for our clients worldwide.
              </p>
              <ul>
                <li>✓ 5+ years of development expertise</li>
                <li>✓ 100+ successful projects delivered</li>
                <li>✓ Modern tech stack (React, Node.js, MongoDB)</li>
                <li>✓ Agile development methodology</li>
                <li>✓ 24/7 support and maintenance</li>
              </ul>
            </div>
            <div className="about-image">
              <div className="placeholder-image">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=400&fit=crop&crop=faces"
                  alt="Wajson Development Team"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span>👥 Wajson Development Team</span>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '4rem',
            fontWeight: '700'
          }}>What Our Clients Say</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                "Wajson delivered exceptional work! They completed our project on time and exceeded our expectations. 
                The team's expertise in modern technologies is outstanding."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👨‍💼</div>
                <div>
                  <strong>John Smith</strong>
                  <div style={{ opacity: '0.8' }}>CEO, TechCorp</div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                "Professional, reliable, and innovative. Our mobile app developed by Wajson has received amazing feedback 
                from users. Highly recommend their services!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👩‍💼</div>
                <div>
                  <strong>Sarah Johnson</strong>
                  <div style={{ opacity: '0.8' }}>Founder, StartupXYZ</div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                "The cloud migration by Wajson was seamless and our performance improved dramatically. 
                Their technical expertise and support are unmatched in the industry."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👨‍💻</div>
                <div>
                  <strong>Mike Chen</strong>
                  <div style={{ opacity: '0.8' }}>CTO, DataFlow Inc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <AnimatedCounter value={100} color="#667eea" />
              <div style={{ color: '#4a5568', fontSize: '1.1rem' }}>Projects Completed</div>
            </div>
            <div>
              <AnimatedCounter value={50} color="#38a169" />
              <div style={{ color: '#4a5568', fontSize: '1.1rem' }}>Happy Clients</div>
            </div>
            <div>
              <AnimatedCounter value={5} color="#ed8936" />
              <div style={{ color: '#4a5568', fontSize: '1.1rem' }}>Years Experience</div>
            </div>
            <div>
              <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#9f7aea' }}>24/7</span>
              <div style={{ color: '#4a5568', fontSize: '1.1rem' }}>Support Available</div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer-section">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <WajsonLogo size={50} color="#667eea" />
                <h3 style={{ margin: 0, color: '#1a365d' }}>Wajson Technologies</h3>
              </div>
              <p>Empowering businesses through innovative technology solutions and exceptional development services.</p>
              <div style={{ marginTop: '1.5rem' }}>
                <p>📧 Geoffreymusa08@gmail.com</p>
                <p>📧 Wajson.ltd@gmail.com</p>
                <p>📞 +2348167066360</p>
                <p>📍 Jos South Plateau State Nigeria</p>
              </div>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Services</h4>
                <ul>
                  <li><a href="#web-dev">Web Development</a></li>
                  <li><a href="#mobile-dev">Mobile Apps</a></li>
                  <li><a href="#cloud">Cloud Solutions</a></li>
                  <li><a href="#design">UI/UX Design</a></li>
                  <li><a href="#security">Cybersecurity</a></li>
                  <li><a href="#ai">AI & ML</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <ul>
                  <li><Link to="/blog">Blog</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4>Account</h4>
                <ul>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                  {user && <li><Link to="/dashboard">Dashboard</Link></li>}
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Wajson Technologies. All rights reserved. Built with ❤️ by our development team.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
