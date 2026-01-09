import { ResumeData, ContactInfo, ExperienceEntry, EducationEntry } from './types';

// Section header patterns
const SECTION_PATTERNS = {
  summary: /^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|ABOUT|OBJECTIVE|CAREER SUMMARY)/i,
  experience: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY)/i,
  education: /^(EDUCATION|ACADEMIC|ACADEMICS|EDUCATIONAL BACKGROUND)/i,
  skills: /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|KEY SKILLS|COMPETENCIES)/i,
  certifications: /^(CERTIFICATIONS|CERTIFICATES|LICENSES|CREDENTIALS)/i,
};

// Contact info patterns
const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
const LINKEDIN_PATTERN = /linkedin\.com\/in\/[\w-]+/i;

// Date patterns for experience parsing
const DATE_PATTERN = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}\s*[-–—to]+\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s*\d{4}|Present|Current)/i;
const YEAR_RANGE_PATTERN = /\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current)/i;

function isHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Check if it matches a known section pattern
  for (const pattern of Object.values(SECTION_PATTERNS)) {
    if (pattern.test(trimmed)) return true;
  }

  // Check if ALL CAPS and short (likely a section header)
  if (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && /^[A-Z\s&]+$/.test(trimmed)) {
    return true;
  }

  return false;
}

function extractContact(lines: string[]): { contact: ContactInfo; headerEndIndex: number } {
  const contact: ContactInfo = {};
  let headerEndIndex = 0;

  // Look through first 10 lines for contact info
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];

    // Stop if we hit a section header
    if (isHeader(line) && i > 0) {
      headerEndIndex = i;
      break;
    }

    // Extract email
    const emailMatch = line.match(EMAIL_PATTERN);
    if (emailMatch && !contact.email) {
      contact.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = line.match(PHONE_PATTERN);
    if (phoneMatch && !contact.phone) {
      contact.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = line.match(LINKEDIN_PATTERN);
    if (linkedinMatch && !contact.linkedin) {
      contact.linkedin = linkedinMatch[0];
    }

    // Extract location (city, state pattern) - allow mixed case for names like McAllen
    const locationMatch = line.match(/[A-Z][a-zA-Z'.-]+(?:\s[A-Z][a-zA-Z'.-]+)*,\s*[A-Z]{2}/);
    if (locationMatch && !contact.location) {
      contact.location = locationMatch[0];
    }

    headerEndIndex = i + 1;
  }

  return { contact, headerEndIndex };
}

function extractName(lines: string[]): string {
  // Name is typically the first non-empty line
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed && !EMAIL_PATTERN.test(trimmed) && !PHONE_PATTERN.test(trimmed)) {
      // Check if it looks like a name (not all caps header, not too long)
      if (trimmed.length < 50 && !/^[A-Z\s]+$/.test(trimmed)) {
        return trimmed;
      }
      // Could be name in title case
      if (/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/.test(trimmed)) {
        return trimmed;
      }
      // Accept even ALL CAPS if it's the first substantial line
      if (trimmed.length < 40) {
        return trimmed;
      }
    }
  }
  return 'Resume';
}

function findSections(lines: string[]): Map<string, { start: number; end: number }> {
  const sections = new Map<string, { start: number; end: number }>();
  let currentSection: string | null = null;
  let currentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        // Close previous section
        if (currentSection) {
          sections.set(currentSection, { start: currentStart, end: i });
        }
        currentSection = name;
        currentStart = i + 1;
        break;
      }
    }
  }

  // Close last section
  if (currentSection) {
    sections.set(currentSection, { start: currentStart, end: lines.length });
  }

  return sections;
}

function parseSummary(lines: string[], section: { start: number; end: number }): string {
  const summaryLines: string[] = [];

  for (let i = section.start; i < section.end; i++) {
    const line = lines[i].trim();
    if (line && !isHeader(line)) {
      summaryLines.push(line);
    }
  }

  return summaryLines.join(' ');
}

function parseExperience(lines: string[], section: { start: number; end: number }): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let currentEntry: Partial<ExperienceEntry> | null = null;
  let currentBullets: string[] = [];

  for (let i = section.start; i < section.end; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this is a bullet point
    if (/^[•\-*]/.test(line)) {
      currentBullets.push(line.replace(/^[•\-*]\s*/, ''));
      continue;
    }

    // Check if this line contains a date (might be a new job entry)
    const hasDate = DATE_PATTERN.test(line) || YEAR_RANGE_PATTERN.test(line);

    if (hasDate || (currentEntry && !currentEntry.dates && line.includes(' | '))) {
      // Save previous entry
      if (currentEntry && currentEntry.title) {
        entries.push({
          title: currentEntry.title || '',
          company: currentEntry.company || '',
          dates: currentEntry.dates || '',
          bullets: currentBullets,
        });
        currentBullets = [];
      }

      // Parse new entry
      // Common formats: "Title | Company | Dates" or "Title at Company" or separate lines
      const dateMatch = line.match(DATE_PATTERN) || line.match(YEAR_RANGE_PATTERN);
      const dates = dateMatch ? dateMatch[0] : '';

      // Remove dates from line to parse title/company
      let titleCompany = line.replace(DATE_PATTERN, '').replace(YEAR_RANGE_PATTERN, '').trim();
      titleCompany = titleCompany.replace(/[|,]\s*$/, '').trim();

      // Try to split title and company
      let title = titleCompany;
      let company = '';

      if (titleCompany.includes(' | ')) {
        const parts = titleCompany.split(' | ').map(p => p.trim());
        title = parts[0];
        company = parts[1] || '';
      } else if (titleCompany.includes(' at ')) {
        const parts = titleCompany.split(' at ').map(p => p.trim());
        title = parts[0];
        company = parts[1] || '';
      } else if (titleCompany.includes(', ')) {
        const parts = titleCompany.split(', ').map(p => p.trim());
        title = parts[0];
        company = parts[1] || '';
      }

      currentEntry = { title, company, dates };
    } else if (currentEntry && !currentEntry.company && line) {
      // This might be the company name on a separate line
      currentEntry.company = line;
    } else if (!currentEntry) {
      // First line might be title
      currentEntry = { title: line, company: '', dates: '' };
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.title) {
    entries.push({
      title: currentEntry.title || '',
      company: currentEntry.company || '',
      dates: currentEntry.dates || '',
      bullets: currentBullets,
    });
  }

  return entries;
}

