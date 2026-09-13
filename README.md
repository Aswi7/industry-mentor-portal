# 🎓 Industry Mentor Portal

> A full-stack web application designed to bridge the gap between students and industry professionals through 1-on-1 mentorship sessions, resource sharing, session tracking, and real-time career guidance.

---


## 🌟 Overview

The **Industry Mentor Portal** provides an end-to-end ecosystem where students can easily discover verified industry experts, schedule structured 1-on-1 mentorship sessions, access curated educational materials, and accelerate their career path. Industry professionals can manage their availability, review booking requests, auto-generate video meeting links, and upload exclusive resources for their mentees. Platform administrators oversee user registrations, verify mentor credentials, monitor active sessions, and analyze platform engagement.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- **Mentor Discovery & Filtering:** Search and filter mentors by expertise, company, location, domain, and ratings.
- **Session Booking:** View available mentor slots and request personalized 1-on-1 sessions with custom notes and topics.
- **Session Management:** Track upcoming, completed, and canceled sessions with direct access to meeting links.
- **Resource Center:** Browse and download learning materials, guides, and project templates shared by mentors.
- **Notifications:** Receive instant in-app alerts for session approvals, updates, and platform events.

### 👨‍🏫 Mentor Features
- **Profile Customization:** Set up professional bios, domain skills, company information, hourly rate, and social links.
- **Slot & Request Management:** Create open availability slots, accept/reject booking requests, or reschedule sessions.
- **Google Calendar & Meet Integration:** Automatically generate video call links (Google Meet) for accepted sessions and sync with Google Calendar.
- **Resource Publishing:** Upload documents, PDFs, slides, and links for student learning.
- **Mentee Tracking:** Overview of active mentees, past session history, ratings, and student feedback.

### 🛡️ Admin Features
- **Mentor Verification Queue:** Review pending mentor registration requests and verify credentials before granting full portal access.
- **User Management:** View detailed user profiles, manage active status, and deactivate/activate accounts for students and mentors.
- **Session Oversight:** Monitor all platform-wide mentorship sessions, statuses, and performance statistics.
- **Analytics & Reports:** Graphical overview of key platform metrics including active user counts, total sessions held, and domain breakdowns (powered by Recharts).

### 🔐 Auth & Security
- **Role-Based Access Control (RBAC):** Strict permissions separating Student, Mentor, and Admin workflows.
- **JWT & Password Security:** Secure JSON Web Token authentication with bcrypt password hashing.
- **OAuth 2.0 Integration:** Optional login and calendar synchronization via Google and LinkedIn.
- **Automated Background Services:** Auto-completion cron service for expired sessions (`SESSION_AUTO_COMPLETE_INTERVAL_MS`).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons & UI:** Lucide React
- **Data Visualization:** Recharts
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT), `bcryptjs`
- **File Uploads:** `multer`
- **Third-Party APIs:** Google APIs (`googleapis`), LinkedIn OAuth, Nodemailer

### **Deployment & Hosting**
- **Configuration:** Vercel serverless integration (`vercel.json`)

---

## 📁 Project Architecture & Directory Structure

```text
industry-mentor-portal/
├── backend/
│   ├── controllers/         # Request handler logic (auth, mentor, student, admin, sessions)
│   ├── lib/                 # Database initialization & Mongoose connection helpers
│   ├── middleware/          # JWT protection & role authorization middleware
│   ├── models/              # Mongoose schemas (User, Session, Resource, Notification)
│   ├── routes/              # Express API route endpoints
│   ├── services/            # Background tasks (e.g., session auto-completion)
│   └── uploads/             # Static file storage for avatars, resumes, resources
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── assets/          # Global CSS styles and icons
│   │   ├── context/         # React Context (AuthContext for user state)
│   │   ├── pages/           # Pages divided into admin/, mentor/, student/, and auth views
│   │   │   ├── admin/       # Admin approvals, overview, user management & reports
│   │   │   ├── mentor/      # Mentor dashboard, profile, session management & resources
│   │   │   ├── student/     # Student dashboard, find mentor, sessions & resources
│   │   │   ├── Login.jsx    # Authentication login page
│   │   │   └── Register.jsx # User registration page
│   │   ├── services/        # Axios API client modules
│   │   ├── App.jsx          # App router and component tree
│   │   └── main.jsx         # React DOM entry point
│   ├── tailwind.config.js   # Tailwind design configuration
│   └── vite.config.js       # Vite build configuration
├── .env                     # Environment variables configuration
├── package.json             # Root backend scripts & dependencies
├── server.js                # Express app entry point
└── vercel.json              # Vercel deployment configuration
```

