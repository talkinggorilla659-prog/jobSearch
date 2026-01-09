# Contributing to JobHunt

Thank you for your interest in contributing to JobHunt! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jobhunt.git
   cd jobhunt
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

- Check existing issues to avoid duplicates
- Use the bug report template if available
- Include steps to reproduce, expected behavior, and actual behavior
- Include browser/OS information if relevant

### Suggesting Features

- Check existing issues and discussions first
- Clearly describe the feature and its use case
- Explain why this feature would benefit users

### Submitting Pull Requests

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting and ensure it passes:
   ```bash
   npm run lint
   ```
4. Build the project to check for errors:
   ```bash
   npm run build
   ```
5. Commit your changes with a clear message
6. Push to your fork and submit a pull request

### Code Style

- Follow the existing code style in the project
- Use TypeScript for all new code
- Use meaningful variable and function names
- Keep components small and focused
- Add comments for complex logic

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Reference issue numbers when applicable

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
├── pages/          # Page components
└── App.tsx         # Main app component
```

## Questions?

Feel free to open an issue for any questions about contributing.
