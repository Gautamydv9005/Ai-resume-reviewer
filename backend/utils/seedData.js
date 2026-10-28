/**
 * Seed data for MongoDB & In-Memory fallback store
 */

export const defaultUser = {
  id: 'usr_88291',
  name: 'Alex Morgan',
  email: 'alex.morgan@techcareer.io',
  password: 'Password123!', // Will be hashed when seeded into Mongo
  role: 'Senior Full Stack Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  plan: 'Pro Plan',
  resumesAnalyzed: 14,
  averageAtsScore: 86,
  averageJobMatch: 81,
  targetRole: 'Lead Frontend Engineer / Full Stack Architect',
  location: 'San Francisco, CA (Open to Remote)',
  joinedDate: 'January 2026',
  isVerified: true
};

export const defaultResumes = [
  {
    id: 'res_001',
    userId: 'usr_88291',
    fileName: 'Alex_Morgan_Senior_Engineer_2026.pdf',
    date: 'Sep 21, 2026',
    rawDate: '2026-09-21T10:14:00Z',
    fileSize: '412 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-21T10:14:00Z',
    targetJobTitle: 'Senior Full Stack Engineer',
    targetCompany: 'Stripe',
    status: 'Completed',
    extractedText: 'Alex Morgan\nSenior Full Stack Engineer\nEmail: alex.morgan@techcareer.io | Phone: (415) 890-1234\nLinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan\n\nPROFESSIONAL SUMMARY\nSenior Full Stack Engineer with 6+ years of expertise designing and delivering high-concurrency distributed systems using React, TypeScript, Node.js, and PostgreSQL. Experienced in AWS microservices, payment gateways, and mentoring engineering teams.\n\nTECHNICAL SKILLS\nLanguages: JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3\nFrontend: React 19, Next.js, Redux Toolkit, Tailwind CSS\nBackend: Node.js, Express, REST APIs, Microservices, GraphQL\nDatabases: PostgreSQL, MongoDB, Redis\nDevOps: Docker, Git, CI/CD Pipelines, AWS Lambda, Linux\n\nWORK EXPERIENCE\nSenior Software Engineer — TechCorp (2023 - Present)\n- Architected high-throughput payment checkout services serving 2M+ monthly transactions.\n- Optimized database indexing in PostgreSQL, lowering p95 query latency by 35%.\n- Led migration of monolith frontend to React 19 and modular design system.\n\nSoftware Engineer — Global Apps (2020 - 2023)\n- Engineered RESTful microservices in Node.js and MongoDB.\n- Implemented automated CI/CD pipeline using GitHub Actions and Docker.\n\nEDUCATION\nB.S. in Computer Science — University of California (2016 - 2020)\n\nCERTIFICATIONS\nAWS Certified Solutions Architect – Associate',
    overallScore: 84,
    atsScore: 89,
    jobMatchScore: 78,
    skillsScore: 92,
    experienceScore: 86,
    notes: 'Optimized with Stripe job description'
  },
  {
    id: 'res_002',
    userId: 'usr_88291',
    fileName: 'Alex_Morgan_Staff_Frontend_v2.docx',
    date: 'Sep 18, 2026',
    rawDate: '2026-09-18T16:45:00Z',
    fileSize: '298 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2026-09-18T16:45:00Z',
    targetJobTitle: 'Staff Frontend Architect',
    targetCompany: 'Airbnb',
    status: 'Completed',
    overallScore: 76,
    atsScore: 72,
    jobMatchScore: 70,
    skillsScore: 80,
    experienceScore: 75,
    notes: 'Draft before removing tables'
  },
  {
    id: 'res_003',
    userId: 'usr_88291',
    fileName: 'Alex_Morgan_AI_Engineer_Draft.pdf',
    date: 'Sep 10, 2026',
    rawDate: '2026-09-10T09:30:00Z',
    fileSize: '520 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-10T09:30:00Z',
    targetJobTitle: 'AI Platform Engineer',
    targetCompany: 'OpenAI',
    status: 'Completed',
    overallScore: 91,
    atsScore: 93,
    jobMatchScore: 88,
    skillsScore: 95,
    experienceScore: 90,
    notes: 'Contains ML model serving metrics'
  }
];

