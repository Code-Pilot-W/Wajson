# Setup Instructions

## Environment Variables

### Frontend (.env)
Create a `.env` file in the root directory with:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### Backend (.env)
Create a `.env` file in the `backend/` directory with:
```
MONGODB_URI=mongodb://localhost:27017/company-portal
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
PORT=5000
```

## Installation & Running

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm start
```

## Routes & Links Status

✅ All frontend routes are properly configured:
- `/` - Home page
- `/blog` - Blog posts listing
- `/blog/:slug` - Individual blog post
- `/careers` - Jobs listing
- `/careers/:slug` - Individual job details with application form
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin dashboard (admin-only)
- `*` - 404 Not Found page

✅ Navigation links are all functional:
- Home, Blog, Careers links in navigation
- Proper login/logout flow
- User/admin dashboard routing
- Footer links updated

✅ API endpoints are properly mapped:
- All frontend API calls match backend routes
- File upload endpoints working
- Job application system fully functional
- Profile image display fixed

✅ Internal links:
- Job detail pages link correctly
- Blog post pages link correctly
- Application forms submit to correct endpoints
- Admin dashboard shows real application data

## Features Working

1. **Job Application System**
   - Multi-step application form
   - CV upload (required)
   - LinkedIn/portfolio links
   - Admin can view and manage applications

2. **Blog System**
   - Blog posts listing with filtering
   - Individual post pages
   - Proper routing and navigation

3. **User Management**
   - Login/logout
   - User profiles with image uploads
   - Admin dashboard with user management

4. **Theme System**
   - Dark/light mode toggle working
   - Theme persistence

5. **File Upload**
   - Profile/cover image uploads
   - CV/document uploads for job applications
   - Proper file serving from backend
