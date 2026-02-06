# System Architecture Documentation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                       │
│                                                                       │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Dashboard  │  │ Job Feed │  │ Applications │  │ AI Assistant │ │
│  │            │  │          │  │              │  │   (Chat UI)  │ │
│  │ - Stats    │  │ - Search │  │ - Kanban     │  │              │ │
│  │ - Best     │  │ - Filters│  │ - Timeline   │  │ - NL Cmds   │ │
│  │   Matches  │  │ - Cards  │  │ - Status Upd │  │ - Filter Ctl │ │
│  └────────────┘  └──────────┘  └──────────────┘  └──────────────┘ │
│                                                                       │
│                     React Router + API Service                       │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTP/REST
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                        APPLICATION LAYER                            │
│                         Fastify Server                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     Route Handlers                            │ │
│  │                                                               │ │
│  │  /auth/login          /jobs/search       /applications       │ │
│  │  /resume/upload       /jobs/best-matches /applications/:id   │ │
│  │  /resume              /assistant/chat                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Multipart    │  │ CORS         │  │ Request      │            │
│  │ Upload       │  │ Middleware   │  │ Logging      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────▼──────┐    ┌──────────▼────────────────────┐
│     BUSINESS LOGIC       │    │      AI/ML LAYER              │
│                          │    │                                │
│  ┌────────────────────┐ │    │  ┌──────────────────────────┐│
│  │ adzunaService      │ │    │  │ aiMatchingService        ││
│  │ - Job fetching     │ │    │  │ (LangChain)              ││
│  │ - API fallback     │ │    │  │                          ││
│  │ - Mock data        │ │    │  │ ┌────────────────────┐  ││
│  └────────────────────┘ │    │  │ │ Prompt Templates   │  ││
│                          │    │  │ │ - Match analysis   │  ││
│  ┌────────────────────┐ │    │  │ │ - Scoring logic    │  ││
│  │ dataService        │ │    │  │ └────────────────────┘  ││
│  │ - User management  │ │    │  │                          ││
│  │ - Resume storage   │ │    │  │ ┌────────────────────┐  ││
│  │ - Applications     │ │    │  │ │ OpenAI LLM         │  ││
│  │ - JSON file I/O    │ │    │  │ │ gpt-3.5-turbo      │  ││
│  └────────────────────┘ │    │  │ └────────────────────┘  ││
│                          │    │  │                          ││
│                          │    │  │ Output: Match Score +    ││
│                          │    │  │         Explanation       ││
│                          │    │  └──────────────────────────┘│
│                          │    │                                │
│                          │    │  ┌──────────────────────────┐│
│                          │    │  │ aiAssistantService       ││
│                          │    │  │ (LangGraph)              ││
│                          │    │  │                          ││
│                          │    │  │ ┌────────────────────┐  ││
│                          │    │  │ │ State Graph        │  ││
│                          │    │  │ │                    │  ││
│                          │    │  │ │ Intent Detection   │  ││
│                          │    │  │ │       │            │  ││
│                          │    │  │ │  ┌────┴─────┐     │  ││
│                          │    │  │ │  │          │     │  ││
│                          │    │  │ │ Filter   Help     │  ││
│                          │    │  │ │  Node     Node    │  ││
│                          │    │  │ │    │       │      │  ││
│                          │    │  │ │    └───┬───┘      │  ││
│                          │    │  │ │        │          │  ││
│                          │    │  │ │    Chat Node      │  ││
│                          │    │  │ └────────────────────┘  ││
│                          │    │  │                          ││
│                          │    │  │ Conversation History     ││
│                          │    │  │ Filter Extraction        ││
│                          │    │  └──────────────────────────┘│
└──────────────────────────┘    └────────────┬──────────────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │   OpenAI API      │
                                   │   GPT-3.5-turbo   │
                                   └───────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ users.json       │  │ applications.json│  │ resumes/         │ │
│  │                  │  │                  │  │                  │ │
│  │ - Credentials    │  │ - Job apps       │  │ - user-1.txt     │ │
│  │ - Resume meta    │  │ - Status         │  │ - user-2.txt     │ │
│  │ - User info      │  │ - Timeline       │  │ - ...            │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ mockJobs.json                                                 │  │
│  │ - Fallback job data when Adzuna API unavailable              │  │
│  │ - 12 sample jobs with various attributes                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
│                                                                       │
│  ┌─────────────────────┐         ┌─────────────────────┐           │
│  │  Adzuna Job API     │         │    OpenAI API       │           │
│  │                     │         │                     │           │
│  │  - Job search       │         │  - GPT-3.5-turbo    │           │
│  │  - Location filter  │         │  - Text generation  │           │
│  │  - Category filter  │         │  - JSON parsing     │           │
│  │                     │         │  - Match scoring    │           │
│  │  Rate Limits:       │         │  - Intent detection │           │
│  │  Free: 750/month    │         │                     │           │
│  └─────────────────────┘         └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Job Search & Matching Flow