export const defaultAnalyses = {
  res_001: {
    id: 'anl_001',
    resumeId: 'res_001',
    fileName: 'Alex_Morgan_Senior_Engineer_2026.pdf',
    analyzedAt: '2026-09-21T10:15:32Z',
    targetJobTitle: 'Senior Full Stack Engineer',
    targetCompany: 'Stripe',
    scores: {
      overall: 84,
      ats: 89,
      jobMatch: 78,
      readability: 92,
      impact: 81
    },
    summaryVerdict: {
      tier: 'Strong Candidate',
      badge: 'Top 10% ATS Compatible',
      headline: 'Your resume shows robust full-stack engineering achievements and passes top-tier ATS screeners with ease.',
      nextStepAdvice: 'To reach 90+ overall, replace subjective verbs with quantified system performance metrics and add cloud orchestration keywords.'
    },
    sections: [
      {
        id: 'contact',
        name: 'Contact Information',
        score: 98,
        status: 'Excellent',
        items: [
          'Professional email and phone number clearly visible',
          'Clean LinkedIn profile URL and verified GitHub link',
          'Location formatted with city and state without unnecessary full street address'
        ],
        suggestion: 'Consider adding a portfolio or technical blog link if applicable.'
      },
      {
        id: 'summary',
        name: 'Professional Summary',
        score: 75,
        status: 'Needs Polish',
        items: [
          'Clear statement of current seniority and primary stack',
          'Good concise length (3-4 sentences)'
        ],
        suggestion: 'The summary relies on generic claims. Quantify total impact such as "$10M+ transaction volume handled" or "scaled services to 2M+ DAU".'
      },
      {
        id: 'experience',
        name: 'Work Experience',
        score: 86,
        status: 'Good',
        items: [
          'Reverse chronological timeline with clear company names and role titles',
          'Strong action verbs (Architected, Spearheaded, Optimized)',
          'High relevance to modern distributed systems'
        ],
        suggestion: 'Add specific business results and latency improvements in 2 bullet points under your current role.'
      },
      {
        id: 'skills',
        name: 'Technical Skills',
        score: 92,
        status: 'Excellent',
        items: [
          'Categorized effectively: Languages, Frameworks, Cloud, Databases',
          'Modern relevant technologies (TypeScript, React 19, Node.js, PostgreSQL, Docker)',
          'No outdated technologies cluttering the top fold'
        ],
        suggestion: 'Add CI/CD pipelines (GitHub Actions, ArgoCD) and Terraform to improve cloud infra scoring.'
      },
      {
        id: 'projects',
        name: 'Key Projects',
        score: 83,
        status: 'Good',
        items: [
          'Relevant high-concurrency fintech and real-time dashboard applications',
          'Tech stacks clearly identified per project item'
        ],
        suggestion: 'Provide live demo links or public GitHub repository links for open-source contributions.'
      },
      {
        id: 'education',
        name: 'Education',
        score: 95,
        status: 'Excellent',
        items: [
          'B.S. in Computer Science from accredited university',
          'Clean formatting with graduation year and honors'
        ],
        suggestion: 'Formatting is optimal for ATS parsers. No changes needed.'
      },
      {
        id: 'certifications',
        name: 'Certifications',
        score: 80,
        status: 'Good',
        items: [
          'AWS Certified Solutions Architect – Associate listed',
          'Issue date and credential ID present'
        ],
        suggestion: 'Add Kubernetes CKA or HashiCorp Terraform certification to stand out for senior cloud roles.'
      },
      {
        id: 'achievements',
        name: 'Achievements & Awards',
        score: 78,
        status: 'Needs Polish',
        items: [
          'Internal hackathon 1st place award included',
          'Patents or publications section noted'
        ],
        suggestion: 'Connect hackathon win directly to business adoption: how was the prototype deployed to production?'
      }
    ],
    feedback: {
      strengths: [
        {
          id: 'str_1',
          title: 'Strong Technical Stack Alignment',
          description: 'Your proficiencies in React, TypeScript, Node.js, and PostgreSQL directly match 90%+ of modern full-stack requirements.',
          impact: 'High Impact'
        },
        {
          id: 'str_2',
          title: 'Clear Career Progression',
          description: 'Documented advancement from Junior to Senior Engineer demonstrates consistent high performance and adaptability.',
          impact: 'High Impact'
        },
        {
          id: 'str_3',
          title: 'ATS-Friendly Structure',
          description: 'Standard single-column hierarchy with clean headers and bullet points ensures 100% parse rate on Workday, Greenhouse, and Lever.',
          impact: 'Medium Impact'
        }
      ],
      weaknesses: [
        {
          id: 'weak_1',
          title: 'Under-Quantified Impact in Middle Roles',
          description: 'Several bullet points describe day-to-day responsibilities rather than measurable business or performance metrics.',
          impact: 'High Impact'
        },
        {
          id: 'weak_2',
          title: 'Missing Container Orchestration Keywords',
          description: 'Kubernetes, Helm, and microservice service mesh terms are absent from the cloud infrastructure section.',
          impact: 'Medium Impact'
        },
        {
          id: 'weak_3',
          title: 'Generic Soft Skills Phrasing',
          description: 'Phrases like "great team player" and "cross-functional collaborator" take up valuable resume space without evidence.',
          impact: 'Low Impact'
        }
      ],
      suggestions: [
        {
          id: 'sug_1',
          title: 'Adopt the Google X-Y-Z Formula',
          description: 'Rewrite bullet points using "Accomplished [X] as measured by [Y], by doing [Z]" to boost recruiter evaluation.',
          action: 'Update experience section bullets',
          priority: 'High'
        },
        {
          id: 'sug_2',
          title: 'Incorporate Missing High-Demand Keywords',
          description: 'Integrate Docker, AWS Lambda, GraphQL, and Redis naturally within your recent project bullets.',
          action: 'Insert 4 target keywords',
          priority: 'High'
        },
        {
          id: 'sug_3',
          title: 'Elevate Lead & Mentorship Indicators',
          description: 'Explicitly state the number of engineers mentored and code reviews conducted to validate your Senior level.',
          action: 'Add leadership metrics',
          priority: 'Medium'
        }
      ]
    },
    improvements: [
      {
        id: 'imp_summary',
        section: 'Summary',
        sectionTitle: 'Professional Summary',
        original: 'Passionate and hardworking Full Stack Developer with 5+ years of experience in JavaScript, React, and Node.js. Looking for a challenging senior engineering position in a forward-thinking company.',
        suggested: 'Senior Full Stack Engineer with 6+ years of expertise architecting high-throughput distributed web systems (React, TypeScript, Node.js, AWS). Delivered 42% latency reduction for fintech checkout pipelines serving 3M+ monthly transactions. Proven record mentoring 8+ engineers and scaling cloud microservices.',
        rationale: 'Replaces passive clichés with hard metrics, core architectural competencies, and quantified scale.'
      },
      {
        id: 'imp_exp_1',
        section: 'Experience',
        sectionTitle: 'Senior Software Engineer — Lead Payment Gateway',
        original: 'Responsible for developing the checkout page and integrating payment gateways like Stripe and PayPal. Fixed bugs and participated in sprint meetings.',
        suggested: 'Spearheaded redesign of checkout microservices using React 19, TypeScript, and Redis caching, cutting average transaction drop-off by 18% and boosting payment throughput to 1,200 req/sec during peak flash sales.',
        rationale: 'Demonstrates ownership, scale, measurable drop-off reduction, and exact tech stack utilized.'
      }
    ]
  }
};

