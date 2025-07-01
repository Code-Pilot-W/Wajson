# Company Portal Backend

Express.js backend API with MongoDB Atlas integration for the Company Portal application.

## Features

- User authentication with JWT tokens
- Role-based access control (User/Admin)
- Password hashing with bcrypt
- User management (CRUD operations)
- MongoDB Atlas integration
- RESTful API endpoints

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free tier)
4. Create a database user:
   - Go to Database Access
   - Add new database user
   - Username: `demo`
   - Password: `demo123` (or use autogenerate)
5. Setup Network Access:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
6. Get connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string

### 2. Environment Setup

1. Copy `.env.example` to `.env`
2. Update the MongoDB connection string in `.env`:
   ```
   MONGODB_URI=mongodb+srv://demo:demo123@cluster0.xxxxx.mongodb.net/company-portal?retryWrites=true&w=majority
   ```
3. Replace `xxxxx` with your actual cluster identifier

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed Admin User

```bash
npm run seed
```

This creates an admin user:
- Username: `admin`
- Password: `admin123`
- Email: `admin@company.com`

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/toggle-status` - Toggle user active status

### Health Check
- `GET /api/health` - Server health check

## Testing

Test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── User.js              # User model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # User management routes
├── scripts/
│   └── seedAdmin.js         # Admin user seeding script
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
└── server.js                # Main server file
```

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT token authentication
- Role-based access control
- Input validation
- CORS protection
- Environment variable protection

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Success responses:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```