---

## ⚙️ Getting Started & Local Setup

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **MongoDB** instance (Local MongoDB instance or MongoDB Atlas cluster connection string)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd industry-mentor-portal
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

### Environment Variables

Create a `.env` file in the root `industry-mentor-portal/` directory (or use the provided template):

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/industryMentorDB

# Authentication
JWT_SECRET=your_jwt_super_secret_key

# Background Tasks
SESSION_AUTO_COMPLETE_INTERVAL_MS=60000

# Optional Google OAuth & Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/auth/google/calendar/callback

# Optional LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/auth/linkedin/callback
```

---

### Running Locally

You can run the backend server and frontend development server concurrently:

#### 1. Start the Backend API Server
From the `industry-mentor-portal/` root directory:
```bash
npm run dev
```
*The backend server will start on `http://localhost:5000`.*

#### 2. Start the Frontend Development Server
Open a new terminal window, navigate to `frontend/`:
```bash
cd frontend
npm run dev
```
*The Vite React development server will start on `http://localhost:5173`.*

---

## 📡 API Endpoints Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new Student or Mentor account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `GET` | `/api/auth/google` | Google OAuth login initiator | Public |
| `GET` | `/api/auth/linkedin` | LinkedIn OAuth login initiator | Public |

### Session Routes (`/api/sessions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/sessions/request` | Student requests a session with mentor | Student |
| `POST` | `/api/sessions/mentor-create` | Mentor creates an open session slot | Mentor |
| `GET` | `/api/sessions/open` | View open available session slots | Student |
| `PUT` | `/api/sessions/accept/:sessionId` | Accept session request & generate link | Mentor |
| `PUT` | `/api/sessions/reject/:sessionId` | Reject session request | Mentor |
| `DELETE` | `/api/sessions/cancel/:sessionId` | Cancel pending session request | Student |
| `GET` | `/api/sessions/mentor` | Get mentor's session history & active sessions | Mentor |
| `PUT` | `/api/sessions/complete/:sessionId` | Mark session as completed | Mentor |

### Mentor Routes (`/api/mentor`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/mentor/profile` | Fetch mentor profile details | Mentor |
| `PUT` | `/api/mentor/profile` | Update mentor bio, skills, pricing, and availability | Mentor |
| `GET` | `/api/mentor/mentees` | Fetch active mentees list | Mentor |

### Student Routes (`/api/student`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/student/mentors` | Search and filter list of verified mentors | Student |
| `GET` | `/api/student/mentor/:id` | View public profile of a mentor | Student |
| `GET` | `/api/student/sessions` | View student's session history | Student |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/overview` | Fetch overall platform metrics & statistics | Admin |
| `GET` | `/api/admin/pending-mentors` | View pending mentor approval requests | Admin |
| `PUT` | `/api/admin/approve-mentor/:id` | Approve pending mentor registration | Admin |
| `PUT` | `/api/admin/reject-mentor/:id` | Reject pending mentor registration | Admin |
| `GET` | `/api/admin/users` | List all registered students and mentors | Admin |

### Resource Routes (`/api/resources`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/resources` | List available resources for students | Student / Mentor |
| `POST` | `/api/resources/upload` | Upload new resource file or link | Mentor |

---

## 🌐 Deployment

The project is structured for easy deployment on **Vercel** or any cloud hosting provider (Render, Railway, AWS).

### Deploying on Vercel
1. Ensure `vercel.json` is located in the project root.
2. Push your code to GitHub.
3. Import the project in Vercel Dashboard.
4. Configure the environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`) under Project Settings -> Environment Variables.
5. Deploy! Vercel handles serving the static frontend assets and routing `/api/*` calls to `server.js`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