export const defaultAtsReports = {
  res_001: {
    resumeId: 'res_001',
    fileName: 'Alex_Morgan_Senior_Engineer_2026.pdf',
    atsScore: 89,
    atsStatus: 'Pass Candidate Screening',
    matchPercentage: 86,
    totalKeywordsDetected: 42,
    matchedKeywordsCount: 36,
    missingKeywordsCount: 6,
    matchedKeywords: [
      { name: 'JavaScript', category: 'Programming Language', count: 7 },
      { name: 'TypeScript', category: 'Programming Language', count: 5 },
      { name: 'React', category: 'Frontend', count: 8 },
      { name: 'Node.js', category: 'Backend', count: 6 },
      { name: 'PostgreSQL', category: 'Database', count: 3 },
      { name: 'REST APIs', category: 'Architecture', count: 4 },
      { name: 'Git', category: 'DevOps & Tooling', count: 3 },
      { name: 'Unit Testing', category: 'Quality Assurance', count: 2 },
      { name: 'Microservices', category: 'Architecture', count: 3 },
      { name: 'Agile / Scrum', category: 'Methodology', count: 2 },
      { name: 'System Design', category: 'Architecture', count: 2 },
      { name: 'Tailwind CSS', category: 'Frontend', count: 2 }
    ],
    missingKeywords: [
      { name: 'Docker', category: 'DevOps', importance: 'Critical', tip: 'Mention containerizing Node microservices.' },
      { name: 'AWS Lambda', category: 'Cloud Infrastructure', importance: 'High', tip: 'Add serverless functions experience.' },
      { name: 'Redis', category: 'Database / Caching', importance: 'High', tip: 'Highlight caching strategies for APIs.' },
      { name: 'CI/CD Pipeline', category: 'DevOps', importance: 'High', tip: 'Add GitHub Actions or GitLab CI setup.' },
      { name: 'Kubernetes', category: 'DevOps', importance: 'Medium', tip: 'Mention pod deployment or orchestration.' },
      { name: 'GraphQL', category: 'API Architecture', importance: 'Medium', tip: 'Mention GraphQL schemas if applicable.' }
    ],
    formattingAudit: [
      {
        rule: 'File Format Compatibility',
        status: 'passed',
        details: 'Standard searchable PDF format; text layer is fully extractable by modern ATS optical parsers.'
      },
      {
        rule: 'Single-Column Layout',
        status: 'passed',
        details: 'Linear text flow guarantees parser will not scramble reading order.'
      },
      {
        rule: 'Standard ATS Section Headings',
        status: 'passed',
        details: 'Standard headings used (Summary, Experience, Education, Skills, Projects).'
      },
      {
        rule: 'Complex Tables & Nested Grids',
        status: 'passed',
        details: 'No HTML or Word tables found; lists are formatted using standard bullets.'
      },
      {
        rule: 'Header & Footer Text Placement',
        status: 'warning',
        details: 'Phone number is placed near top margin; ensure at least 0.5-inch page margin.'
      },
      {
        rule: 'Graphics, Charts & Icons',
        status: 'passed',
        details: 'No vector charts or skill rating bars which typically break ATS indexing.'
      },
      {
        rule: 'Font Readability',
        status: 'passed',
        details: 'Universal font family (Inter / Arial fallback) with standard 10-12pt sizing.'
      }
    ],
    sectionDetection: [
      { section: 'Contact Info', detected: true, confidence: '100%' },
      { section: 'Executive Summary', detected: true, confidence: '98%' },
      { section: 'Work History', detected: true, confidence: '100%' },
      { section: 'Technical Skills', detected: true, confidence: '96%' },
      { section: 'Projects', detected: true, confidence: '94%' },
      { section: 'Education', detected: true, confidence: '100%' }
    ]
  }
};

