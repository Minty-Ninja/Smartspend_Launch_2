# SmartSpend React 💸

Personal finance tracker — React + Firebase + Gemini AI.

## Quick Start

```bash
# 1. Install
npm install

# 2. Add your keys
cp .env.example .env
# Edit .env with your Firebase + Gemini keys

# 3. Run
npm run dev
# Opens at http://localhost:5173
```

## Firebase Setup
1. Firebase Console → Authentication → Sign-in method → Email/Password → Enable
2. Firebase Console → Firestore Database → Create database → Test mode

## Deploy to Netlify
```bash
npm run build
```
Drag `dist/` folder to netlify.com
Add all VITE_* keys in Site Settings → Environment Variables

## Folder Structure
```
src/
├── firebase/config.js        Firebase init (reads from .env)
├── context/AuthContext.jsx   Global auth state
├── hooks/useExpenses.js      Expense CRUD
├── hooks/useGoals.js         Goals CRUD
└── components/
    ├── AuthSection.jsx       Login + Signup
    ├── Dashboard.jsx         Main layout
    ├── Sidebar.jsx           Sidebar + user initials
    ├── HelloBanner.jsx       Greeting after login
    ├── ExpenseTracker.jsx    Expenses + pie chart
    ├── GoalTracker.jsx       Goals + progress bars
    ├── MonthlyReview.jsx     Monthly bar chart
    └── Chatbot.jsx           Smartbot AI
```
