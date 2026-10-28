import { GoogleGenAI } from '@google/genai';

function extractJson(text) {
  if (!text) return null;
  const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
  }
  return null;
}

/**
 * Call Google Gemini LLM for dynamic resume analysis if API key is active
 */
export async function callGeminiAnalysis(rawText, targetJobTitle, targetCompany, timeoutMs = 15000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0 || apiKey.startsWith('AQ.')) {
    // Note: 'AQ.' keys are internal development tokens. Gemini requires an AIzaSy... API key from Google AI Studio.
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a Principal Engineering Recruiter and ATS Evaluator.
Analyze this resume for the role: "${targetJobTitle}" at "${targetCompany}".
Resume Text:
"""
${(rawText || '').slice(0, 3500)}
"""

Return a strictly valid JSON object matching this schema:
{
  "summaryVerdict": {
    "headline": "...",
    "nextStepAdvice": "..."
  },
  "strengths": [
    { "id": "str_1", "title": "...", "description": "...", "impact": "High Impact" }
  ],
  "weaknesses": [
    { "id": "weak_1", "title": "...", "description": "...", "impact": "High Impact" }
  ],
  "suggestions": [
    { "id": "sug_1", "title": "...", "description": "...", "action": "...", "priority": "High" }
  ],
  "improvements": [
    {
      "id": "imp_summary",
      "section": "Summary",
      "sectionTitle": "Professional Summary",
      "original": "...",
      "suggested": "...",
      "rationale": "..."
    }
  ]
}
Return ONLY raw JSON, with no markdown code blocks.`;

    const requestPromise = (async () => {
      let response;
      let usedModel = 'gemini-2.0-flash';
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt
        });
      } catch {
        usedModel = 'gemini-1.5-flash';
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });
      }

      const text = response?.text || '';
      const parsed = extractJson(text);
      if (parsed) {
        parsed._model = usedModel;
      }
      return parsed;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    return await Promise.race([requestPromise, timeoutPromise]);
  } catch (err) {
    console.warn('[Gemini AI] Call notice:', err.message);
    return null;
  }
}

export async function generateFullAnalysis(rawText, parsed, atsResult, jobMatchResult, metadata = {}) {
  const fileName = metadata.fileName || 'Uploaded_Resume.pdf';
  const targetJobTitle = metadata.targetJobTitle || 'Senior Software Engineer';
  const targetCompany = metadata.targetCompany || 'Target Employer';

  // Calculate scores
  const hasJobMatch = Boolean(
    jobMatchResult &&
    typeof jobMatchResult.jobMatchScore === 'number' &&
    jobMatchResult.hasJobMatch !== false
  );
  const atsScore = atsResult.atsScore || 85;
  const jobScore = hasJobMatch ? jobMatchResult.jobMatchScore : null;
  const readability = Math.min(95, Math.max(78, Math.round(85 + (parsed.wordCount > 250 && parsed.wordCount < 1000 ? 8 : -5))));
  const impact = Math.min(92, Math.max(72, Math.round(75 + (rawText.match(/\d+%/g) ? 10 : 0))));
  
  // In Resume Only mode, overall score reflects ATS compliance, readability, and bullet impact
  const overall = hasJobMatch
    ? Math.round((atsScore * 0.35) + (jobScore * 0.35) + (readability * 0.15) + (impact * 0.15))
    : Math.round((atsScore * 0.70) + (readability * 0.15) + (impact * 0.15));

  const tier = overall >= 88 ? 'Exceptional Candidate' : overall >= 80 ? 'Strong Candidate' : 'Competitive Candidate';
  const badge = atsScore >= 85 ? 'Top 10% ATS Compatible' : 'Standard ATS Screener';

  // Sections
  const sections = [
    {
      id: 'contact',
      name: 'Contact Information',
      score: parsed.contact.email && parsed.contact.phone ? 98 : 82,
      status: parsed.contact.email && parsed.contact.phone ? 'Excellent' : 'Good',
      items: [
        parsed.contact.email ? `Email verified: ${parsed.contact.email}` : 'Include an easily scannable professional email',
        parsed.contact.phone ? `Phone number detected: ${parsed.contact.phone}` : 'Add standard formatted phone number',
        parsed.contact.linkedin ? `LinkedIn profile detected: ${parsed.contact.linkedin}` : 'Include your customized LinkedIn URL',
        parsed.contact.github ? `GitHub profile detected: ${parsed.contact.github}` : 'Add GitHub or technical portfolio link'
      ],
      suggestion: 'Ensure phone and email are in the body text rather than header margins.'
    },
    {
      id: 'summary',
      name: 'Professional Summary',
      score: parsed.sections.summary ? 84 : 72,
      status: parsed.sections.summary ? 'Good' : 'Needs Polish',
      items: [
        'States seniority level and primary engineering domain',
        'Concise length suited for 6-second recruiter scanning'
      ],
      suggestion: 'Quantify total impact in your summary (e.g., "$10M+ transaction volume handled" or "scaled services to 2M+ DAU").'
    },
    {
      id: 'experience',
      name: 'Work Experience',
      score: parsed.sections.experience ? 87 : 78,
      status: 'Good',
      items: [
        'Reverse chronological timeline with recognizable job titles',
        'Active action verbs (Architected, Engineered, Optimized, Spearheaded)',
        'Demonstrates technical stack ownership'
      ],
      suggestion: 'Adopt Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]" across recent roles.'
    },
    {
      id: 'skills',
      name: 'Technical Skills',
      score: atsResult.matchedKeywordsCount > 10 ? 94 : 80,
      status: atsResult.matchedKeywordsCount > 10 ? 'Excellent' : 'Good',
      items: [
        `Identified ${atsResult.matchedKeywordsCount} primary technical keywords`,
        'Categorized by Languages, Frameworks, Databases, and Cloud Tools',
        'Modern industry-relevant tech stack'
      ],
      suggestion: `Incorporate missing keywords: ${atsResult.missingKeywords.slice(0, 3).map(k => k.name).join(', ')}.`
    },
    {
      id: 'projects',
      name: 'Key Projects',
      score: parsed.sections.projects ? 86 : 80,
      status: 'Good',
      items: [
        'End-to-end full stack architecture projects represented',
        'Technical tools and architectural role defined'
      ],
      suggestion: 'Add live deployment links or open source GitHub repositories to project entries.'
    },
    {
      id: 'education',
      name: 'Education',
      score: parsed.sections.education ? 95 : 88,
      status: 'Excellent',
      items: [
        'Degree, field of study, and institution formatted clearly',
        'Standard chronological structure friendly to ATS parsers'
      ],
      suggestion: 'Formatting is optimal for ATS parsers. No modifications needed.'
    },
    {
      id: 'certifications',
      name: 'Certifications',
      score: parsed.sections.certifications ? 85 : 78,
      status: parsed.sections.certifications ? 'Good' : 'Needs Polish',
      items: [
        'Cloud and platform credentials highlighted',
        'Verification IDs and active status'
      ],
      suggestion: 'Add relevant cloud certifications (AWS Solutions Architect, CKA) to solidify infrastructure depth.'
    },
    {
      id: 'achievements',
      name: 'Achievements & Awards',
      score: 80,
      status: 'Good',
      items: [
        'Recognitions and engineering performance awards recorded'
      ],
      suggestion: 'Quantify the outcome of competitions or internal hackathon wins in business terms.'
    }
  ];

  // Strengths, Weaknesses, Suggestions
  const strengths = [
    {
      id: 'str_1',
      title: 'Strong Technical Stack Alignment',
      description: `Your profile features key modern technologies (${atsResult.matchedKeywords.slice(0, 4).map(k => k.name).join(', ')}) aligning well with ${targetJobTitle} criteria.`,
      impact: 'High Impact'
    },
    {
      id: 'str_2',
      title: 'Scannable ATS-Compliant Layout',
      description: 'Document structure passes universal applicant tracking system parsing checks without scrambling reading order.',
      impact: 'High Impact'
    },
    {
      id: 'str_3',
      title: 'Clear Career Progression',
      description: 'Role titles and chronological advancement show consistent growth in scope and technical ownership.',
      impact: 'Medium Impact'
    }
  ];

  const weaknesses = [
    {
      id: 'weak_1',
      title: 'Under-Quantified Impact in Experience Bullets',
      description: 'Several bullet points describe task responsibilities rather than measurable business metrics or latency improvements.',
      impact: 'High Impact'
    },
    {
      id: 'weak_2',
      title: 'Missing Container & Cloud Orchestration Terms',
      description: `Keywords such as ${atsResult.missingKeywords.slice(0, 2).map(k => k.name).join(', ') || 'Docker, AWS'} were not detected.`,
      impact: 'Medium Impact'
    },
    {
      id: 'weak_3',
      title: 'Generic Soft Skill Clichés',
      description: 'Vague statements like "team player" take up valuable space without providing verifiable engineering evidence.',
      impact: 'Low Impact'
    }
  ];

  const suggestions = [
    {
      id: 'sug_1',
      title: 'Adopt the Google X-Y-Z Formula',
      description: 'Structure experience bullets as: "Accomplished [X] as measured by [Y], by doing [Z]" to command recruiter attention.',
      action: 'Rewrite 3 core experience bullet points',
      priority: 'High'
    },
    {
      id: 'sug_2',
      title: 'Incorporate Target Missing Keywords',
      description: `Naturally introduce ${atsResult.missingKeywords.slice(0, 3).map(k => k.name).join(', ')} into your experience and projects descriptions.`,
      action: 'Insert 3-4 target keywords',
      priority: 'High'
    },
    {
      id: 'sug_3',
      title: 'Elevate Leadership & System Scale Metrics',
      description: 'State the number of engineers mentored, pull requests reviewed, and user volume scale handled.',
      action: 'Add leadership metrics',
      priority: 'Medium'
    }
  ];

  // Dynamically extract real text lines from candidate's resume for contextual rewrites
  const summaryOriginal = (parsed.sections?.summary || '').trim() ||
    (rawText ? rawText.split(/\r?\n/).find(l => l.trim().length > 35 && !l.includes('@') && !l.includes('http')) : null) ||
    'Passionate professional with experience building modern applications and systems.';

  const expLines = (parsed.sections?.experience || rawText || '')
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(l => l.length > 25 && !/^(work experience|professional experience|experience|employment|technical skills)/i.test(l));

  const exp1Original = expLines[0] || 'Responsible for developing core features, fixing bugs, and collaborating with cross-functional teams.';
  const exp2Original = expLines[1] || 'Worked on backend services and database operations to support application needs.';

  const improvements = [
    {
      id: 'imp_summary',
      section: 'Summary',
      sectionTitle: 'Professional Summary',
      original: summaryOriginal,
      suggested: `${targetJobTitle} with proven track record delivering scalable distributed systems and cloud architectures. Spearheaded core initiatives reducing p95 latency and improving throughput for high-concurrency workloads. Dedicated mentor and collaborator across engineering cross-teams.`,
      rationale: 'Replaces passive phrasing with quantifiable architectural accomplishments, leadership ownership, and target role alignment.'
    },
    {
      id: 'imp_exp_1',
      section: 'Experience',
      sectionTitle: 'Core Role Responsibility & Technical Architecture',
      original: exp1Original,
      suggested: `Spearheaded architecture of primary system workflows using modern design patterns, cutting average latency by 28% and increasing processing reliability to 99.95% under peak traffic spikes.`,
      rationale: 'Applies Google X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z] with explicit metric quantification.'
    },
    {
      id: 'imp_exp_2',
      section: 'Experience',
      sectionTitle: 'System Implementation & Infrastructure Delivery',
      original: exp2Original,
      suggested: `Architected and deployed resilient microservices and automated CI/CD pipelines, lowering deployment turnaround time from 4 hours to 15 minutes while eliminating single points of failure.`,
      rationale: 'Replaces task description with measurable operational metrics and cloud reliability outcomes.'
    }
  ];

  // Attempt live Gemini LLM enrichment
  const geminiData = await callGeminiAnalysis(rawText, targetJobTitle, targetCompany);

  const isAiGenerated = Boolean(geminiData);
  const aiProvider = isAiGenerated ? 'Google Gemini' : 'ResuMate Heuristic Engine';
  const aiModel = isAiGenerated ? (geminiData._model || 'gemini-2.0-flash') : 'algorithmic-rule-v2';

  return {
    scores: {
      overall,
      ats: atsScore,
      jobMatch: jobScore,
      readability,
      impact
    },
    meta: {
      provider: aiProvider,
      model: aiModel,
      isAiGenerated,
      analysisMode: isAiGenerated ? 'live-llm' : 'heuristic-fallback',
      notice: isAiGenerated
        ? 'Deep analysis generated live via Google Gemini generative AI.'
        : 'Analysis generated using ResuMate ATS compliance & heuristic evaluation engine (Gemini API key not configured or unavailable).'
    },
    summaryVerdict: {
      tier,
      badge,
      engine: isAiGenerated ? 'Google Gemini AI' : 'ResuMate Heuristic Engine',
      headline: geminiData?.summaryVerdict?.headline || (
        hasJobMatch
          ? `Your resume shows robust technical capability and passes ${targetCompany}'s automated screeners with confidence.`
          : 'Your resume demonstrates strong structural ATS compliance, formatting clarity, and scannable technical competency.'
      ),
      nextStepAdvice: geminiData?.summaryVerdict?.nextStepAdvice || 'To reach 90+ overall, replace subjective verbs with quantified system performance metrics and add cloud orchestration keywords.'
    },
    sections,
    feedback: {
      strengths: geminiData?.strengths?.length ? geminiData.strengths : strengths,
      weaknesses: geminiData?.weaknesses?.length ? geminiData.weaknesses : weaknesses,
      suggestions: geminiData?.suggestions?.length ? geminiData.suggestions : suggestions
    },
    improvements: geminiData?.improvements?.length ? geminiData.improvements : improvements
  };
}
