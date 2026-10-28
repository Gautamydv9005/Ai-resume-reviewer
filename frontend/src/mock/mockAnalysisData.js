export const mockAnalysisResults = {
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
      },
      {
        id: 'imp_projects',
        section: 'Projects',
        sectionTitle: 'Real-time Financial Telemetry Engine',
        original: 'Built a web dashboard that shows cryptocurrency prices with charts using WebSockets and React.',
        suggested: 'Architected real-time WebSocket telemetry engine handling 25,000 concurrent market ticks/sec with React, Go, and Kafka; optimized client canvas rendering to achieve steady 60 FPS under heavy data loads.',
        rationale: 'Transforms an ordinary hobby project into an enterprise-grade engineering showcase with concurrency figures.'
      },
      {
        id: 'imp_skills',
        section: 'Skills',
        sectionTitle: 'Cloud & DevOps Section',
        original: 'Cloud: AWS (EC2, S3), Git, Linux',
        suggested: 'Cloud & Infrastructure: AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, Terraform, GitHub Actions CI/CD, Prometheus/Grafana',
        rationale: 'Injects top-priority ATS keywords for cloud-native engineering without keyword stuffing.'
      },
      {
        id: 'imp_achievements',
        section: 'Achievements',
        sectionTitle: 'Company Innovation Award',
        original: 'Won 1st place in company internal hackathon in 2024 for an AI assistant.',
        suggested: 'Awarded 1st Place (out of 45 engineering teams) in 2024 Global Hackathon for developing an automated SQL query optimization agent, subsequently adopted by enterprise DevOps reducing cloud compute bills by $48K/yr.',
        rationale: 'Adds competitive context and tangible dollar savings resulting from the achievement.'
      }
    ]
  },

  // Fallback / secondary mock for comparison & quick previews
  res_002: {
    id: 'anl_002',
    resumeId: 'res_002',
    fileName: 'Alex_Morgan_Staff_Frontend_v2.docx',
    analyzedAt: '2026-09-18T16:47:10Z',
    targetJobTitle: 'Staff Frontend Architect',
    targetCompany: 'Airbnb',

    scores: {
      overall: 76,
      ats: 72,
      jobMatch: 70,
      readability: 84,
      impact: 69
    },

    summaryVerdict: {
      tier: 'Good Foundation',
      badge: 'Moderate ATS Compatibility',
      headline: 'Resume shows solid engineering experience but lacks key architectural scale indicators and contains formatting tables.',
      nextStepAdvice: 'Remove two-column Word tables that confuse older ATS parsers, and enrich frontend design systems metrics.'
    },

    sections: [
      { id: 'contact', name: 'Contact Information', score: 94, status: 'Excellent', items: ['Clear email and phone', 'Missing GitHub URL'], suggestion: 'Add your active GitHub profile.' },
      { id: 'summary', name: 'Professional Summary', score: 68, status: 'Needs Polish', items: ['Short overview', 'Vague impact statements'], suggestion: 'Highlight design systems and frontend performance numbers.' },
      { id: 'experience', name: 'Work Experience', score: 75, status: 'Good', items: ['React and JavaScript listed', 'Lacks design system scale metrics'], suggestion: 'Detail multi-brand UI kit adoption numbers.' },
      { id: 'skills', name: 'Technical Skills', score: 80, status: 'Good', items: ['Frontend heavy', 'Missing accessibility & web vitals'], suggestion: 'Include WCAG 2.1 AA, Web Vitals, and Module Federation.' },
      { id: 'projects', name: 'Key Projects', score: 70, status: 'Needs Polish', items: ['Good screenshots mentioned', 'No metrics on bundle size reduction'], suggestion: 'Specify webpack/vite bundle size savings.' },
      { id: 'education', name: 'Education', score: 90, status: 'Excellent', items: ['B.S. Computer Science'], suggestion: 'Optimal.' },
      { id: 'certifications', name: 'Certifications', score: 65, status: 'Needs Polish', items: ['Outdated frontend course listed'], suggestion: 'Remove 2021 tutorial certificates.' },
      { id: 'achievements', name: 'Achievements', score: 70, status: 'Good', items: ['Speaker at local meetup'], suggestion: 'List talk topic and attendee count.' }
    ],

    feedback: {
      strengths: [
        { id: 'str_21', title: 'Strong React Framework Expertise', description: 'Deep frontend focus evident.', impact: 'High Impact' },
        { id: 'str_22', title: 'Continuous Career Duration', description: 'No unexplained gaps in employment.', impact: 'Medium Impact' }
      ],
      weaknesses: [
        { id: 'weak_21', title: 'Table Formatting in DOCX', description: 'Tables often break parser order.', impact: 'High Impact' },
        { id: 'weak_22', title: 'Missing Web Performance Metrics', description: 'No LCP, CLS, or Core Web Vitals measured.', impact: 'High Impact' }
      ],
      suggestions: [
        { id: 'sug_21', title: 'Switch to Single Column Layout', description: 'Convert table columns into linear headers.', action: 'Refactor layout', priority: 'High' }
      ]
    },

    improvements: []
  }
};
