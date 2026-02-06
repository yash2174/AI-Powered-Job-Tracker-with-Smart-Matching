import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fastifyStatic from "@fastify/static";


// Services
import adzunaService from './services/adzunaService.js';
import aiMatchingService from './services/aiMatchingService.js';
import aiAssistantService from './services/aiAssistantService.js';
import dataService from './services/dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true
});

// 👉 SERVE FRONTEND BUILD
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../frontend"),
  prefix: "/", // serve at root
});

// 👉 SPA FALLBACK (VERY IMPORTANT)
fastify.get("/*", async (request, reply) => {
  return reply.sendFile("index.html");
});

// Register plugins
await fastify.register(cors, {
  origin: true
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Auth endpoints
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body;

  const user = await dataService.getUserByEmail(email);

  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      token: `token-${user.id}` // Simple token for demo
    };
  }

  reply.code(401);
  return { success: false, message: 'Invalid credentials' };
});

// Resume endpoints
fastify.post('/api/resume/upload', async (request, reply) => {
  try {
    const data = await request.file();
    const userId = request.headers['user-id'];

    if (!userId) {
      reply.code(401);
      return { success: false, message: 'User not authenticated' };
    }

    if (!data) {
      reply.code(400);
      return { success: false, message: 'No file uploaded' };
    }

    const buffer = await data.toBuffer();
    const filename = data.filename;
    let resumeText = '';

    // Extract text based on file type
    if (filename.endsWith('.pdf')) {
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text;
    } else if (filename.endsWith('.txt')) {
      resumeText = buffer.toString('utf-8');
    } else {
      reply.code(400);
      return { success: false, message: 'Only PDF and TXT files are supported' };
    }

    // Save resume
    await dataService.saveResume(userId, resumeText, filename);

    return {
      success: true,
      message: 'Resume uploaded successfully',
      filename
    };
  } catch (error) {
    console.error('Resume upload error:', error);
    reply.code(500);
    return { success: false, message: 'Failed to upload resume' };
  }
});

fastify.get('/api/resume', async (request, reply) => {
  const userId = request.headers['user-id'];

  if (!userId) {
    reply.code(401);
    return { success: false, message: 'User not authenticated' };
  }

  const user = await dataService.getUserByEmail('test@gmail.com');
  const resumeText = await dataService.getResume(userId);

  return {
    success: true,
    hasResume: !!resumeText,
    filename: user?.resumeFilename || null,
    uploadedAt: user?.resumeUploadedAt || null
  };
});

// Job endpoints
fastify.get('/api/jobs/search', async (request, reply) => {
  try {
    const {
      query = '',
      location = '',
      jobType = '',
      page = 1,
      limit = 50
    } = request.query;

    const userId = request.headers['user-id'];
    let resumeText = null;

    if (userId) {
      resumeText = await dataService.getResume(userId);
    }

    // Fetch jobs
    const jobsData = await adzunaService.searchJobs({
      what: query,
      where: location,
      contract_type: jobType,
      page: parseInt(page),
      results_per_page: parseInt(limit)
    });

    let jobs = jobsData.results;

    // Add AI match scores if resume exists
    if (resumeText && jobs.length > 0) {
      jobs = await aiMatchingService.batchScore(jobs, resumeText);
    } else {
      // Add default match data
      jobs = jobs.map(job => ({
        ...job,
        matchScore: 0,
        matchDetails: {
          score: 0,
          matchingSkills: [],
          relevantExperience: [],
          keywordOverlap: [],
          explanation: 'Upload your resume to see match scores'
        }
      }));
    }

    return {
      success: true,
      jobs,
      total: jobsData.count,
      source: jobsData.source,
      page: parseInt(page)
    };
  } catch (error) {
    console.error('Job search error:', error);
    reply.code(500);
    return { success: false, message: 'Failed to fetch jobs' };
  }
});

fastify.get('/api/jobs/best-matches', async (request, reply) => {
  const userId = request.headers['user-id'];

  if (!userId) {
    reply.code(401);
    return { success: false, message: 'User not authenticated' };
  }

  const resumeText = await dataService.getResume(userId);

  if (!resumeText) {
    return {
      success: true,
      jobs: [],
      message: 'Please upload your resume to see best matches'
    };
  }

  try {
    // Fetch jobs
    const jobsData = await adzunaService.searchJobs({
      results_per_page: 30
    });

    // Score all jobs
    const scoredJobs = await aiMatchingService.batchScore(jobsData.results, resumeText);

    // Get top 8 jobs with score > 40
    const bestMatches = scoredJobs.filter(job => job.matchScore >= 40).slice(0, 8);

    return {
      success: true,
      jobs: bestMatches
    };
  } catch (error) {
    console.error('Best matches error:', error);
    reply.code(500);
    return { success: false, message: 'Failed to fetch best matches' };
  }
});

// Application tracking endpoints
fastify.get('/api/applications', async (request, reply) => {
  const userId = request.headers['user-id'];

  if (!userId) {
    reply.code(401);
    return { success: false, message: 'User not authenticated' };
  }

  const applications = await dataService.getApplications(userId);

  return {
    success: true,
    applications
  };
});

fastify.post('/api/applications', async (request, reply) => {
  const userId = request.headers['user-id'];

  if (!userId) {
    reply.code(401);
    return { success: false, message: 'User not authenticated' };
  }

  const { jobId, jobTitle, company, status, location, jobUrl } = request.body;

  // Check if already applied
  const existing = await dataService.getApplicationByJobId(userId, jobId);
  if (existing) {
    return {
      success: false,
      message: 'Application already exists for this job'
    };
  }

  const application = await dataService.addApplication({
    userId,
    jobId,
    jobTitle,
    company,
    location,
    jobUrl,
    status: status || 'applied',
    timeline: [{
      status: status || 'applied',
      date: new Date().toISOString(),
      note: 'Application submitted'
    }]
  });

  return {
    success: true,
    application
  };
});

fastify.put('/api/applications/:id', async (request, reply) => {
  const userId = request.headers['user-id'];
  const { id } = request.params;

  if (!userId) {
    reply.code(401);
    return { success: false, message: 'User not authenticated' };
  }

  const { status, note } = request.body;

  const applications = await dataService.getApplications(userId);
  const app = applications.find(a => a.id === id);

  if (!app) {
    reply.code(404);
    return { success: false, message: 'Application not found' };
  }

  const timeline = app.timeline || [];
  timeline.push({
    status,
    date: new Date().toISOString(),
    note: note || `Status updated to ${status}`
  });

  const updated = await dataService.updateApplication(id, {
    status,
    timeline
  });

  return {
    success: true,
    application: updated
  };
});

fastify.post('/api/assistant/chat', async (request, reply) => {
  const userId = request.headers['user-id'] || 'test-user';
  const { message } = request.body;

  if (!message) {
    return reply.code(400).send({
      success: false,
      reply: 'Message is required'
    });
  }

  const response = await aiAssistantService.processQuery(userId, message);

  return {
    success: true,
    reply: response.reply,
    filterActions: response.filterActions
  };
});


// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
