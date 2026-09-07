# StayEase - Full Stack Vacation Rental & Property Booking Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**StayEase** is a full-stack MERN property booking platform crafted for seamless vacation rental discoveries and reservations. Featuring verified superhosts, real-time availability checks, date range booking calculators, user reviews, and resilient serverless deployment on Vercel.

🔗 **Live Demo:** [https://stayease-ifxaals-projects.vercel.app](https://stayease-ifxaals-projects.vercel.app)

---

## Key Features

- **Property Discovery & Search:**
  - Fast location-based search across cities, states, and villa names.
  - Interactive category pills (*Beachfront, Mountain, Heritage Haveli, Nature, Luxury Penthouse*).
  - Multi-attribute price filtering and sorting (Price: Low to High / High to Low).
- **High Availability & Zero-Crash Architecture:**
  - Resilient database adapter with automatic timeout guards (prevents serverless lambda timeouts).
  - Graceful fallback demo mode: curated listings are served seamlessly even if database connection is dormant or cold-starting.
- **Listing Details & Amenities:**
  - Curated photo gallery with responsive aspect ratio and hover zoom effects.
  - Superhost and rating score badges.
  - Dynamic amenities tag list (*Private Pool, High-speed Wi-Fi, Dedicated Workspace, Fireplace, Kitchen*).
- **Interactive Booking Flow:**
  - Date picker with check-in/check-out constraints and night duration calculation.
  - Transparent pricing breakdown with service fee computation.
  - Overlap collision detection to prevent double-bookings.
- **Reviews & Ratings System:**
  - Verified guest reviews with star ratings, timestamps, and reviewer initials.
- **Host Dashboard & Listing Management:**
  - Create property listings with either direct image URLs or file uploads.
  - Host management dashboards for `My Properties` and `My Bookings`.
- **JWT Authentication:**
  - Secure bcrypt password hashing and token-based route protection.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Axios, Modern Vanilla CSS Design System |
| **Backend** | Node.js, Express.js (v5), Mongoose (v9), Multer |
| **Database** | MongoDB Atlas (Cloud NoSQL Database) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **Deployment** | Vercel Serverless Functions (`api/[...path].js`), Vercel Static Hosting |

---

## Local Setup & Development

### 1. Clone the Repository
```bash
git clone https://github.com/mohammed-ifzal/stayease.git
cd stayease
```

### 2. Configure Backend Environment
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 4. Seed the Database (Optional but Recommended)
Populate your MongoDB Atlas cluster with 8+ curated listings across popular destinations:
```bash
cd server
npm run seed
```

### 5. Run Locally
Run both servers:
```bash
# Terminal 1 - Backend API (http://localhost:5000)
cd server
npm run dev

# Terminal 2 - Frontend App (http://localhost:3000)
cd client
npm start
```

---

## API Documentation

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and retrieve JWT token
- `GET /api/auth/me` - Fetch logged-in user profile (Protected)

### Properties
- `GET /api/properties` - List properties with filters (`location`, `minPrice`, `maxPrice`, `sortOrder`, `category`)
- `GET /api/properties/:id` - Fetch single property details
- `POST /api/properties` - Create a new listing (Protected)
- `GET /api/properties/my` - Get listings created by current user (Protected)
- `DELETE /api/properties/:id` - Remove a listing (Owner only)

### Bookings
- `POST /api/bookings` - Reserve dates for a property (Protected)
- `GET /api/bookings/my` - View current user's booking history (Protected)
- `GET /api/bookings/property/:propertyId` - Check booked dates for availability

### Reviews
- `GET /api/reviews/property/:propertyId` - Fetch all reviews for a property
- `POST /api/reviews` - Submit review for a booked property (Protected)

---

## Deployment on Vercel

This repository is configured out of the box for Vercel deployment:
- `vercel.json` configures client build output and routes `/api/*` to `api/[...path].js`.
- Make sure to add `MONGO_URI` and `JWT_SECRET` under **Vercel Project Settings -> Environment Variables**.
- Under **Settings -> Deployment Protection**, ensure **Vercel Authentication** is turned off for public viewing.
