# 3W Social — Mini Social Post Application

A full-stack social feed app built for the 3W Business Full Stack Internship Round 1 task.
Users can sign up, log in, create posts (text and/or image), and like/comment on posts from
a public feed.

## Tech Stack

- **Frontend:** React (Vite) + Material UI (MUI)
- **Backend:** Node.js + Express
- **Database:** MongoDB (2 collections: `users`, `posts`)
- **Auth:** JWT + bcrypt password hashing
- **Image storage:** Cloudinary (free tier)

## Project Structure

```
3w-social-app/
├── backend/          Node/Express API
│   ├── config/        DB + Cloudinary setup
│   ├── models/        User.js, Post.js (Mongoose schemas)
│   ├── routes/         auth.js, posts.js
│   ├── middleware/    JWT auth middleware
│   ├── server.js       App entry point
│   └── .env.example
└── frontend/          React app (Vite)
    ├── src/
    │   ├── pages/       Login, Signup, Feed
    │   ├── components/  Navbar, CreatePost, PostCard, CommentSection, ProtectedRoute
    │   ├── context/     AuthContext (global auth state)
    │   ├── api/         Axios instance with JWT interceptor
    │   └── theme.js      MUI theme
    └── .env.example
```

## Features Implemented

- Email/password signup & login (JWT-based auth, bcrypt-hashed passwords)
- Create post with text, image, or both (validated server-side — at least one required)
- Public feed showing username, content, like count, comment count — newest first
- Like / unlike toggle, with usernames of likers stored on the post
- Comments with usernames stored, shown inline, update instantly (optimistic local state update, no full page reload)
- Cursor-free page-based pagination via infinite scroll (`page`/`limit` query params + `IntersectionObserver`)
- Responsive, clean MUI-based UI

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI (MongoDB Atlas), JWT_SECRET, and Cloudinary credentials in .env
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev
```
App runs on `http://localhost:5173`.

## Environment Variables

**backend/.env**
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/3w-social
JWT_SECRET=a_long_random_string
PORT=5000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

> Cloudinary has a free tier at cloudinary.com — used for image upload storage since posting images requires hosting them somewhere persistent.

## Deployment Guide

### MongoDB Atlas
1. Create a free cluster at mongodb.com/atlas.
2. Create a database user and allow network access from `0.0.0.0/0` (or Render's IPs).
3. Copy the connection string into `MONGO_URI`.

### Backend → Render
1. Push this repo to GitHub.
2. New Web Service on render.com, point it at the `backend` folder (root directory: `backend`).
3. Build command: `npm install`. Start command: `npm start`.
4. Add all `.env` variables in Render's Environment tab.

### Frontend → Vercel
1. New Project on vercel.com, point it at the `frontend` folder (root directory: `frontend`).
2. Framework preset: Vite.
3. Add `VITE_API_URL` env var pointing to your deployed Render backend URL + `/api`.
4. Deploy.

### Cloudinary
1. Sign up at cloudinary.com (free tier).
2. Grab Cloud Name, API Key, API Secret from the dashboard and add to backend `.env`.

## API Endpoints

| Method | Endpoint                  | Auth | Description                     |
|--------|----------------------------|------|----------------------------------|
| POST   | `/api/auth/signup`         | No   | Register new user               |
| POST   | `/api/auth/login`          | No   | Login, returns JWT              |
| GET    | `/api/posts?page=&limit=`  | No   | Paginated public feed           |
| POST   | `/api/posts`                | Yes  | Create post (multipart/form-data)|
| POST   | `/api/posts/:id/like`      | Yes  | Toggle like on a post           |
| POST   | `/api/posts/:id/comment`   | Yes  | Add a comment to a post         |

## Notes

- Passwords are hashed with bcrypt and never returned in API responses.
- The `Post` schema's `pre('validate')` hook enforces that a post has text, an image, or both.
- Likes/comments store both the user's ObjectId and a denormalized `username` for fast reads without extra population queries, per the task's requirement to "save the usernames" of likers/commenters.
- Pagination uses simple page/limit skip-based queries with an index on `createdAt` for feed performance; the frontend loads more automatically via `IntersectionObserver` as the user scrolls.
