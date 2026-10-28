export const mockAtsResults = {
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
        details: 'Phone number is placed near top margin; ensure at least 0.5-inch page margin so headers are not truncated in older Taleo parsers.'
      },
      {
        rule: 'Graphics, Charts & Icons',
        status: 'passed',
        details: 'No vector charts or skill rating bars (e.g. 4/5 stars) which typically break ATS indexing.'
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
      { section: 'Education', detected: true, confidence: '100%' },
      { section: 'Certifications', detected: true, confidence: '90%' },
      { section: 'Publications / Awards', detected: true, confidence: '85%' }
    ],

    potentialAtsRisks: [
      {
        risk: 'Header Margin Tightness',
        severity: 'Low',
        solution: 'Increase top margin from 0.35in to 0.6in to ensure Taleo and legacy BrassRing parsers capture full contact details.'
      },
      {
        risk: 'Date Format Variation',
        severity: 'Low',
        solution: 'Use uniform Month Year format (e.g., "Jan 2024 - Present") instead of mixing slashes like "01/2024".'
      }
    ]
  },

  res_002: {
    resumeId: 'res_002',
    fileName: 'Alex_Morgan_Staff_Frontend_v2.docx',
    atsScore: 72,
    atsStatus: 'Moderate Risk',
    matchPercentage: 68,
    totalKeywordsDetected: 28,
    matchedKeywordsCount: 20,
    missingKeywordsCount: 8,
    matchedKeywords: [
      { name: 'React', category: 'Frontend', count: 5 },
      { name: 'JavaScript', category: 'Language', count: 4 },
      { name: 'CSS3', category: 'Frontend', count: 3 }
    ],
    missingKeywords: [
      { name: 'TypeScript', category: 'Language', importance: 'Critical', tip: 'Essential for staff frontend.' },
      { name: 'Testing Library', category: 'QA', importance: 'High', tip: 'Add Jest or Vitest.' }
    ],
    formattingAudit: [
      { rule: 'File Format Compatibility', status: 'passed', details: 'Docx file format is readable.' },
      { rule: 'Complex Tables', status: 'failed', details: 'Two-column table detected in skills section.' }
    ],
    sectionDetection: [
      { section: 'Contact Info', detected: true, confidence: '90%' },
      { section: 'Experience', detected: true, confidence: '85%' }
    ],
    potentialAtsRisks: [
      { risk: 'Table Column Scrambling', severity: 'High', solution: 'Remove tables and use unordered bullet points.' }
    ]
  }
};
