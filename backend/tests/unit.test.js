import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { parseResumeSections } from '../services/resumeParser.js';
import { analyzeAtsCompliance, TECH_KEYWORDS_DICTIONARY } from '../services/atsEngine.js';
import { analyzeJobMatch, evaluateOnTheFly } from '../services/jobMatchEngine.js';
import { extractTextFromFile } from '../services/textExtractor.js';
import { generateFullAnalysis } from '../services/aiAnalysisEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Resume Parser - extracts contact info and standard sections', () => {
  const sampleResume = `
Jane Doe
Senior Full Stack Engineer
Email: jane.doe@example.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/janedoe
GitHub: github.com/janedoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years of expertise in React, Node.js, and cloud systems.

TECHNICAL SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS

WORK EXPERIENCE
Senior Engineer at TechCo (2022 - Present)
- Architected scalable REST microservices handling 50k requests per minute.
- Reduced database response latency by 40% with Redis caching.

EDUCATION
B.S. in Computer Science - State University (2018 - 2022)

CERTIFICATIONS
AWS Certified Solutions Architect
  `;

  const parsed = parseResumeSections(sampleResume);

  assert.equal(parsed.contact.email, 'jane.doe@example.com');
  assert.equal(parsed.contact.phone, '(555) 123-4567');
  assert.equal(parsed.contact.linkedin, 'https://linkedin.com/in/janedoe');
  assert.equal(parsed.contact.github, 'https://github.com/janedoe');

  assert.ok(parsed.sections.summary.includes('Experienced software engineer'));
  assert.ok(parsed.sections.skills.includes('React'));
  assert.ok(parsed.sections.experience.includes('TechCo'));
  assert.ok(parsed.sections.education.includes('State University'));
  assert.ok(parsed.sections.certifications.includes('AWS Certified'));

  assert.ok(parsed.wordCount > 50);
  assert.equal(parsed.estimatedPages, 1);
});

test('ATS Engine - detects matched and missing keywords', () => {
  const sampleText = `
    Skilled in JavaScript, React, Node.js, Docker, Git, PostgreSQL, REST APIs.
  `;
  const parsed = parseResumeSections(sampleText);
  const result = analyzeAtsCompliance(sampleText, parsed, 'Resume.pdf');

  assert.ok(result.atsScore >= 60 && result.atsScore <= 100);
  assert.ok(result.matchedKeywordsCount >= 5);
  assert.ok(result.formattingAudit.length >= 5);

  const matchedNames = result.matchedKeywords.map(k => k.name);
  assert.ok(matchedNames.includes('React'));
  assert.ok(matchedNames.includes('Node.js'));
  assert.ok(matchedNames.includes('Docker'));

  const missingNames = result.missingKeywords.map(k => k.name);
  assert.ok(missingNames.includes('Kubernetes') || missingNames.includes('Python') || missingNames.includes('TypeScript'));
});

test('Job Match Engine - evaluates skill alignment and calculates score', () => {
  const resumeText = `
    Experienced with React, TypeScript, Node.js, and PostgreSQL.
  `;
  const jobData = {
    title: 'Senior Frontend Engineer',
    company: 'Acme Corp',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes']
  };

  const match = analyzeJobMatch(resumeText, jobData);

  assert.equal(match.jobTitle, 'Senior Frontend Engineer');
  assert.equal(match.company, 'Acme Corp');
  assert.ok(match.jobMatchScore >= 60 && match.jobMatchScore <= 100);
  assert.ok(match.matchingSkills.some(s => s.name === 'React'));
  assert.ok(match.skillsToImprove.some(s => s.name === 'Docker' || s.name === 'Kubernetes'));

  // On-the-fly matcher
  const onTheFly = evaluateOnTheFly(resumeText, 'Looking for React, Node.js, and Docker developer');
  assert.ok(onTheFly.skillsIdentified.includes('React'));
  assert.ok(onTheFly.skillsIdentified.includes('Node.js'));
  assert.ok(onTheFly.missingSkills.includes('Docker'));
});

test('Text Extractor - handles missing and corrupted files gracefully', async () => {
  // Non-existent file
  const missingText = await extractTextFromFile('non_existent_file.pdf', 'test.pdf');
  assert.equal(missingText, '');

  // Corrupted PDF file
  const tempCorruptPath = path.join(__dirname, 'temp_corrupt.pdf');
  fs.writeFileSync(tempCorruptPath, 'THIS IS NOT A VALID PDF CONTENT');

  try {
    const corruptText = await extractTextFromFile(tempCorruptPath, 'corrupt.pdf');
    assert.equal(corruptText, '');
  } finally {
    if (fs.existsSync(tempCorruptPath)) fs.unlinkSync(tempCorruptPath);
  }
});

test('AI Analysis Engine - synthesizes dynamic report with contextual suggestions', async () => {
  const resumeText = `
Jane Doe - Software Engineer
Email: jane@example.com | Phone: 555-0199
PROFESSIONAL SUMMARY
Software developer specializing in React and Node.js microservices.
WORK EXPERIENCE
Software Engineer at Global Tech
- Developed authentication microservices using JWT and Redis.
- Implemented real-time dashboard components in React.
TECHNICAL SKILLS
React, Node.js, Redis, PostgreSQL
  `;

  const parsed = parseResumeSections(resumeText);
  const atsResult = analyzeAtsCompliance(resumeText, parsed, 'Jane_Doe_Resume.pdf');
  const jobMatchResult = analyzeJobMatch(resumeText, { title: 'Senior Full Stack Engineer', company: 'Google' });

  const analysis = await generateFullAnalysis(resumeText, parsed, atsResult, jobMatchResult, {
    fileName: 'Jane_Doe_Resume.pdf',
    targetJobTitle: 'Senior Full Stack Engineer',
    targetCompany: 'Google'
  });

  assert.ok(analysis.scores.overall >= 50 && analysis.scores.overall <= 100);
  assert.ok(analysis.scores.ats >= 50);
  assert.ok(analysis.scores.jobMatch >= 50);
  assert.ok(analysis.sections.length >= 6);
  assert.ok(analysis.feedback.strengths.length >= 1);
  assert.ok(analysis.feedback.weaknesses.length >= 1);
  assert.ok(analysis.feedback.suggestions.length >= 1);
  assert.ok(analysis.improvements.length >= 2);

  // Verify that the improvements are contextual and not hardcoded Alex Morgan checkout text
  assert.ok(analysis.improvements.some(i => i.original.includes('Software developer') || i.original.includes('Jane Doe') || i.original.includes('authentication') || i.original.includes('Developed')));
});
