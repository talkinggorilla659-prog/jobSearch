# JobHunt

A privacy-first, AI-powered job search assistant that helps you track applications, tailor resumes, generate cover letters, and prepare for interviews.

## Features

### Job Tracking & Analytics
- **Kanban Board** - Visual drag-and-drop tracker with 5 status columns (Saved, Applied, Interview, Offer, Rejected)
- **Dashboard Statistics** - Track total jobs, applications, interviews, response rates, and more
- **Status History** - Full timeline of each application's journey

### AI-Powered Job Analysis
- **Match Scoring** - Get a 0-100% match score comparing your profile to job requirements
- **Strengths & Gaps** - Understand what makes you a good fit and where you might need to upskill
- **Keyword Extraction** - Identify important terms to incorporate in your materials

### Resume Tools
- **Tailored Resume Generation** - AI creates job-specific resumes using your profile and the job description
- **Resume Optimization** - ATS-focused analysis with keyword comparison, missing keywords, and placement suggestions
- **Multiple Export Formats** - Download as DOCX or PDF with Modern, Classic, or Minimalist templates

### Cover Letter Generation
- **Personalized Letters** - AI generates 250-400 word cover letters tailored to each role
- **Achievement-Focused** - Highlights relevant experience with specific examples
- **Export Options** - Copy to clipboard or download as DOCX

### Interview Preparation
- **10 Role-Specific Questions** - Technical, behavioral, and background questions
- **Answer Guidance** - Each question includes why it's asked and how to approach it
- **STAR Method Tips** - Structured guidance for behavioral questions

### Email Templates
- **Thank You Emails** - Post-interview follow-ups
- **Follow-Up Emails** - Check on application status
- **Check-In Emails** - Politely inquire about decisions

### Privacy-First Design
- **100% Local Storage** - All data stored in your browser's IndexedDB
- **No Cloud Sync** - Your job search data never leaves your device
- **API Keys Stay Local** - Your AI provider keys are stored only on your machine

### Data Management

> ⚠️ **Important**: Your data is stored locally in your browser. There are no user accounts or cloud sync.

- **Per-Device Storage** - Each browser/device has its own separate data
- **Browser Data = Your Data** - If you clear your browser data, cookies, or site data, your job search information will be deleted
- **Import/Export** - Use the Import/Export feature in Settings to backup your data or transfer it between devices
- **Before Clearing Browser Data** - Always export your data first if you want to keep it

**Recommended**: Periodically export your data as a backup.

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Build Tool**: Vite
- **Database**: Dexie.js (IndexedDB wrapper)
- **AI Providers**: Anthropic Claude & OpenAI GPT-4 (bring your own API key)
- **Document Generation**: docx, @react-pdf/renderer

## Getting Started

### Prerequisites
- Node.js 18+
- An API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jobhunt.git
cd jobhunt

# Install dependencies
npm install

# Start development server
npm run dev
```

### API Keys

API keys are configured directly in the app during onboarding or via the Settings page. You'll need an API key from either:
- [Anthropic](https://console.anthropic.com/) for Claude
- [OpenAI](https://platform.openai.com/) for GPT-4

Your API keys are stored locally in your browser and never sent to any server except the AI provider.

## Usage

1. **Onboarding** - Paste your resume to extract your profile information
2. **Add Jobs** - Paste job descriptions to get AI-powered analysis and match scores
3. **Generate Materials** - Create tailored resumes, cover letters, and interview prep
4. **Track Progress** - Use the Kanban board to manage your application pipeline
5. **Export** - Download your tailored documents in DOCX or PDF format

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

The app is configured for Vercel deployment with Edge Functions for API proxying.

```bash
# Deploy to Vercel
vercel
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

Built to help job seekers during tough times.
