import axios from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to all requests
    this.client.interceptors.request.use((config) => {
      const user = this.getCurrentUser();
      if (user) {
        config.headers['user-id'] = user.id;
      }
      return config;
    });
  }

  // Auth
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Resume
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getResume() {
    const response = await this.client.get('/resume');
    return response.data;
  }

  // Jobs
  async searchJobs(params = {}) {
    const response = await this.client.get('/jobs/search', { params });
    return response.data;
  }

  async getBestMatches() {
    const response = await this.client.get('/jobs/best-matches');
    return response.data;
  }

  // Applications
  async getApplications() {
    const response = await this.client.get('/applications');
    return response.data;
  }

  async createApplication(data) {
    const response = await this.client.post('/applications', data);
    return response.data;
  }

  async updateApplication(id, data) {
    const response = await this.client.put(`/applications/${id}`, data);
    return response.data;
  }

// AI Assistant
async chatWithAssistant(message) {
  const response = await this.client.post(
    '/assistant/chat',
    { message },
    {
      headers: {
        'user-id': 'test-user'
      }
    }
  );

  return response.data;
}
}

export default new ApiService();