```
User enters search query in Job Feed
            │
            ▼
    ┌───────────────┐
    │ Frontend      │
    │ JobFeed.jsx   │
    └───────┬───────┘
            │ GET /api/jobs/search?query=...
            ▼
    ┌───────────────┐
    │ Backend       │
    │ Route Handler │
    └───────┬───────┘
            │
            ▼
    ┌───────────────────┐
    │ adzunaService     │
    │ searchJobs()      │
    └───────┬───────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
  API Call     Mock Data
  Success?     Fallback
     │             │
     └──────┬──────┘
            │ Job Results
            ▼
    ┌───────────────────┐
    │ Check Resume      │
    │ Exists?           │
    └───────┬───────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
   Yes           No
     │             │
     ▼             │
┌────────────────┐ │
│aiMatchingService│ │
│batchScore()    │ │
└────┬───────────┘ │
     │             │
     ▼             │
┌────────────────┐ │
│For each job:   │ │
│- Extract resume│ │
│- Build prompt  │ │
│- Call OpenAI   │ │
│- Parse score   │ │
└────┬───────────┘ │
     │             │
     └──────┬──────┘
            │ Scored Jobs
            ▼
    ┌───────────────┐
    │ Apply client  │
    │ side filters  │
    │ - workMode    │
    │ - matchScore  │
    │ - datePosted  │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ Return to     │
    │ Frontend      │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ Render job    │
    │ cards with    │
    │ match badges  │
    └───────────────┘
```

### 2. AI Assistant Conversation Flow (LangGraph)

```
User types message in chat
            │
            ▼
    ┌───────────────────┐
    │ Layout.jsx        │
    │ handleSendMessage()│
    └───────┬───────────┘
            │ POST /api/assistant/chat
            ▼
    ┌───────────────────┐
    │ Route Handler     │
    │ /assistant/chat   │
    └───────┬───────────┘
            │
            ▼
    ┌─────────────────────────┐
    │ aiAssistantService      │
    │ processQuery()          │
    └───────┬─────────────────┘
            │
            ▼
    ┌─────────────────────────┐
    │ STEP 1: Intent Detection│
    │ detectIntent()          │
    │                         │
    │ LLM Call:               │
    │ "Classify user intent"  │
    │                         │
    │ Returns: FILTER_CONTROL │
    │         PRODUCT_HELP    │
    │         APPLICATION_QRY │
    │         GENERAL_CHAT    │
    └───────┬─────────────────┘
            │ Intent identified
            ▼
    ┌─────────────────────────┐
    │ STEP 2: LangGraph       │
    │ executeLangGraph()      │
    │                         │
    │ Build State Graph:      │
    │                         │
    │    ┌──────────┐         │
    │    │  ENTRY   │         │
    │    └────┬─────┘         │
    │         │               │
    │    ┌────┴──────┐        │
    │    │ Intent?   │        │
    │    └───┬───┬───┘        │
    │        │   │            │
    │   ┌────┘   └────┐       │
    │   │             │       │
    │   ▼             ▼       │
    │ Filter        Help      │
    │  Node         Node      │
    │   │             │       │
    │   └──────┬──────┘       │
    │          │              │
    │          ▼              │
    │      Chat Node          │
    │          │              │
    │          ▼              │
    │        END              │
    └───────┬─────────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
Filter Node    Help Node
     │             │
     │             │
     ▼             ▼
extractFilters() generateHelp()
     │             │
     │ LLM Call    │ LLM Call
     │ "Extract    │ "Answer
     │  filters"   │  question"
     │             │
     │ Returns:    │ Returns:
     │ {workMode,  │ "You can..."
     │  location}  │
     │             │
     └──────┬──────┘
            │
            ▼
    ┌───────────────────┐
    │ Generate Response │
    │ + Filter Actions  │
    └───────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Return to         │
    │ Frontend          │
    │ {                 │
    │   reply: "...",   │
    │   filterActions   │
    │ }                 │
    └───────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Frontend applies  │
    │ filters via       │
    │ CustomEvent       │
    │                   │
    │ JobFeed listens   │
    │ Updates state     │
    │ Re-fetches jobs   │
    └───────────────────┘
```

### 3. Application Tracking Flow

