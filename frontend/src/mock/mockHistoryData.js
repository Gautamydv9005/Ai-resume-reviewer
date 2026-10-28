export const initialResumeHistory = [
  {
    id: 'res_001',
    fileName: 'Alex_Morgan_Senior_Engineer_2026.pdf',
    date: 'Sep 21, 2026',
    rawDate: '2026-09-21T10:14:00Z',
    fileSize: '412 KB',
    targetJobTitle: 'Senior Full Stack Engineer',
    targetCompany: 'Stripe',
    atsScore: 89,
    jobMatchScore: 78,
    overallScore: 84,
    skillsScore: 92,
    experienceScore: 86,
    status: 'Completed',
    notes: 'Optimized with Stripe job description'
  },
  {
    id: 'res_002',
    fileName: 'Alex_Morgan_Staff_Frontend_v2.docx',
    date: 'Sep 18, 2026',
    rawDate: '2026-09-18T16:45:00Z',
    fileSize: '298 KB',
    targetJobTitle: 'Staff Frontend Architect',
    targetCompany: 'Airbnb',
    atsScore: 72,
    jobMatchScore: 70,
    overallScore: 76,
    skillsScore: 80,
    experienceScore: 75,
    status: 'Completed',
    notes: 'Draft before removing tables'
  },
  {
    id: 'res_003',
    fileName: 'Alex_Morgan_AI_Engineer_Draft.pdf',
    date: 'Sep 10, 2026',
    rawDate: '2026-09-10T09:30:00Z',
    fileSize: '520 KB',
    targetJobTitle: 'AI Platform Engineer',
    targetCompany: 'OpenAI',
    atsScore: 93,
    jobMatchScore: 88,
    overallScore: 91,
    skillsScore: 95,
    experienceScore: 90,
    status: 'Completed',
    notes: 'Contains ML model serving metrics'
  },
  {
    id: 'res_004',
    fileName: 'Alex_Morgan_General_Software_v1.pdf',
    date: 'Aug 28, 2026',
    rawDate: '2026-09-02T14:20:00Z',
    fileSize: '380 KB',
    targetJobTitle: 'Full Stack Developer',
    targetCompany: 'General Applications',
    atsScore: 68,
    jobMatchScore: 64,
    overallScore: 70,
    skillsScore: 74,
    experienceScore: 68,
    status: 'Completed',
    notes: 'Old baseline resume'
  }
];

export const comparisonMetrics = [
  { key: 'overallScore', label: 'Overall Score', max: 100, unit: '/100' },
  { key: 'atsScore', label: 'ATS Compatibility Score', max: 100, unit: '%' },
  { key: 'jobMatchScore', label: 'Job Match Score', max: 100, unit: '%' },
  { key: 'skillsScore', label: 'Technical Skills Score', max: 100, unit: '%' },
  { key: 'experienceScore', label: 'Experience Impact Score', max: 100, unit: '%' }
];

export const sampleImprovements = [
  'Added quantified business metrics across all recent job positions (+14% Impact)',
  'Removed two-column layout and nested tables, resolving 3 ATS parsing blockers',
  'Integrated high-priority keywords: Docker, AWS ECS, TypeScript, PostgreSQL',
  'Rewrote Professional Summary using active leadership language instead of generic traits',
  'Strengthened Projects section with architecture diagrams and live demo links'
];
