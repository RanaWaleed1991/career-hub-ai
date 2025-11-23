import { env } from '../config/env.js';

interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  category: {
    label: string;
    tag: string;
  };
}

interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
  mean?: number;
}

export interface MappedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  category: 'tech' | 'accounting' | 'casual';
  external_id: string;
  external_url: string;
  salary_min?: number;
  salary_max?: number;
  source: 'manual' | 'adzuna';
  posted_date: string;
}

export class AdzunaService {
  private baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private country = 'au'; // Australia
  private appId: string;
  private appKey: string;

  constructor() {
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_API_KEY) {
      throw new Error('Adzuna API credentials not configured');
    }
    this.appId = env.ADZUNA_APP_ID;
    this.appKey = env.ADZUNA_API_KEY;
  }

  /**
   * Search jobs from Adzuna API
   */
  async searchJobs(params: {
    what?: string; // Search term
    where?: string; // Location
    category?: string; // Job category tag
    resultsPerPage?: number;
    page?: number;
  }): Promise<AdzunaSearchResponse> {
    const {
      what = '',
      where = '',
      category = '',
      resultsPerPage = 50,
      page = 1,
    } = params;

    const queryParams = new URLSearchParams({
      app_id: this.appId,
      app_key: this.appKey,
      results_per_page: resultsPerPage.toString(),
      what,
      where,
      ...(category && { category }),
    });

    const url = `${this.baseUrl}/${this.country}/search/${page}?${queryParams}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as AdzunaSearchResponse;
      return data;
    } catch (error) {
      console.error('Failed to fetch jobs from Adzuna:', error);
      throw error;
    }
  }

  /**
   * Map Adzuna job category to our internal category
   */
  private mapCategory(adzunaCategory: string): 'tech' | 'accounting' | 'casual' {
    const categoryLower = adzunaCategory.toLowerCase();

    // Tech keywords
    if (
      categoryLower.includes('it') ||
      categoryLower.includes('software') ||
      categoryLower.includes('developer') ||
      categoryLower.includes('engineering') ||
      categoryLower.includes('tech')
    ) {
      return 'tech';
    }

    // Accounting keywords
    if (
      categoryLower.includes('account') ||
      categoryLower.includes('finance') ||
      categoryLower.includes('bookkeeping')
    ) {
      return 'accounting';
    }

    // Default to casual
    return 'casual';
  }

  /**
   * Clean and truncate description
   */
  private cleanDescription(description: string, maxLength: number = 500): string {
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Truncate if needed
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }

    return cleaned;
  }

  /**
   * Map Adzuna jobs to our database schema
   */
  mapJobs(adzunaJobs: AdzunaJob[]): MappedJob[] {
    return adzunaJobs.map((job) => ({
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || job.location?.area?.[0] || 'Remote',
      description: this.cleanDescription(job.description),
      category: this.mapCategory(job.category?.label || job.category?.tag || ''),
      external_id: job.id,
      external_url: job.redirect_url,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      source: 'adzuna',
      posted_date: job.created,
    }));
  }

  /**
   * Fetch and map tech jobs
   */
  async fetchTechJobs(limit: number = 20, location?: string): Promise<MappedJob[]> {
    const response = await this.searchJobs({
      what: 'software developer OR engineer OR programmer',
      where: location,
      resultsPerPage: limit,
    });
    return this.mapJobs(response.results);
  }

  /**
   * Fetch and map accounting jobs
   */
  async fetchAccountingJobs(limit: number = 20, location?: string): Promise<MappedJob[]> {
    const response = await this.searchJobs({
      what: 'accountant OR bookkeeper OR finance',
      where: location,
      resultsPerPage: limit,
    });
    return this.mapJobs(response.results);
  }

  /**
   * Fetch and map casual jobs
   */
  async fetchCasualJobs(limit: number = 20, location?: string): Promise<MappedJob[]> {
    const response = await this.searchJobs({
      what: 'retail OR hospitality OR customer service',
      where: location,
      resultsPerPage: limit,
    });
    return this.mapJobs(response.results);
  }

  /**
   * Fetch jobs for all categories
   */
  async fetchAllCategoryJobs(limitPerCategory: number = 20, location?: string): Promise<{
    tech: MappedJob[];
    accounting: MappedJob[];
    casual: MappedJob[];
  }> {
    const [tech, accounting, casual] = await Promise.all([
      this.fetchTechJobs(limitPerCategory, location),
      this.fetchAccountingJobs(limitPerCategory, location),
      this.fetchCasualJobs(limitPerCategory, location),
    ]);

    return { tech, accounting, casual };
  }
}
