# Web Admin for Bachata Updates

This directory contains the source code for the browser-based admin interface to view, edit, and manage JSON files (such as updates.json, upcoming.json, status.json) for the "What's New" page of the Bachata Connection Explorer.

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
