## FacultyConnect

Real-time faculty availability system for colleges. Students check whether a professor is in class, in cabin, in a meeting or out of office, without walking to the cabin.

## Features
- **Android app (professors):** login, one-tap status (In Cabin / In Meeting / Out of Office), quick-location buttons, "Resume Automatic" button
- **Automatic status:** "In Class" is set by comparing the current time with the professor's timetable
- **Student dashboard (React):** colour-coded live status, updates instantly with no refresh
- **Admin portal:** manage professors, departments and timetables, with activity logs
- **Real-time updates** with Socket.IO

## Tech Stack
| Part | Tech |
|---|---|
| Mobile | Android Studio, Java, Retrofit |
| Web | React (Vite), Axios, Socket.IO client |
| Backend | Node.js, Express, Socket.IO, JWT |
| Database | MongoDB Atlas, Redis |
| Tools | Postman, Render, Git |

## Architecture
Android app -> Node/Express API -> MongoDB + Redis -> Socket.IO -> Student dashboard


## Setup
cd backend && npm install
# create .env with MONGO_URI, REDIS_URL, JWT_SECRET, ADMIN credentials
npm start
```
Web: `cd web && npm install && npm run dev`
Android: open `/android` in Android Studio, set the API base URL, run.

## API (sample)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/admin/login | Admin login (JWT) |
| GET | /api/professors | List professors with status |
| PUT | /api/professors/:id/status | Update status |

## Challenges Solved
- College Wi-Fi blocked phone-to-laptop traffic, so I used ADB reverse forwarding for testing and then deployed the backend to Render.
- Replaced geofencing with manual quick-location buttons after feedback.

## Status
Presented to external examiners and tested on their phones.

