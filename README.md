# Sahayak AI 🤝

**Smart Local Problem Solver** — AI-powered platform to report, categorize, and resolve local community problems.

Built for Idea2Impact Online Hackathon 2026 | Theme: Sustainability & Social Impact

## 🎯 Problem Statement

Local communities often lack a simple, accessible way to report everyday civic issues (garbage, water leakage, broken infrastructure, etc.) and get help from neighbors or local authorities. Existing solutions are either too complex, English-only, or don't prioritize issues intelligently.

## 💡 Solution

Sahayak AI lets any user report a problem in simple language (including Hinglish, e.g. "Yaha garbage hai 3 din se"). An AI model automatically:
- Categorizes the problem (e.g. Water Issue, Garbage, Infrastructure)
- Assigns a priority level (low/medium/high)
- Posts it to a community feed where others can offer help

This turns scattered complaints into an organized, actionable community feed.

## 🧠 AI Implementation

- **Model used:** Google Gemini API
- **How it works:** User-submitted problem text is sent to the Gemini API, which classifies the category and estimates urgency/priority. This classification is stored and displayed alongside each report.

## 🛠️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS
**Backend:** Node.js, Express.js
**Database/Auth:** Supabase
**AI:** Google Gemini API
**Deployment:** Frontend on Vercel, Backend on Railway

## 🚀 Live Demo

- **Live App:** https://sahayak-ai-sand.vercel.app
- **Backend API:** https://sahayak-ai-production-dcc6.up.railway.app

## ⚙️ Setup Instructions (Local Development)

### Backend
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# GEMINI_API_KEY=your_key
# SUPABASE_URL=your_url
# SUPABASE_KEY=your_key
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ✨ Features

- Report local problems in natural language
- AI-based auto-categorization and priority detection
- Community feed to view and help with reported problems
- Leaderboard for active helpers
- User profile & tracking

## 📌 Note

This project was built solo within the 7-day hackathon window (13–19 July 2026) as part of the Idea2Impact Online Hackathon by NxtWave Academy.
