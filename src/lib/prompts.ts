export const PROMPTS = {
  extractProfile: (resumeText: string) => `
You are helping extract structured information from a resume. Given the resume text below, extract the following information.

Resume:
---
${resumeText}
---

Extract and return as JSON:
{
  "name": "Full name of the person",
  "currentTitle": "Current or most recent job title",
  "yearsExperience": 0,
  "skills": ["skill1", "skill2", "...up to 10 key skills"],
  "education": "Highest degree and school",
  "workHistory": "2-3 sentence summary of career progression"
}

Be accurate. If something is unclear, make your best inference. Return ONLY the JSON, no other text.
`,

  analyzeJob: (
    profile: {
      currentTitle: string;
      yearsExperience: number;
      skills: string[];
      workHistory: string;
    },
    jobDescription: string
  ) => `
You are a career coach helping a job seeker understand how well they match a job posting.

CANDIDATE PROFILE:
- Current Role: ${profile.currentTitle}
- Years of Experience: ${profile.yearsExperience}
- Skills: ${profile.skills.join(', ')}
- Background: ${profile.workHistory}

JOB POSTING:
---
${jobDescription}
---

Analyze the match between this candidate and job. Return as JSON:
{
  "title": "Extracted job title",
  "company": "Extracted company name",
  "matchScore": 75,
  "strengths": [
    "Specific strength that matches a job requirement",
    "Another strength",
    "Up to 5 strengths"
  ],
  "gaps": [
    "Something the job wants that isn't evident in their profile",
    "Another gap",
    "Up to 4 gaps"
  ],
  "requirements": [
    "Key requirement from job posting",
    "Another requirement",
    "Up to 6 key requirements"
  ],
  "keywords": [
    "keyword to incorporate",
    "another keyword",
    "Up to 8 keywords they should use"
  ]
}

Be realistic with the match score - don't inflate it. Consider years of experience, specific skills mentioned, and overall fit. Return ONLY the JSON.
`,

  tailorResume: (
    rawResume: string,
    jobDescription: string,
    keywords: string[]
  ) => `
You are an expert resume writer. Tailor this resume for the specific job posting.

ORIGINAL RESUME:
---
${rawResume}
---

TARGET JOB:
---
${jobDescription}
---

KEYWORDS TO INCORPORATE NATURALLY: ${keywords.join(', ')}

Create a tailored version that:
1. Emphasizes experience most relevant to THIS specific job
2. Incorporates keywords ONLY where they genuinely apply to actual experience
3. Reorders bullet points to highlight relevant achievements first
4. Adjusts the summary/objective for this role
5. Maintains a clean, professional format

CRITICAL - DO NOT:
- Invent, fabricate, or embellish job responsibilities that weren't in the original resume
- Transform non-technical roles into technical roles (e.g., don't add software development duties to a claims analyst position)
- Add technical keywords to jobs that weren't technical in nature
- Assume skills were used at a job just because the candidate has them

If a keyword doesn't genuinely fit the candidate's actual experience, LEAVE IT OUT. Accuracy is more important than keyword coverage. Only highlight what the candidate actually did.

OUTPUT FORMAT - Use Markdown:
- # for the candidate's name
- Contact info on one line with | separators (email | phone | location)
- ## for section headers (PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS)
- **Bold** for job titles and company names
- Use bullet points (-) for achievements and responsibilities
- Use *italic* for dates

Example structure:
# John Smith
john@email.com | 555-123-4567 | City, State

## PROFESSIONAL SUMMARY
Brief summary paragraph...

## EXPERIENCE
**Job Title** - *Jan 2020 - Present*
**Company Name**
- Achievement with metrics
- Another achievement

## EDUCATION
**Degree** - *Year*
School Name

## SKILLS
Skill 1, Skill 2, Skill 3

Output ONLY the markdown resume. No commentary or explanations.
`,

  tailorResumeWithOptimization: (
    rawResume: string,
    jobDescription: string,
    optimization: {
      missingKeywords: string[];
      keywordComparison: Array<{
        keyword: string;
        inJob: number;
        inResume: number;
        priority: string;
      }>;
      placementSuggestions: Array<{
        keyword: string;
        section: string;
        suggestion: string;
      }>;
    }
  ) => `
You are an expert resume writer. Tailor this resume using detailed optimization analysis.

ORIGINAL RESUME:
---
${rawResume}
---

TARGET JOB:
---
${jobDescription}
---

OPTIMIZATION ANALYSIS:

Missing Keywords (MUST incorporate these naturally):
${optimization.missingKeywords.join(', ')}

High-Priority Keywords to emphasize:
${optimization.keywordComparison
  .filter((k) => k.priority === 'high')
  .map((k) => `- ${k.keyword} (appears ${k.inJob}x in job, ${k.inResume}x in resume)`)
  .join('\n')}

Specific Placement Suggestions:
${optimization.placementSuggestions
  .map((s) => `- ${s.section}: Add "${s.keyword}" - ${s.suggestion}`)
  .join('\n')}

Create a tailored resume that:
1. Incorporates missing keywords ONLY where they genuinely fit actual experience
2. Emphasizes high-priority keywords where the candidate has real experience
3. Follows placement suggestions only if they match real experience
4. Uses a clean, ATS-friendly format with standard section headers
5. Prioritizes relevant experience and achievements

CRITICAL - DO NOT:
- Invent, fabricate, or embellish job responsibilities that weren't in the original resume
- Transform non-technical roles into technical roles (e.g., don't add software development duties to a claims analyst position)
- Add keywords to jobs where they don't genuinely apply
- Force keywords into the resume if the candidate doesn't have that experience

Accuracy is more important than incorporating all keywords. If a keyword doesn't fit the candidate's real experience, leave it out. Only describe what the candidate actually did.

OUTPUT FORMAT - Use Markdown:
- # for the candidate's name
- Contact info on one line with | separators (email | phone | location)
- ## for section headers (PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS)
- **Bold** for job titles and company names
- Use bullet points (-) for achievements and responsibilities
- Use *italic* for dates

Example structure:
# John Smith
john@email.com | 555-123-4567 | City, State

## PROFESSIONAL SUMMARY
Brief summary paragraph...

## EXPERIENCE
**Job Title** - *Jan 2020 - Present*
**Company Name**
- Achievement with metrics
- Another achievement

## EDUCATION
**Degree** - *Year*
School Name

## SKILLS
Skill 1, Skill 2, Skill 3

Output ONLY the markdown resume. No commentary or explanations.
`,

  generateCoverLetter: (
    profile: {
      name: string;
      currentTitle: string;
      skills: string[];
      workHistory: string;
    },
    job: { title: string; company: string; description: string },
    strengths: string[]
  ) => `
You are an expert cover letter writer. Write a compelling cover letter for this application.

CANDIDATE:
- Name: ${profile.name}
- Current Role: ${profile.currentTitle}
- Key Skills: ${profile.skills.join(', ')}
- Background: ${profile.workHistory}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}

THEIR KEY STRENGTHS FOR THIS ROLE:
${strengths.map((s) => `- ${s}`).join('\n')}

Write a cover letter that:
1. Opens with genuine enthusiasm for this specific role and company (not generic)
2. Connects their experience directly to 2-3 key job requirements with specific examples
3. Highlights relevant achievements that demonstrate impact
4. Shows personality while remaining professional
5. Is 250-400 words (concise but substantive)
6. Closes with confidence and a clear call to action

AVOID:
- Cliches like "I am writing to express my interest" or "I believe I would be a great fit"
- Generic statements that could apply to any job
- Simply repeating the resume
- Being overly formal or stiff

OUTPUT FORMAT - Use Markdown:
- Start with the date on its own line
- Add a blank line, then the greeting (Dear Hiring Manager,)
- Use paragraphs separated by blank lines
- Use **bold** for key emphasis points (company name, specific achievements)
- End with closing (Sincerely,) and signature name

Example structure:
January 8, 2026

Dear Hiring Manager,

Opening paragraph with enthusiasm for **Company Name** and the specific role...

Middle paragraph connecting experience to requirements. Highlight **specific achievement** with metrics...

Closing paragraph with call to action...

Sincerely,
John Smith

Output ONLY the markdown cover letter. No commentary or explanations.
`,

  generateInterviewQuestions: (
    profile: {
      currentTitle: string;
      yearsExperience: number;
      skills: string[];
    },
    job: { title: string; company: string; description: string }
  ) => `
You are an interview coach preparing a candidate for a job interview.

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}

CANDIDATE:
- Current Role: ${profile.currentTitle}
- Experience: ${profile.yearsExperience} years
- Skills: ${profile.skills.join(', ')}

Generate 10 likely interview questions for this specific role. Include a mix of:
- 3 technical or skill-based questions relevant to the role
- 3 behavioral questions (where STAR format would help)
- 2 questions about their specific background/experience
- 2 questions about the role, company, or career goals

Return as JSON array:
[
  {
    "question": "The interview question",
    "whyAsked": "Why the interviewer would ask this (1 sentence)",
    "guidance": "How to approach answering this well (2-3 sentences)"
  }
]

Make questions specific to this role and company, not generic. Return ONLY the JSON array.
`,

  generateFollowUpEmail: (
    type: 'thank-you' | 'follow-up' | 'check-in',
    profile: {
      name: string;
      currentTitle: string;
    },
    job: { title: string; company: string },
    context?: string
  ) => {
    const templates = {
      'thank-you': `
You are an expert at professional communication. Write a thank-you email to send after a job interview.

CANDIDATE:
- Name: ${profile.name}
- Current Role: ${profile.currentTitle}

JOB:
- Title: ${job.title}
- Company: ${job.company}

${context ? `INTERVIEW CONTEXT/NOTES:\n${context}\n` : ''}

Write a thank-you email that:
1. Thanks the interviewer(s) sincerely
2. References something specific from the conversation (if context provided, otherwise keep it general but warm)
3. Reiterates interest in the role and company
4. Briefly reinforces one key strength or value you'd bring
5. Is warm and professional, not stiff or generic
6. Is 150-250 words

Start with "Subject: " line, then the email body starting with the greeting.
`,
      'follow-up': `
You are an expert at professional communication. Write a follow-up email to send 1-2 weeks after applying when you haven't heard back.

CANDIDATE:
- Name: ${profile.name}
- Current Role: ${profile.currentTitle}

JOB:
- Title: ${job.title}
- Company: ${job.company}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

Write a follow-up email that:
1. Is polite and professional, not pushy
2. References the original application briefly
3. Reiterates genuine interest in the role
4. Offers to provide any additional information
5. Is concise - 100-150 words
6. Doesn't sound desperate or demanding

Start with "Subject: " line, then the email body starting with the greeting.
`,
      'check-in': `
You are an expert at professional communication. Write a check-in email for someone who interviewed but is waiting for a decision.

CANDIDATE:
- Name: ${profile.name}
- Current Role: ${profile.currentTitle}

JOB:
- Title: ${job.title}
- Company: ${job.company}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

Write a check-in email that:
1. Is respectful of their time and process
2. Politely inquires about the timeline
3. Reaffirms interest without being needy
4. Offers flexibility if they need more time
5. Is brief - 100-150 words
6. Maintains professionalism while being personable

Start with "Subject: " line, then the email body starting with the greeting.
`
    };
    return templates[type];
  },

  analyzeResumeOptimization: (resume: string, jobDescription: string) => `
You are an ATS optimization expert. Analyze this resume against the job description to identify keyword gaps and optimization opportunities.

RESUME:
---
${resume}
---

JOB DESCRIPTION:
---
${jobDescription}
---

Analyze and return as JSON:
{
  "missingKeywords": ["keyword1", "keyword2", "...up to 10 important missing keywords"],
  "keywordComparison": [
    { "keyword": "Python", "inJob": 3, "inResume": 1, "priority": "high" },
    { "keyword": "AWS", "inJob": 2, "inResume": 0, "priority": "high" },
    "...up to 12 key terms"
  ],
  "placementSuggestions": [
    { "keyword": "Docker", "section": "Skills", "suggestion": "Add to technical skills list" },
    { "keyword": "led team", "section": "Experience", "suggestion": "Add metrics like 'Led team of X engineers'" },
    "...up to 6 specific suggestions"
  ],
  "formattingTips": [
    "Specific tip based on the resume analysis",
    "Another actionable tip",
    "...3-5 tips total"
  ],
  "overallScore": 72,
  "summary": "2-3 sentence summary of resume-job fit and top priorities"
}

Guidelines:
- Priority should be "high" for core job requirements, "medium" for preferred qualifications, "low" for nice-to-haves
- Score 0-100 based on keyword coverage and relevance (be realistic, not inflated)
- Focus on hard skills, technologies, certifications, and industry terminology
- Formatting tips should address ATS compatibility issues you notice

CRITICAL for Placement Suggestions:
- Only suggest adding keywords where they can AUTHENTICALLY fit the candidate's real experience
- Do NOT suggest adding technical keywords to non-technical job roles (e.g., don't suggest adding "Python" to a claims analyst position)
- Consider the nature of each job when making suggestions - a keyword can only go in a section where it genuinely applies
- If a keyword cannot be authentically added anywhere, do NOT include it in placement suggestions
- Skills section is appropriate for listing technologies the candidate actually knows
- Experience section suggestions should only reference jobs where that skill was actually used or is relevant

Return ONLY the JSON, no other text.
`
};
