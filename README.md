# 🎯 QuizCraft

QuizCraft is a full-stack quiz application featuring real-time question generation, leaderboards, and modern animations. Test your knowledge across different categories!

## ✨ Features

- **📚 Multiple Categories** - Sports, Entertainment, Science, History, Geography, Technology, Games, Food & Drinks, Nature & Animals
- **🎚️ 3 Difficulty Levels** - Easy, Medium, Hard
- **🏆 Leaderboards** - Configuration-based ranking and medal system (🥇🥈🥉)
- **👤 User Profiles** - Quiz history and statistics
- **🔐 Secure Authentication** - JWT-based authentication
- **👨‍💼 Admin Panel** - User management
- **🌙 Dark Mode** - Theme switching support
- **🎨 Modern UI** - Tailwind CSS and Framer Motion animations
- **🎊 Fun Effects** - Confetti celebration on correct answers

## 📸 Screenshots

### Web Version
<!-- Add your web screenshots to screenshots/web/ directory -->

### Mobile Version
<!-- Add your mobile screenshots to screenshots/mobile/ directory -->

## 🛠️ Technologies

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript (ESM)
- **Database**: SQLite + Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Effects**: canvas-confetti
- **Icons**: Lucide React
- **UI Primitives**: Radix UI

### Mobile
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand

## 📁 Project Structure

```
quizcraft/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── index.ts         # Main entry point
│   │   ├── db/              # Database schema and seed
│   │   ├── middleware/      # Auth and error handling
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business services
│   └── package.json
│
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state
│   │   ├── lib/             # API and utility functions
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── mobile/                  # React Native + Expo application
│   ├── src/
│   │   ├── screens/         # Screen components
│   │   ├── components/      # UI components
│   │   ├── navigation/      # Navigation setup
│   │   ├── store/           # Zustand state
│   │   └── lib/             # API and utility functions
│   └── package.json
│
├── screenshots/              # Application screenshots
│   ├── web/                 # Web version screenshots
│   └── mobile/              # Mobile version screenshots
│
├── README.md
└── START.md                 # Setup and startup guide
```

## 🚀 Quick Start

For detailed setup and startup instructions, see the [START.md](START.md) file.

### Summary

```bash
# Backend
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Mobile (new terminal)
cd mobile
npm install
npm start
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Default Admin Credentials

- **Email**: admin@quizcraft.com
- **Password**: admin123

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user info |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get category details and subcategories |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/start` | Start new quiz |
| GET | `/api/quiz/:uuid` | Get quiz details |
| POST | `/api/quiz/:uuid/answer` | Answer question |
| POST | `/api/quiz/:uuid/submit` | Submit quiz |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get general leaderboard |
| GET | `/api/leaderboard/config` | Get configuration-based ranking |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| GET | `/api/profile/history` | Get quiz history |
| GET | `/api/profile/stats` | Get statistics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id` | Update user |

## 📝 License

This project is developed for educational purposes.
