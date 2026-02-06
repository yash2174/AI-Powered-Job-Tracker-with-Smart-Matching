<<<<<<< HEAD
# AI-Powered-Job-Tracker-with-Smart-Matching
=======
# AI-Powered Job Tracker Application

A full-stack job tracking application with AI-powered matching, intelligent assistant, and comprehensive application management.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Job Feed │  │Applications│ │AI Assistant│      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │               │
│       └─────────────┴──────────────┴─────────────┘               │
│                          │                                        │
│                     API Service                                   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Fastify   │
                    │   Backend   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
   │ Adzuna   │    │  LangChain  │   │  LangGraph  │
   │   API    │    │ AI Matching │   │ AI Assistant│
   └────┬─────┘    └──────┬──────┘   └──────┬──────┘
        │                  │                  │
        │           ┌──────▼──────┐          │
        │           │   OpenAI    │          │
        │           │     API     │          │
        │           └─────────────┘          │
        │                                     │
        └─────────────────┬───────────────────┘
                          │
                   ┌──────▼──────┐
                   │ Data Storage│
                   │ JSON Files  │
                   └─────────────┘
```

## 🎯 Key Features

### 1. **Job Feed with Smart Filtering**
- Search by role, title, and skills
- Multi-select skill filtering
- Date filters (24h, week, month, any)
- Job type filters (full-time, part-time, contract, internship)
- Work mode filters (remote, hybrid, onsite)
- Location-based filtering
- Match score filtering (>70%, 40-70%, all)

### 2. **AI-Powered Job Matching (LangChain)**
- Resume analysis and skill extraction
- Job-to-resume matching algorithm
- 0-100% match scoring
- Color-coded badges:
  - 🟢 Green (>70%): Great Match
  - 🟡 Yellow (40-70%): Good Match
  - ⚪ Gray (<40%): Low Match
- Detailed explanations:
  - Matching skills identified
  - Relevant experience highlighted
  - Keyword overlap analysis

### 3. **Application Tracking**
- Status flow: Applied → Interview → Offer / Rejected
- Timeline visualization for each application
- Kanban-style board view
- Post-application popup:
  - "Yes, Applied"
  - "Applied Earlier"
  - "No, Just Browsing"

### 4. **AI Assistant (LangGraph)**
- Floating chat bubble interface
- **Direct UI filter control** via natural language:
  - "Show only remote jobs"
  - "High match score only"
  - "Only full-time jobs in Bangalore"
  - "Clear all filters"
- Product help and guidance
- Conversation history management
- Multi-turn dialogue support

### 5. **Resume Management**
- PDF and TXT file upload
- Single resume per user
- Resume replacement capability
- Text extraction and storage
- Match scoring based on resume content

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify (high-performance web framework)
- **AI Matching**: LangChain (job-resume matching)
- **AI Orchestration**: LangGraph (conversation flow management)
- **LLM**: OpenAI GPT-3.5-turbo
- **Job Data**: Adzuna API (with fallback to mock data)
- **Storage**: JSON files (no database required)
- **File Processing**: pdf-parse (resume extraction)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: lucide-react
- **HTTP Client**: Axios
- **Styling**: Inline CSS (no external dependencies)

### AI Components
- **LangChain**: Prompt engineering, output parsing, chain composition
- **LangGraph**: State machine for conversation flow and intent routing
- **OpenAI API**: GPT-3.5-turbo for natural language understanding

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── data/
│   │   ├── mockJobs.json          # Fallback job data
│   │   ├── users.json              # User credentials
│   │   ├── applications.json       # Application tracking
│   │   └── resumes/                # Uploaded resumes
│   ├── services/
│   │   ├── adzunaService.js        # Job API integration
│   │   ├── aiMatchingService.js    # LangChain matching
│   │   ├── aiAssistantService.js   # LangGraph assistant
│   │   └── dataService.js          # JSON file management
│   ├── server.js                   # Main Fastify server
│   ├── package.json
│   ├── .env.example
│   └── .env                        # Your secrets here
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Layout.jsx          # Navigation + AI Assistant
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JobFeed.jsx         # Main job listing
│   │   │   ├── JobCard.jsx
│   │   │   ├── Applications.jsx    # Kanban board
│   │   │   └── ResumeUpload.jsx
│   │   ├── services/
│   │   │   └── api.js              # Backend communication
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Adzuna API credentials (optional, fallback to mock data)

### 1. Clone and Install

```bash
# Backend setup
cd backend
npm install

