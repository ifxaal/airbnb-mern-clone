# Airbnb Clone – MERN Stack Capstone Project

## 📌 Project Overview

This is a full-featured Airbnb Clone built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

The application allows users to:

- Register and login securely using JWT
- List properties with image uploads
- Search properties by location
- Filter by price range
- Sort by price (Low → High / High → Low)
- Book properties with date selection
- Prevent double bookings (availability validation)
- Leave reviews after booking
- Delete their own properties
- View and manage their bookings

The project focuses on modern UI, backend architecture, secure authentication, and real-world booking logic.

---

## 🛠 Tech Stack

### Frontend (client/)
- React.js
- React Router
- Axios
- Tailwind CSS
- Responsive Grid Layout

### Backend (server/)
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Tools
- JWT (JSON Web Tokens)
- Multer (Image Upload Handling)
- Dotenv (Environment Variables)
- Postman (API Testing)

---

## 📂 Project Structure

AIRBNB-CLONE/
│
├── client/
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── tailwind.config.js
│
├── server/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── uploads/
│ ├── .env
│ ├── package.json
│ └── server.js
│
└── README.md


---

## 🚀 Features Implemented

### 🔐 Authentication
- User registration
- User login
- JWT-based authorization
- Protected routes

### 🏠 Property Management
- Create property
- Delete property (Owner only)
- Upload property image
- View own listings

### 🔎 Search & Filtering
- Search by location
- Filter by minimum price
- Filter by maximum price
- Sort by price

### 📅 Booking System
- Select start and end date
- Prevent invalid date selection
- Prevent overlapping bookings
- View "Already Booked" availability message
- View personal bookings

### ⭐ Reviews
- Add review (only after booking)
- Rating system (1–5)
- Display reviews under property

### 🎨 UI Features
- Airbnb-style clean design
- Responsive layout
- Modern card layout
- Sticky navbar

---

##  Installation Guide

###  Clone the Repository

git clone <your-repo-link>

###  Set up Backend

cd server
npm install


Create `.env` file inside `server/`:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000


###  Run Server

npm start


---

### 3️⃣ Setup Frontend

Open new terminal:
cd client
npm install
npm start


Frontend runs on:
http://localhost:3000


Backend runs on:
http://localhost:5000


---

## 🔌 API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Properties
- GET `/api/properties`
- POST `/api/properties`
- GET `/api/properties/:id`
- DELETE `/api/properties/:id`

### Bookings
- POST `/api/bookings`
- GET `/api/bookings/my`
- GET `/api/bookings/property/:propertyId`

### Reviews
- POST `/api/reviews`
- GET `/api/reviews/property/:propertyId`

---

## 🧠 Booking Logic

- User cannot book without selecting dates
- End date must be after start date
- System checks for overlapping bookings
- Shows availability status dynamically

---

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop
- Tablet
- Mobile Devices

---

## 🎓 Capstone Coverage Checklist

✔ MERN Stack Architecture  
✔ JWT Authentication  
✔ Protected Routes  
✔ CRUD Operations  
✔ Image Upload (Multer)  
✔ Search & Filters  
✔ Sorting  
✔ Booking Validation  
✔ Reviews System  
✔ Availability Indicator  
✔ Responsive Design  

All major requirements for Module 8 Capstone are implemented.

---

## 👨‍💻 Author

Khwaja Mohammed Ifzal
MERN Stack Capstone Project  
