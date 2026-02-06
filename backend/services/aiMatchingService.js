import "dotenv/config";
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

class AIMatchingService {
  constructor() {
    this.llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.3
    });
    this.outputParser = new StringOutputParser();
  }

  async scoreJob(job, resumeText) {
    if (!resumeText || !job) {
      return {
        score: 0,
        explanation: 'Unable to calculate match score',
        matchingSkills: [],
        relevantExperience: [],
        keywordOverlap: []
      };
    }

    const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert job matching AI. Analyze how well a candidate's resume matches a job posting.

Job Title: {jobTitle}
Company: {company}
Job Description: {jobDescription}

Candidate Resume:
{resumeText}

Provide a detailed analysis in the following JSON format:
{{
  "score": <number between 0-100>,
  "matchingSkills": [<list of skills from resume that match the job>],
  "relevantExperience": [<relevant work experience or projects from resume>],
  "keywordOverlap": [<important keywords that appear in both resume and job description>],
  "explanation": "<detailed explanation of the match score>"
}}

Score based on:
- Technical skills match (40%)
- Experience relevance (30%)
- Keyword overlap (20%)
- Overall profile fit (10%)

Return ONLY valid JSON, no additional text.
    `);

    try {
      const chain = promptTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
        resumeText: resumeText.substring(0, 3000) // Limit resume text to avoid token limits
      });

      // Parse JSON response
      const parsed = JSON.parse(result);
      
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        matchingSkills: parsed.matchingSkills || [],
        relevantExperience: parsed.relevantExperience || [],
        keywordOverlap: parsed.keywordOverlap || [],
        explanation: parsed.explanation || 'No explanation available'
      };
    } catch (error) {
      console.error('Error in AI matching:', error);
      
      // Fallback to basic keyword matching if AI fails
      return this.fallbackMatching(job, resumeText);
    }
  }

  fallbackMatching(job, resumeText) {
    const resumeLower = resumeText.toLowerCase();
    const descLower = job.description.toLowerCase();
    
    // Extract common tech keywords
    const techKeywords = [
      'react', 'node', 'javascript', 'python', 'java', 'typescript',
      'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'api',
      'frontend', 'backend', 'fullstack', 'devops', 'ml', 'ai'
    ];
    
    const matchingKeywords = techKeywords.filter(keyword => 
      resumeLower.includes(keyword) && descLower.includes(keyword)
    );
    
    const score = Math.min(100, matchingKeywords.length * 10 + 20);
    
    return {
      score,
      matchingSkills: matchingKeywords,
      relevantExperience: ['Basic keyword analysis performed'],
      keywordOverlap: matchingKeywords,
      explanation: `Found ${matchingKeywords.length} matching keywords between your resume and this job posting.`
    };
  }

  async batchScore(jobs, resumeText) {
    const scoredJobs = await Promise.all(
      jobs.map(async (job) => {
        const matchData = await this.scoreJob(job, resumeText);
        return {
          ...job,
          matchScore: matchData.score,
          matchDetails: matchData
        };
      })
    );

    // Sort by match score
    return scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
  }

  getMatchLevel(score) {
    if (score > 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  getMatchColor(score) {
    if (score > 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'gray';
  }
}

export default new AIMatchingService();
