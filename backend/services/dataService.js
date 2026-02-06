import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.applicationsFile = path.join(this.dataDir, 'applications.json');
    this.resumesDir = path.join(this.dataDir, 'resumes');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.resumesDir, { recursive: true });
      
      // Initialize users file
      try {
        await fs.access(this.usersFile);
      } catch {
        await fs.writeFile(this.usersFile, JSON.stringify({
          users: [{
            id: 'user-1',
            email: 'test@gmail.com',
            password: 'test@123',
            name: 'Test User',
            createdAt: new Date().toISOString()
          }]
        }, null, 2));
      }

      // Initialize applications file
      try {
        await fs.access(this.applicationsFile);
      } catch {
        await fs.writeFile(this.applicationsFile, JSON.stringify({
          applications: []
        }, null, 2));
      }
    } catch (error) {
      console.error('Error initializing data service:', error);
    }
  }

  async getUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf-8');
      return JSON.parse(data).users;
    } catch (error) {
      return [];
    }
  }

  async getUserByEmail(email) {
    const users = await this.getUsers();
    return users.find(u => u.email === email);
  }

  async updateUser(userId, updates) {
    const data = await fs.readFile(this.usersFile, 'utf-8');
    const parsed = JSON.parse(data);
    
    const userIndex = parsed.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      parsed.users[userIndex] = { ...parsed.users[userIndex], ...updates };
      await fs.writeFile(this.usersFile, JSON.stringify(parsed, null, 2));
      return parsed.users[userIndex];
    }
    return null;
  }

  async saveResume(userId, resumeText, filename) {
    const resumePath = path.join(this.resumesDir, `${userId}.txt`);
    await fs.writeFile(resumePath, resumeText, 'utf-8');
    
    await this.updateUser(userId, {
      resumeFilename: filename,
      resumePath,
      resumeUploadedAt: new Date().toISOString()
    });

    return resumePath;
  }

  async getResume(userId) {
    const resumePath = path.join(this.resumesDir, `${userId}.txt`);
    try {
      return await fs.readFile(resumePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  async getApplications(userId) {
    try {
      const data = await fs.readFile(this.applicationsFile, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.applications.filter(a => a.userId === userId);
    } catch (error) {
      return [];
    }
  }

  async addApplication(application) {
    const data = await fs.readFile(this.applicationsFile, 'utf-8');
    const parsed = JSON.parse(data);
    
    const newApp = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...application,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    parsed.applications.push(newApp);
    await fs.writeFile(this.applicationsFile, JSON.stringify(parsed, null, 2));
    
    return newApp;
  }

  async updateApplication(applicationId, updates) {
    const data = await fs.readFile(this.applicationsFile, 'utf-8');
    const parsed = JSON.parse(data);
    
    const appIndex = parsed.applications.findIndex(a => a.id === applicationId);
    if (appIndex !== -1) {
      parsed.applications[appIndex] = {
        ...parsed.applications[appIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await fs.writeFile(this.applicationsFile, JSON.stringify(parsed, null, 2));
      return parsed.applications[appIndex];
    }
    return null;
  }

  async getApplicationByJobId(userId, jobId) {
    const applications = await this.getApplications(userId);
    return applications.find(a => a.jobId === jobId);
  }
}

export default new DataService();
