import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { extractTextFromFile } from '../services/textExtractor.js';
import { parseResumeSections } from '../services/resumeParser.js';
import { analyzeAtsCompliance } from '../services/atsEngine.js';
import { analyzeJobMatch } from '../services/jobMatchEngine.js';
import { generateFullAnalysis } from '../services/aiAnalysisEngine.js';
import { dataStore } from '../utils/dataStore.js';

export const uploadResume = async (req, res) => {
  let guestToken = null;
  let isGuest = false;

  try {
    const file = req.file;

    // Check if the actor is an authenticated user or a guest
    if (!req.user) {
      isGuest = true;
      guestToken = req.cookies?.resumate_guest_session ||
        req.headers['x-guest-token'] ||
        req.body?.guestToken;

      if (!guestToken) {
        guestToken = 'gst_' + crypto.randomBytes(24).toString('hex');
        await dataStore.guestSessions.create({
          guestToken,
          ip: req.ip || '',
          userAgent: req.headers['user-agent'] || ''
        });
        res.cookie('resumate_guest_session', guestToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      }

      // Atomically check allowance and acquire concurrency lock
      const guestCheck = await dataStore.guestSessions.atomicStartReview(guestToken);
      if (!guestCheck.allowed) {
        if (guestCheck.limitReached) {
          return res.status(403).json({
            success: false,
            limitReached: true,
            message: 'Your free resume review is complete! Create an account or log in to analyze another resume.',
            completedResumeId: guestCheck.completedResumeId || null
          });
        }
        if (guestCheck.inProgress) {
          return res.status(429).json({
            success: false,
            inProgress: true,
            message: 'A resume review is currently in progress for this guest session. Please wait for it to complete.'
          });
        }

        // Token was invalid / not found in store: create fresh session
        const freshToken = 'gst_' + crypto.randomBytes(24).toString('hex');
        await dataStore.guestSessions.create({
          guestToken: freshToken,
          ip: req.ip || '',
          userAgent: req.headers['user-agent'] || ''
        });
        guestToken = freshToken;
        res.cookie('resumate_guest_session', freshToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        await dataStore.guestSessions.atomicStartReview(freshToken);
      }
    }

    let jobDescription = null;
    let hasJobDescription = false;
    if (req.body.jobDescription) {
      try {
        jobDescription = typeof req.body.jobDescription === 'string'
          ? JSON.parse(req.body.jobDescription)
          : req.body.jobDescription;
        if (jobDescription && typeof jobDescription === 'object') {
          hasJobDescription = true;
        }
      } catch {
        jobDescription = null;
      }
    }

    // In Resume + Job Description mode, validate required manual inputs on backend
    if (hasJobDescription) {
      const rawTitle = typeof jobDescription.title === 'string' ? jobDescription.title.trim() : '';
      const rawLevel = typeof jobDescription.experienceLevel === 'string' ? jobDescription.experienceLevel.trim() : '';
      const rawText = typeof jobDescription.text === 'string' ? jobDescription.text.trim() : '';
      const rawCompany = typeof jobDescription.company === 'string' ? jobDescription.company.trim() : '';

      const validExperienceLevels = ['Internship', 'Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];
      const matchedLevel = validExperienceLevels.find(l => l.toLowerCase() === rawLevel.toLowerCase());

      if (!rawTitle) {
        if (isGuest && guestToken) {
          await dataStore.guestSessions.releaseReviewLock(guestToken);
        }
        return res.status(400).json({
          success: false,
          message: 'Target Job Title is required when analyzing in Resume + Job Description mode.'
        });
      }

      if (!matchedLevel) {
        if (isGuest && guestToken) {
          await dataStore.guestSessions.releaseReviewLock(guestToken);
        }
        return res.status(400).json({
          success: false,
          message: 'Valid Experience Level is required (options: Internship, Entry Level, Junior, Mid-Level, Senior, Lead).'
        });
      }

      if (!rawText) {
        if (isGuest && guestToken) {
          await dataStore.guestSessions.releaseReviewLock(guestToken);
        }
        return res.status(400).json({
          success: false,
          message: 'Job Description text is required when analyzing in Resume + Job Description mode.'
        });
      }

      // Sanitize jobDescription
      jobDescription = {
        title: rawTitle,
        company: rawCompany || 'Target Employer',
        experienceLevel: matchedLevel,
        text: rawText,
        requiredSkills: Array.isArray(jobDescription.requiredSkills)
          ? jobDescription.requiredSkills.map(s => String(s).trim()).filter(Boolean)
          : []
      };
    }

    const originalName = file ? file.originalname : 'Uploaded_Resume.pdf';
    const isSample = req.body?.isSample === 'true' || req.body?.isSample === true ||
      originalName === 'Alex_Morgan_Senior_Engineer_2026.pdf';

    // Validate that a file or sample request was provided
    if (!file && !isSample) {
      if (isGuest && guestToken) {
        await dataStore.guestSessions.releaseReviewLock(guestToken);
      }
      return res.status(400).json({
        success: false,
        message: 'No resume file provided. Please upload a valid PDF or DOCX document.'
      });
    }

    const fileSizeFormatted = file ? `${(file.size / 1024).toFixed(1)} KB` : '420.0 KB';
    const fileType = file ? file.mimetype : 'application/pdf';

    // Extract text from uploaded document
    let extractedText = '';
    if (file && file.path) {
      extractedText = await extractTextFromFile(file.path, originalName);
    }

    // If this is the quick demo sample resume, use realistic benchmark text
    if (isSample && (!extractedText || extractedText.trim().length < 40)) {
      extractedText = `Alex Morgan\nSenior Full Stack Engineer\nEmail: alex.morgan@techcareer.io | Phone: (415) 890-1234\nLinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan\n\nPROFESSIONAL SUMMARY\nSenior Full Stack Engineer with 6+ years of expertise designing and delivering high-concurrency distributed systems using React, TypeScript, Node.js, and PostgreSQL. Experienced in AWS microservices, payment gateways, and mentoring engineering teams.\n\nTECHNICAL SKILLS\nLanguages: JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3\nFrontend: React 19, Next.js, Redux Toolkit, Tailwind CSS\nBackend: Node.js, Express, REST APIs, Microservices, GraphQL\nDatabases: PostgreSQL, MongoDB, Redis\nDevOps: Docker, Git, CI/CD Pipelines, AWS Lambda, Linux\n\nWORK EXPERIENCE\nSenior Software Engineer — TechCorp (2023 - Present)\n- Architected high-throughput payment checkout services serving 2M+ monthly transactions.\n- Optimized database indexing in PostgreSQL, lowering p95 query latency by 35%.\n- Led migration of monolith frontend to React 19 and modular design system.\n\nSoftware Engineer — Global Apps (2020 - 2023)\n- Engineered RESTful microservices in Node.js and MongoDB.\n- Implemented automated CI/CD pipeline using GitHub Actions and Docker.\n\nEDUCATION\nB.S. in Computer Science — University of California (2016 - 2020)\n\nCERTIFICATIONS\nAWS Certified Solutions Architect – Associate`;
    } else if (!extractedText || extractedText.trim().length < 25) {
      // Clean up unreadable / empty file
      if (file && file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      if (isGuest && guestToken) {
        await dataStore.guestSessions.releaseReviewLock(guestToken);
      }
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from the uploaded document. Please ensure your PDF or DOCX contains selectable text (not an image-only scan or corrupted file).'
      });
    }

    // 1. Structural Parse
    const parsed = parseResumeSections(extractedText);

    // 2. ATS Analysis
    const atsResult = analyzeAtsCompliance(extractedText, parsed, originalName);

    // 3. Job Match Analysis
    const jobMatchResult = hasJobDescription
      ? analyzeJobMatch(extractedText, jobDescription)
      : analyzeJobMatch(extractedText, null);

    // 4. Deep AI Analysis
    const targetTitle = hasJobDescription ? jobDescription.title : 'General Role (Resume Only)';
    const targetCompany = hasJobDescription ? jobDescription.company : 'General Application';
    const targetLevel = hasJobDescription ? jobDescription.experienceLevel : null;
    const fullAnalysis = await generateFullAnalysis(extractedText, parsed, atsResult, jobMatchResult, {
      fileName: originalName,
      targetJobTitle: targetTitle,
      targetCompany: targetCompany,
      experienceLevel: targetLevel
    });

    const newResumeId = 'res_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    // Formatted date string
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Build resume entity
    const resumeRecord = {
      id: newResumeId,
      userId: req.user?.id || 'usr_88291',
      fileName: originalName,
      fileSize: fileSizeFormatted,
      fileType: fileType,
      filePath: file ? file.path : '',
      extractedText,
      uploadedAt: now.toISOString(),
      date: dateFormatted,
      rawDate: now.toISOString(),
      targetJobTitle: targetTitle,
      targetCompany: targetCompany,
      experienceLevel: targetLevel,
      status: 'Completed',
      overallScore: fullAnalysis.scores.overall,
      atsScore: fullAnalysis.scores.ats,
      jobMatchScore: hasJobDescription ? fullAnalysis.scores.jobMatch : null,
      skillsScore: 90,
      experienceScore: 85,
      notes: hasJobDescription
        ? `Optimized for ${targetCompany} (${targetTitle} — ${targetLevel})`
        : 'Analyzed in Resume Only mode'
    };

    // Save all to datastore / MongoDB
    await dataStore.resumes.create(resumeRecord);

    await dataStore.analyses.save({
      id: 'anl_' + newResumeId,
      resumeId: newResumeId,
      fileName: originalName,
      analyzedAt: now.toISOString(),
      targetJobTitle: targetTitle,
      targetCompany: targetCompany,
      ...fullAnalysis
    });

    await dataStore.atsReports.save({
      resumeId: newResumeId,
      fileName: originalName,
      ...atsResult
    });

    await dataStore.jobMatches.save({
      resumeId: newResumeId,
      ...jobMatchResult
    });

    // Update user stats if registered user
    if (req.user) {
      try {
        const user = await dataStore.users.findById(req.user?.id);
        if (user) {
          await dataStore.users.update(user.id, {
            resumesAnalyzed: (user.resumesAnalyzed || 0) + 1,
            averageAtsScore: Math.round(((user.averageAtsScore || 85) + atsResult.atsScore) / 2)
          });
        }
      } catch {}
    }

    // Complete guest review allowance atomically
    if (isGuest && guestToken) {
      await dataStore.guestSessions.atomicCompleteReview(guestToken, newResumeId);
    }

    // Return the response matching frontend resumeService expectations
    res.status(201).json({
      ...resumeRecord,
      isGuest,
      reviewsUsed: isGuest ? 1 : undefined,
      limitReached: isGuest ? true : undefined
    });
  } catch (err) {
    if (isGuest && guestToken) {
      await dataStore.guestSessions.releaseReviewLock(guestToken);
    }
    console.error('[uploadResume Error]:', err);
    res.status(500).json({ success: false, message: 'Resume processing failed', error: err.message });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    if (req.user) {
      const list = await dataStore.resumes.findAll();
      return res.json(list);
    }

    const guestToken = req.cookies?.resumate_guest_session ||
      req.headers['x-guest-token'] ||
      req.query?.guestToken;

    if (guestToken) {
      const session = await dataStore.guestSessions.findByToken(guestToken);
      if (session?.completedResumeId) {
        const single = await dataStore.resumes.findById(session.completedResumeId);
        return res.json(single ? [single] : []);
      }
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve resume history', error: err.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await dataStore.resumes.findById(id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json(resume);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get resume details', error: err.message });
  }
};

export const renameResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ success: false, message: 'fileName is required' });
    }

    const updated = await dataStore.resumes.update(id, { fileName });

    // Update analysis and ATS report fileNames as well
    try {
      const analysis = await dataStore.analyses.findByResumeId(id);
      if (analysis) await dataStore.analyses.save({ ...analysis, fileName });
      const ats = await dataStore.atsReports.findByResumeId(id);
      if (ats) await dataStore.atsReports.save({ ...ats, fileName });
    } catch {}

    res.json({
      success: true,
      id,
      fileName
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to rename resume', error: err.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await dataStore.resumes.delete(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete resume', error: err.message });
  }
};
