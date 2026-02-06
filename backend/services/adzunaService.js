import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdzunaService {
  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.apiKey = process.env.ADZUNA_API_KEY;
    this.baseUrl = 'https://api.adzuna.com/v1/api/jobs';
    this.country = 'in'; // India
    this.mockDataPath = path.join(__dirname, '../data/mockJobs.json');
  }

  async searchJobs(params = {}) {
    const {
      what = '',
      where = '',
      results_per_page = 50,
      page = 1,
      max_days_old = 30,
      category = '',
      contract_type = ''
    } = params;

    // Try Adzuna API first if credentials are available
    if (this.appId && this.apiKey) {
      try {
        const queryParams = new URLSearchParams({
          app_id: this.appId,
          app_key: this.apiKey,
          results_per_page: results_per_page.toString(),
          what,
          where,
          page: page.toString()
        });

        if (max_days_old) {
          queryParams.append('max_days_old', max_days_old.toString());
        }

        if (category) {
          queryParams.append('category', category);
        }

        const url = `${this.baseUrl}/${this.country}/search/1?${queryParams.toString()}`;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✓ Fetched jobs from Adzuna API');
          return {
            results: data.results || [],
            count: data.count || 0,
            source: 'adzuna'
          };
        } else {
          console.warn(`Adzuna API returned status ${response.status}, falling back to mock data`);
          return await this.getMockJobs(params);
        }
      } catch (error) {
        console.error('Error fetching from Adzuna API:', error.message);
        console.log('Falling back to mock data');
        return await this.getMockJobs(params);
      }
    } else {
      console.log('Adzuna credentials not found, using mock data');
      return await this.getMockJobs(params);
    }
  }

  async getMockJobs(params = {}) {
    try {
      const mockData = await fs.readFile(this.mockDataPath, 'utf-8');
      let jobs = JSON.parse(mockData).jobs;

      // Apply filters
      const { what = '', where = '', contract_type = '' } = params;

      if (what) {
        const searchTerm = what.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm)
        );
      }

      if (where) {
        const location = where.toLowerCase();
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(location)
        );
      }

      if (contract_type) {
        jobs = jobs.filter(job => 
          job.contract_type === contract_type
        );
      }

      return {
        results: jobs,
        count: jobs.length,
        source: 'mock'
      };
    } catch (error) {
      console.error('Error reading mock data:', error);
      return {
        results: [],
        count: 0,
        source: 'mock',
        error: error.message
      };
    }
  }
}

export default new AdzunaService();
