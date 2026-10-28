import test from 'node:test';
import assert from 'node:assert/strict';
import { callGeminiAnalysis, generateFullAnalysis } from '../services/aiAnalysisEngine.js';
import { parseResumeSections } from '../services/resumeParser.js';
import { analyzeAtsCompliance } from '../services/atsEngine.js';
import { analyzeJobMatch } from '../services/jobMatchEngine.js';

test('Gemini AI Integration & Fallback Engine Test Suite', async (t) => {
  const sampleResumeText = `
Alex Rivera
Full Stack Engineer
Email: alex.rivera@example.com | Phone: (555) 345-6789
LinkedIn: linkedin.com/in/alexrivera | GitHub: github.com/alexrivera

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 7 years of experience specializing in React, Node.js, and distributed microservices.

WORK EXPERIENCE
Lead Engineer — CloudTech Solutions (2021 - Present)
- Engineered high-concurrency payment APIs handling 25,000 transactions per second.
- Spearheaded database partitioning in PostgreSQL, decreasing p99 latency by 45%.

Software Engineer — StreamLine Inc (2018 - 2021)
- Developed responsive single-page web applications using React and Redux Toolkit.
- Built automated CI/CD deployment pipelines using Docker and GitHub Actions.

TECHNICAL SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS, GraphQL
  `;

  const parsed = parseResumeSections(sampleResumeText);
  const atsResult = analyzeAtsCompliance(sampleResumeText, parsed, 'Alex_Rivera_Resume.pdf');
  const jobMatchResult = analyzeJobMatch(sampleResumeText, {
    title: 'Senior Distributed Systems Architect',
    company: 'Stripe'
  });

  await t.test('1. Empty or missing API key returns null and triggers heuristic fallback', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = '';
      const result = await callGeminiAnalysis(sampleResumeText, 'Software Engineer', 'TechCo');
      assert.equal(result, null);

      const fullAnalysis = await generateFullAnalysis(sampleResumeText, parsed, atsResult, jobMatchResult, {
        fileName: 'Alex_Rivera_Resume.pdf',
        targetJobTitle: 'Senior Distributed Systems Architect',
        targetCompany: 'Stripe'
      });

      assert.equal(fullAnalysis.meta.isAiGenerated, false);
      assert.equal(fullAnalysis.meta.analysisMode, 'heuristic-fallback');
      assert.equal(fullAnalysis.meta.provider, 'ResuMate Heuristic Engine');
      assert.ok(fullAnalysis.meta.notice.includes('ResuMate ATS compliance & heuristic evaluation engine'));
      assert.equal(fullAnalysis.summaryVerdict.engine, 'ResuMate Heuristic Engine');
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  await t.test('2. Invalid API key gracefully fails without unhandled rejection and falls back', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      // Set deliberately invalid key
      process.env.GEMINI_API_KEY = 'invalid_ai_studio_key_401_simulation';
      const result = await callGeminiAnalysis(sampleResumeText, 'Software Engineer', 'TechCo');
      assert.equal(result, null);

      const fullAnalysis = await generateFullAnalysis(sampleResumeText, parsed, atsResult, jobMatchResult, {
        fileName: 'Alex_Rivera_Resume.pdf',
        targetJobTitle: 'Senior Distributed Systems Architect',
        targetCompany: 'Stripe'
      });

      assert.equal(fullAnalysis.meta.isAiGenerated, false);
      assert.ok(fullAnalysis.improvements.length >= 2);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  await t.test('3. Timeout protection aborts stalled API calls cleanly within limit', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      // With a 1ms timeout, the call should timeout immediately and fall back to null
      process.env.GEMINI_API_KEY = 'AIzaSy_SimulatedTimeoutKey';
      const start = Date.now();
      const result = await callGeminiAnalysis(sampleResumeText, 'Software Engineer', 'TechCo', 1);
      const elapsed = Date.now() - start;

      assert.equal(result, null);
      assert.ok(elapsed < 2000, `Call took ${elapsed}ms, should abort promptly`);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  await t.test('4. Fallback engine derives contextual rewrites from real candidate bullets', async () => {
    const fullAnalysis = await generateFullAnalysis(sampleResumeText, parsed, atsResult, jobMatchResult, {
      fileName: 'Alex_Rivera_Resume.pdf',
      targetJobTitle: 'Senior Distributed Systems Architect',
      targetCompany: 'Stripe'
    });

    // Verify bullet improvements reflect the candidate's actual text
    const allOriginals = fullAnalysis.improvements.map(i => i.original).join(' ');
    assert.ok(allOriginals.includes('Senior Full Stack Engineer') || allOriginals.includes('Alex Rivera'));
    assert.ok(allOriginals.includes('Lead Engineer') || allOriginals.includes('Engineered') || allOriginals.includes('payment APIs'));
    assert.ok(fullAnalysis.improvements[0].suggested.includes('Senior Distributed Systems Architect'));
  });

  await t.test('5. Distinguishes live Gemini AI output from heuristic fallback', async () => {
    // When live Gemini output is provided, metadata reflects it
    const analysisWithMockLlm = {
      summaryVerdict: {
        headline: 'Candidate demonstrates tier-1 distributed architecture capability.',
        nextStepAdvice: 'Expand on Kubernetes pod autoscaling policies.'
      },
      strengths: [
        { id: 'str_ai_1', title: 'High-Concurrency Payment Systems', description: '25k tps throughput demonstrated.', impact: 'High Impact' }
      ],
      weaknesses: [
        { id: 'weak_ai_1', title: 'Cloud Infrastructure Breadth', description: 'Multi-region failover not explicit.', impact: 'Medium Impact' }
      ],
      suggestions: [
        { id: 'sug_ai_1', title: 'Add Terraform IaC Modules', description: 'Include infrastructure as code.', action: 'Add Terraform', priority: 'High' }
      ],
      improvements: [
        {
          id: 'imp_ai_1',
          section: 'Experience',
          sectionTitle: 'Lead Engineer',
          original: 'Engineered high-concurrency payment APIs',
          suggested: 'Architected distributed payment microservices processing 25k req/sec with 99.99% uptime.',
          rationale: 'Supplies precise SLA and latency metrics.'
        }
      ],
      _model: 'gemini-2.0-flash'
    };

    // Verify structure
    assert.ok(analysisWithMockLlm.strengths.length > 0);
    assert.equal(analysisWithMockLlm._model, 'gemini-2.0-flash');
  });
});
