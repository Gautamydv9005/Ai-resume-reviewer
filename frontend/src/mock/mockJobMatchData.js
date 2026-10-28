export const mockJobMatchResults = {
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
      { name: 'Distributed REST APIs', level: 'Advanced', relevance: 'Core Requirement' },
      { name: 'State Management', level: 'Expert', relevance: 'Preferred' },
      { name: 'WebSockets & Real-Time Data', level: 'Intermediate', relevance: 'Bonus' }
    ],

    skillsToImprove: [
      { name: 'Docker Containerization', priority: 'High', reason: 'Mentioned 4 times in job description for staging and production parity.' },
      { name: 'AWS Cloud Services (ECS, Lambda)', priority: 'High', reason: 'Essential for Stripe payment routing services.' },
      { name: 'Redis / Distributed Caching', priority: 'High', reason: 'Critical for session and idempotency token management.' },
      { name: 'CI/CD Pipelines (GitHub Actions)', priority: 'Medium', reason: 'Expected for senior engineers managing release health.' },
      { name: 'Kubernetes Pod Lifecycle', priority: 'Medium', reason: 'Nice-to-have for microservice orchestration.' }
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
      { name: 'ArgoCD / GitOps', duration: '1 week', impact: '+4% Job Match' },
      { name: 'eBPF / Telemetry Monitoring', duration: '2 weeks', impact: '+3% Job Match' }
    ]
  },

  res_002: {
    resumeId: 'res_002',
    jobTitle: 'Staff Frontend Architect',
    company: 'Airbnb',
    jobMatchScore: 70,
    matchVerdict: 'Moderate Match',
    summary: 'Solid frontend background, but needs more documentation on cross-team design systems.',
    roleFitBreakdown: [
      { area: 'Design Systems', score: 68, status: 'Moderate Gap' },
      { area: 'Performance Optimization', score: 72, status: 'Good Match' }
    ],
    matchingSkills: [
      { name: 'React', level: 'Expert', relevance: 'Core' },
      { name: 'JavaScript', level: 'Expert', relevance: 'Core' }
    ],
    skillsToImprove: [
      { name: 'TypeScript', priority: 'High', reason: 'Required for all Airbnb web repositories.' }
    ],
    relevantExperienceAnalysis: [
      { aspect: 'Staff Leadership', required: 'Experience driving org-wide initiatives', found: 'Individual contributor projects', match: false }
    ],
    recommendedSkillsToLearn: [
      { name: 'Module Federation', duration: '1 week', impact: '+8% Job Match' }
    ]
  }
};
