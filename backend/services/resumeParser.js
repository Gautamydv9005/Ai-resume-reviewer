/**
 * Structural Resume Parser
 * Parses extracted resume text into logical sections and metadata
 */

export function parseResumeSections(rawText) {
  const text = rawText || '';
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Email extraction
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  // Phone extraction
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // LinkedIn extraction
  const linkedInMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  const linkedin = linkedInMatch ? `https://${linkedInMatch[1]}` : '';

  // GitHub extraction
  const gitHubMatch = text.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
  const github = gitHubMatch ? `https://${gitHubMatch[1]}` : '';

  // Section heading detectors
  const sectionHeaders = {
    summary: /^(professional summary|summary|executive summary|profile|about me|objective)$/i,
    experience: /^(work experience|professional experience|experience|employment history|work history)$/i,
    education: /^(education|academic background|academics)$/i,
    skills: /^(skills|technical skills|technologies|core competencies|areas of expertise)$/i,
    projects: /^(projects|key projects|personal projects|technical projects)$/i,
    certifications: /^(certifications|licenses|certificates)$/i,
    achievements: /^(achievements|honors|awards|accomplishments)$/i
  };

  const sections = {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
    achievements: ''
  };

  let currentSection = null;

  for (const line of lines) {
    let matchedHeader = null;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        matchedHeader = key;
        break;
      }
    }

    if (matchedHeader) {
      currentSection = matchedHeader;
    } else if (currentSection) {
      sections[currentSection] += (sections[currentSection] ? '\n' : '') + line;
    }
  }

  // If experience is empty but text has common companies or dates, take heuristic slices
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  return {
    contact: {
      email,
      phone,
      linkedin,
      github
    },
    sections,
    wordCount,
    estimatedPages,
    rawText: text
  };
}