function parseEducation(lines: string[], section: { start: number; end: number }): EducationEntry[] {
  const entries: EducationEntry[] = [];
  let currentEntry: Partial<EducationEntry> | null = null;

  for (let i = section.start; i < section.end; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);

    if (yearMatch || line.includes(' | ') || /degree|bachelor|master|phd|associate|diploma/i.test(line)) {
      // Save previous entry
      if (currentEntry && (currentEntry.degree || currentEntry.school)) {
        entries.push({
          degree: currentEntry.degree || '',
          school: currentEntry.school || '',
          year: currentEntry.year || '',
          details: currentEntry.details,
        });
      }

      const year = yearMatch ? yearMatch[0] : '';
      let degree = '';
      let school = '';

      // Try to parse degree and school
      if (line.includes(' | ')) {
        const parts = line.split(' | ').map(p => p.trim());
        degree = parts[0].replace(/\b(19|20)\d{2}\b/, '').trim();
        school = parts[1]?.replace(/\b(19|20)\d{2}\b/, '').trim() || '';
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ').map(p => p.trim());
        degree = parts[0].replace(/\b(19|20)\d{2}\b/, '').trim();
        school = parts[1]?.replace(/\b(19|20)\d{2}\b/, '').trim() || '';
      } else {
        degree = line.replace(/\b(19|20)\d{2}\b/, '').trim();
      }

      currentEntry = { degree, school, year };
    } else if (currentEntry && !currentEntry.school) {
      currentEntry.school = line;
    } else if (currentEntry) {
      currentEntry.details = (currentEntry.details || '') + ' ' + line;
    }
  }

  // Save last entry
  if (currentEntry && (currentEntry.degree || currentEntry.school)) {
    entries.push({
      degree: currentEntry.degree || '',
      school: currentEntry.school || '',
      year: currentEntry.year || '',
      details: currentEntry.details?.trim(),
    });
  }

  return entries;
}

function parseSkills(lines: string[], section: { start: number; end: number }): string[] {
  const skills: string[] = [];

  for (let i = section.start; i < section.end; i++) {
    const line = lines[i].trim();
    if (!line || isHeader(line)) continue;

    // Skills are often comma-separated or bullet-pointed
    const cleanLine = line.replace(/^[•\-*]\s*/, '');

    // Split by common delimiters
    const parts = cleanLine.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);

    if (parts.length > 1) {
      skills.push(...parts);
    } else if (cleanLine) {
      skills.push(cleanLine);
    }
  }

  return skills;
}

function parseCertifications(lines: string[], section: { start: number; end: number }): string[] {
  const certs: string[] = [];

  for (let i = section.start; i < section.end; i++) {
    const line = lines[i].trim();
    if (!line || isHeader(line)) continue;

    const cleanLine = line.replace(/^[•\-*]\s*/, '');
    if (cleanLine) {
      certs.push(cleanLine);
    }
  }

  return certs;
}

export function parseResume(text: string): ResumeData {
  const lines = text.split('\n');

  // Extract name from header
  const name = extractName(lines);

  // Extract contact info
  const { contact, headerEndIndex } = extractContact(lines);

  // Find sections
  const sections = findSections(lines);

  // Parse each section
  const summary = sections.has('summary')
    ? parseSummary(lines, sections.get('summary')!)
    : '';

  const experience = sections.has('experience')
    ? parseExperience(lines, sections.get('experience')!)
    : [];

  const education = sections.has('education')
    ? parseEducation(lines, sections.get('education')!)
    : [];

  const skills = sections.has('skills')
    ? parseSkills(lines, sections.get('skills')!)
    : [];

  const certifications = sections.has('certifications')
    ? parseCertifications(lines, sections.get('certifications')!)
    : undefined;

  // Try to extract title from first experience entry or header area
  let title = '';
  // Skip titles that look like "Company | Location" patterns
  if (experience.length > 0 && !experience[0].title.includes(' | ')) {
    title = experience[0].title;
  }

  // If no valid title from experience, look in header area
  if (!title) {
    for (let i = 1; i < headerEndIndex && i < 5; i++) {
      const line = lines[i].trim();
      if (line &&
          !EMAIL_PATTERN.test(line) &&
          !PHONE_PATTERN.test(line) &&
          !line.includes(' | ') &&  // Skip "Company | Location" patterns
          line !== name) {
        title = line;
        break;
      }
    }
  }

  return {
    name,
    title,
    contact,
    summary,
    experience,
    education,
    skills,
    certifications,
  };
}
