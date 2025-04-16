# Web Admin for Bachata Updates

This is the browser-based admin interface for managing update content on the "What's New" page of the Bachata Connection Explorer app. It enables authenticated contributors and project maintainers to easily view, edit, and publish updates, announcements, and translation statuses—all from a user-friendly web UI.

The admin app interacts directly with the GitHub repository, allowing secure, real-time editing of JSON content files without requiring direct repository access or manual Git operations. This streamlines the workflow for both technical and non-technical collaborators.

## Features
- GitHub OAuth authentication
- Multi-user collaboration
- Direct editing of JSON files in the repo via GitHub API
- Version control via commits or pull requests
- Built with React, TypeScript, and Material-UI/Chakra UI
- Hosted on Netlify with serverless functions

## Project Structure
```
web-admin/
├── public/
├── src/
│   ├── components/
│   ├── App.tsx
│   └── index.tsx
├── netlify/functions/
│   └── github.ts         # Handles GitHub API securely
├── package.json
└── README.md
```

## Setup & Development
See the main project README and PRD for setup, environment variables, and deployment instructions.