# Frontend setup (in new terminal)
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` from `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Adzuna API (optional - will use mock data if not provided)
ADZUNA_APP_ID=your_app_id_here
ADZUNA_API_KEY=your_api_key_here

# OpenAI API (required for AI features)
OPENAI_API_KEY=your_openai_key_here

# Server
PORT=3001
NODE_ENV=development
```

**Getting API Keys:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Adzuna** (optional): https://developer.adzuna.com/

### 3. Start the Application

```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### 5. Login Credentials

```
Email: test@gmail.com
Password: test@123
```

## 🎮 Usage Guide

### Step 1: Login and Upload Resume
1. Log in with demo credentials
2. Upload your resume (PDF or TXT)
3. AI will process and extract skills

### Step 2: Browse Jobs
1. Navigate to "Job Feed"
2. View AI match scores for each job
3. Use filters or ask AI assistant:
   - "Show remote jobs"
   - "Only high matches"

### Step 3: Apply to Jobs
1. Click "Apply Now" (opens in new tab)
2. Complete application on external site
3. Return and confirm application
4. Track status in "Applications"

### Step 4: Use AI Assistant
1. Click chat bubble (bottom-right)
2. Ask questions:
   - "Show full-time jobs in Mumbai"
   - "Where can I see my applications?"
   - "How does matching work?"
3. AI controls filters directly!

### Step 5: Manage Applications
1. View kanban board in "Applications"
2. Update status: Applied → Interview → Offer
3. Track timeline for each application

## 🤖 AI Components Explained

### LangChain (Job Matching)
```javascript
// Scoring pipeline
Resume + Job Description 
  → LLM Analysis 
  → Match Score (0-100) 
  → Detailed Explanation
```

**Scoring Criteria:**
- Technical skills match (40%)
- Experience relevance (30%)
- Keyword overlap (20%)
- Overall profile fit (10%)

### LangGraph (AI Assistant)
```javascript
// State machine flow
User Message 
  → Intent Detection 
  → Route to Node (Filter/Help/Chat)
  → Generate Response + Actions
  → Apply UI Changes
```

**Intent Categories:**
- `FILTER_CONTROL`: Change job filters
- `PRODUCT_HELP`: Feature guidance
- `APPLICATION_QUERY`: App status info
- `GENERAL_CHAT`: Conversation

## 📊 Data Flow

### Job Fetching with Fallback
```
1. Check Adzuna API credentials
2. If available → Call Adzuna API
3. If fails or missing → Use mockJobs.json
4. Apply client-side filters
5. Score with AI (if resume exists)
6. Return sorted by match score
```

### Application Tracking
```
1. User clicks "Apply Now"
2. Opens job URL in new tab
3. Shows confirmation popup
4. If confirmed → Create application record
5. Store in applications.json
6. Track status changes with timeline
```

### AI Filter Control
```
1. User types command in assistant
2. LangGraph detects FILTER_CONTROL intent
3. Extracts filter parameters via LLM
4. Sends filterActions to frontend
5. Frontend applies filters via CustomEvent
6. Job feed re-renders with filters
```

## 🔒 Security Notes

- Never commit `.env` file to version control
- API keys are read from environment variables
- Hardcoded auth is for demo only (production: use JWT, bcrypt)
- Resume files stored locally (production: use S3/cloud storage)

## 🐛 Troubleshooting

### "AI features not working"
- Check `OPENAI_API_KEY` in `.env`
- Verify API key is valid and has credits
- Check backend logs for errors

### "No jobs showing"
- Adzuna API may be rate-limited
- App automatically falls back to mock data
- Check backend logs for confirmation

### "Filters not applying"
- Make sure you're on Job Feed page
- Try clearing filters and reapplying
- Check browser console for errors

### "Resume upload failing"
- Verify file is PDF or TXT
- Check file size < 10MB
- Ensure backend is running

## 📈 Future Enhancements

- [ ] Email notifications for status changes
- [ ] Job alerts based on preferences
- [ ] Multi-user support with real auth
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced analytics dashboard
- [ ] Chrome extension for one-click applications
- [ ] LinkedIn integration
- [ ] Interview preparation AI assistant

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📧 Support

For issues or questions:
- Check troubleshooting section
- Review backend logs
- Open GitHub issue with details

---

**Built with ❤️ using LangChain, LangGraph, and OpenAI**
>>>>>>> 3aa507d (Initial commit - AI Powered Job Tracker)