export const defaultJobMatches = {
  res_001: {
    resumeId: 'res_001',
    jobTitle: 'Senior Full Stack Engineer',
    company: 'Stripe',
    jobMatchScore: 78,
    matchVerdict: 'High Probability Match for Technical Screen',
    summary: 'Your profile demonstrates strong alignment with Stripe\'s primary stack (React, Node, distributed services). Addressing 3 missing cloud infrastructure keywords will boost your candidacy to the top percentile.',
    roleFitBreakdown: [
      { area: 'Frontend Architecture', score: 92, status: 'Strong Match' },
      { area: 'Backend API Engineering', score: 86, status: 'Strong Match' },
      { area: 'Cloud & Infrastructure', score: 62, status: 'Moderate Gap' },
      { area: 'System Scalability & Performance', score: 80, status: 'Good Match' },
      { area: 'Engineering Leadership', score: 75, status: 'Good Match' }
    ],
    matchingSkills: [
      { name: 'JavaScript / ES6+', level: 'Expert', relevance: 'Core Requirement' },
      { name: 'TypeScript', level: 'Expert', relevance: 'Core Requirement' },
      { name: 'React 18 / 19', level: 'Expert', relevance: 'Core Requirement' },
      { name: 'Node.js', level: 'Advanced', relevance: 'Core Requirement' },
      { name: 'PostgreSQL', level: 'Advanced', relevance: 'Core Requirement' },
      { name: 'Distributed REST APIs', level: 'Advanced', relevance: 'Core Requirement' }
    ],
    skillsToImprove: [
      { name: 'Docker Containerization', priority: 'High', reason: 'Mentioned 4 times in job description for staging and production parity.' },
      { name: 'AWS Cloud Services (ECS, Lambda)', priority: 'High', reason: 'Essential for Stripe payment routing services.' },
      { name: 'Redis / Distributed Caching', priority: 'High', reason: 'Critical for session and idempotency token management.' }
    ],
    relevantExperienceAnalysis: [
      {
        aspect: 'Seniority & Years of Experience',
        required: '5+ years in full-stack web engineering',
        found: '6.2 years verified across 2 technology firms',
        match: true
      },
      {
        aspect: 'Scale & Concurrency Handling',
        required: 'Experience with high-volume transactional services',
        found: 'Handled 3M+ monthly transactions in payment gateway role',
        match: true
      },
      {
        aspect: 'Cloud Infrastructure Ownership',
        required: 'Hands-on IaC (Terraform) and container orchestration',
        found: 'Basic AWS EC2/S3 mentioned, but lacks Terraform or Kubernetes',
        match: false
      }
    ],
    recommendedSkillsToLearn: [
      { name: 'Terraform (IaC)', duration: '1-2 weeks', impact: '+6% Job Match' },
      { name: 'Kubernetes Pod Lifecycle', duration: '2 weeks', impact: '+5% Job Match' }
    ]
  }
};