```
User clicks "Apply Now"
            │
            ▼
    ┌───────────────────┐
    │ JobCard.jsx       │
    │ handleApplyClick()│
    └───────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Open job URL in   │
    │ new tab           │
    └───────┬───────────┘
            │ (async)
            ▼
    ┌───────────────────┐
    │ Show confirmation │
    │ modal after 500ms │
    │                   │
    │ Options:          │
    │ - Yes, Applied    │
    │ - Applied Earlier │
    │ - Just Browsing   │
    └───────┬───────────┘
            │ User selects
            ▼
     ┌──────┴──────┐
     │             │
     ▼             ▼
 Applied?        No
     │             │
     ▼             │
POST /api/applications │
     │             │
     ▼             │
┌────────────────┐ │
│dataService     │ │
│addApplication()│ │
│                │ │
│- Generate ID   │ │
│- Save to JSON  │ │
│- Init timeline │ │
└────┬───────────┘ │
     │             │
     └──────┬──────┘
            │
            ▼
    ┌───────────────────┐
    │ Close modal       │
    │ Refresh dashboard │
    └───────────────────┘

Later: User updates status
            │
            ▼
    ┌───────────────────┐
    │ Applications.jsx  │
    │ Kanban board      │
    └───────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Click status btn  │
    │ (Interview/Offer) │
    └───────┬───────────┘
            │
            ▼
PUT /api/applications/:id
            │
            ▼
    ┌───────────────────┐
    │ dataService       │
    │ updateApplication()│
    │                   │
    │ - Update status   │
    │ - Add timeline    │
    │   event           │
    │ - Save to JSON    │
    └───────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Re-render UI      │
    │ Show new status   │
    │ Update timeline   │
    └───────────────────┘
```

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|---------------|---------|
| **Frontend Components** | | |
| Login | API Service | Authentication |
| Layout | All pages, AI Assistant | Navigation + Chat |
| Dashboard | API (best-matches, applications) | Stats display |
| JobFeed | API (jobs/search), AI Assistant | Job listing + filtering |
| JobCard | API (applications) | Job display + apply |
| Applications | API (applications) | Status tracking |
| ResumeUpload | API (resume/upload) | File upload |
| **Backend Services** | | |
| adzunaService | Adzuna API, mockJobs.json | Job fetching |
| aiMatchingService | OpenAI API, LangChain | Resume-job matching |
| aiAssistantService | OpenAI API, LangGraph | Conversational AI |
| dataService | JSON files | Data persistence |

## Security Architecture

```
┌─────────────────────────────────────────┐
│           Security Layers               │
├─────────────────────────────────────────┤
│ 1. Transport Layer                      │
│    - HTTPS in production                │
│    - SSL/TLS certificates               │
├─────────────────────────────────────────┤
│ 2. Authentication Layer                 │
│    - Session tokens (demo)              │
│    - TODO: JWT tokens                   │
│    - TODO: Password hashing (bcrypt)    │
├─────────────────────────────────────────┤
│ 3. Authorization Layer                  │
│    - User-ID header validation          │
│    - Per-user data isolation            │
│    - File access controls               │
├─────────────────────────────────────────┤
│ 4. API Security                         │
│    - Environment variable secrets       │
│    - Rate limiting (planned)            │
│    - Input validation                   │
│    - CORS configuration                 │
├─────────────────────────────────────────┤
│ 5. Data Layer                           │
│    - File system permissions            │
│    - No sensitive data in logs          │
│    - Resume data encryption (planned)   │
└─────────────────────────────────────────┘
```

## Performance Optimization Strategies

### Current Implementation
- Client-side filtering for work mode and match score
- Batch AI scoring for multiple jobs
- Resume text caching in memory
- Debounced search input (500ms)

### Future Optimizations
1. **Caching Layer**: Redis for job results (1hr TTL)
2. **AI Optimization**: 
   - Pre-compute match scores for popular jobs
   - Queue AI requests for background processing
3. **Database**: 
   - Migrate to PostgreSQL for better queries
   - Add indexes on commonly filtered fields
4. **CDN**: CloudFlare for static assets
5. **Load Balancing**: Multiple backend instances

## Scalability Considerations

### Current Limitations
- JSON file storage (not suitable for >1000 users)
- Synchronous AI processing
- Single server instance
- No distributed session management

### Scaling Path
```
Stage 1 (0-100 users)
├── Current architecture
└── Single server + JSON files

Stage 2 (100-1000 users)
├── Add database (PostgreSQL)
├── Add Redis for caching
└── Optimize AI calls

Stage 3 (1000-10000 users)
├── Multiple backend instances
├── Load balancer
├── Separate AI service
└── CDN for assets

Stage 4 (10000+ users)
├── Microservices architecture
├── Message queue for AI
├── Dedicated search service
└── Multi-region deployment
```

---

This architecture is designed for clarity, maintainability, and future scaling while keeping the initial implementation simple and functional.
