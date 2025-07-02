# Wajson Technologies Backend

## Project Structure

- `/backend` — Node.js/Express API (main backend)
- `/src`, `/public` — React frontend (not deployed in this setup)

## Running the Backend Locally

```bash
cd backend
npm install
npm start
```

## Environment Variables
Create a `.env` file in `/backend` with:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# Add any other required variables
```

**Never commit `.env` files to GitHub!**

## Deployment (Render)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:** Set in Render dashboard

## CORS
Update CORS in `backend/server.js` to allow only your frontend production URL.

## Notes
- Frontend is not deployed in this setup.
- For full-stack deployment, deploy frontend separately and set API URLs accordingly.
