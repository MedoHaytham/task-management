# 🚀 Task Management Application

A full-stack modern Task & Project Management web application built with **Next.js**, **React 19**, **Redux Toolkit**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

- 🔐 **Authentication & Authorization**:
  - Secure JWT Authentication with short-lived Access Tokens & long-lived Refresh Tokens (stored in HTTP-only cookies).
  - Role-Based Access Control (RBAC) with **Admin** and **User** roles.
  - Automatic token refreshing with mutex locking on the frontend to prevent race conditions.

- 📁 **Project Management**:
  - Create, view, update, and delete projects.
  - Assign team members and project managers.
  - Track project progress and task status counts.

- 📋 **Task Management**:
  - Full CRUD operations for tasks within projects.
  - Task properties: Title, description, status (`To Do`, `In Progress`, `Completed`), priority (`Low`, `Medium`, `High`), due dates, and assignee.
  - Interactive Task Editing and User Assignment modals.

- 👥 **User Management (Admin Only)**:
  - Admin dashboard to view, edit roles, manage users, or delete accounts.

- 🛡️ **Backend Security**:
  - Helmet for security HTTP headers.
  - Rate limiting (`express-rate-limit`) to prevent brute-force attacks.
  - Data sanitization against NoSQL query injection (`express-mongo-sanitize`) and XSS attacks (`xss-clean`).
  - HTTP Parameter Pollution prevention (`hpp`).

- 🎨 **Modern Frontend Architecture**:
  - Built with Next.js App Router and React 19.
  - Styled with Tailwind CSS v4 and Lucide React icons.
  - State management via Redux Toolkit with RTK Query / custom slices.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **State Management**: [@reduxjs/toolkit](https://redux-toolkit.js.org/) & `react-redux`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: `jsonwebtoken` & `bcryptjs`
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladbs/supertest)

---

## 📁 Project Structure

```text
task-management/
├── client/                 # Next.js Frontend Application
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React UI components and modals
│   ├── context/            # React context providers
│   ├── features/           # Redux slices and state management
│   ├── hooks/              # Custom React hooks
│   ├── api/                # Axios instance and API interceptors
│   ├── package.json        # Frontend dependencies & scripts
│   └── .env.local.example  # Frontend environment template
│
└── server/                 # Express.js Backend API
    ├── config.env          # Server environment variables
    ├── controllers/        # Route logic & controllers
    ├── middleware/         # Auth, validation, & error handling middlewares
    ├── models/             # Mongoose schemas (User, Task, Project)
    ├── routes/             # API routes definition
    ├── utils/              # Helper utilities and AppError handler
    ├── seed.js             # Database seeding script
    ├── package.json        # Backend dependencies & scripts
    └── .env.example        # Backend environment template
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local system:
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MedoHaytham/task-management.git
   cd task-management
   ```

2. **Backend Setup (`/server`)**:
   ```bash
   cd server
   npm install
   ```
   Create a `config.env` file inside the `server` directory (or copy `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE=mongodb+srv://<user>:<password>@cluster.mongodb.net/task-management
   ACCESS_TOKEN_SECRET_KEY=your_access_token_secret
   REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=30d
   ACCESS_TOKEN_COOKIE_EXPIRES_IN=15
   REFRESH_TOKEN_COOKIE_EXPIRES_IN=30
   ```

3. **Frontend Setup (`/client`)**:
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env.local` file inside the `client` directory (or copy `.env.local.example`):
   ```env
   API_BASE_URL=http://localhost:5000
   ```

---

### Running the Application

1. **Seed Initial Data (Optional)**:
   In the `server` directory, run the seed script to populate sample users, projects, and tasks:
   ```bash
   cd server
   npm run seed
   ```

2. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

3. **Start the Frontend Client**:
   ```bash
   cd client
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🔌 API Endpoints Summary

### Authentication & Users (`/api/v1/users`)
- `POST /signup` - Register a new user
- `POST /login` - User login
- `POST /logout` - Log out and clear auth tokens
- `POST /refresh-token` - Refresh access token using refresh token
- `GET /me` - Get current logged-in user profile
- `GET /` *(Admin)* - Get all users
- `PATCH /:id` *(Admin)* - Update user role or details
- `DELETE /:id` *(Admin)* - Delete a user

### Projects (`/api/v1/projects`)
- `GET /` - List all accessible projects
- `POST /` - Create a new project
- `GET /:id` - Get single project details
- `PATCH /:id` - Update project details
- `DELETE /:id` - Delete project

### Tasks (`/api/v1/tasks`)
- `GET /` - List tasks (supports filtering by project, status, priority)
- `POST /` - Create a task
- `GET /:id` - Get task details
- `PATCH /:id` - Update task (status, priority, assigned user)
- `DELETE /:id` - Delete task

---

## 🧪 Running Tests

To run the backend integration and unit tests:
```bash
cd server
npm test
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
