// Mock jobs data for local development when MOCK_JOBS=1
import { v4 as uuid } from 'uuid';

export interface MockJob {
  id: string;
  title: string;
  description: string;
  location: string;
  remote: string;
  type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  created_at: string;
  expires_at: string | null;
  featured: boolean;
  urgent: boolean;
  employer: {
    id: string;
    company_name: string;
    logo: string | null;
    industry?: string;
  };
  job_skills: Array<{ skill: { id: string; name: string } }>;
  applications_count: Array<{ count: number }>;
}

const industries = ["Technology","Finance","Healthcare","Hospitality","Education"]; 
const locations = ["Nicosia","Limassol","Larnaca","Paphos","Remote"];
const types = ["FULL_TIME","PART_TIME","CONTRACT"];

function random<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)]; }

export const mockJobs: MockJob[] = Array.from({ length: 24 }).map((_, i) => {
  const salaryMin = 1800 + Math.floor(Math.random()*1500);
  const salaryMax = salaryMin + 800 + Math.floor(Math.random()*1200);
  return {
    id: uuid(),
    title: ["Software Engineer","Marketing Specialist","Finance Analyst","Nurse Practitioner","Project Manager","Data Analyst"][i % 6] + ` ${i+1}`,
    description: "This is a mock job description showcasing responsibilities and requirements for the role. Improve by integrating real data.",
    location: random(locations),
    remote: Math.random() > 0.6 ? 'REMOTE' : '',
    type: random(types),
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: 'EUR',
    created_at: new Date(Date.now() - Math.random()*1000*60*60*24*14).toISOString(),
    expires_at: null,
    featured: Math.random() > 0.7,
    urgent: Math.random() > 0.85,
    employer: {
      id: uuid(),
      company_name: ["Acme Corp","CyTech Solutions","FinServe Ltd","HealthPlus","EduSmart"][i % 5],
      logo: null,
      industry: random(industries)
    },
    job_skills: [
      { skill: { id: uuid(), name: "Communication" } },
      { skill: { id: uuid(), name: "Teamwork" } },
    ],
    applications_count: [{ count: Math.floor(Math.random()*50) }]
  };
});

export function filterMockJobs(params: URLSearchParams) {
  let filtered = [...mockJobs];
  const q = params.get('q') || params.get('query');
  const location = params.get('location');
  const featured = params.get('featured');

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(j => j.title.toLowerCase().includes(lower) || j.description.toLowerCase().includes(lower));
  }
  if (location) {
    const lower = location.toLowerCase();
    filtered = filtered.filter(j => j.location.toLowerCase().includes(lower));
  }
  if (featured === 'true') {
    filtered = filtered.filter(j => j.featured);
  }
  return filtered;
}
