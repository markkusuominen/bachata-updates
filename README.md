# Bachata Updates Repository

This repository contains content for the "What's New" page of the Bachata Connection Explorer project. The content is stored in JSON files that are dynamically loaded into the application.

## Repository Structure

```
bachata-updates/
├── whats-new/
│   ├── updates.json         # Latest updates and announcements
│   ├── upcoming.json        # Upcoming features information
│   └── status.json          # Language translation status
├── templates/               # Template files for contributors
│   ├── update-template.json # Template for creating new updates
│   └── contributor-guide.md # Guidelines for contributors
└── README.md                # This file
```

## Purpose

This repository powers the "What's New" page of the Bachata Connection Explorer app. It is designed to make publishing updates, announcements, and status information easy for non-technical contributors and project maintainers. All update content is managed via simple JSON files, allowing changes to be made without touching application code or requiring redeployment.

Key benefits:

1. **Easy Content Updates**: Update the "What's New" page and related content with simple edits to JSON files—no coding required.
2. **Version History**: Track every change to updates and announcements using Git version control.
3. **Simplified Management**: Keep update content separate from app code for safer, more flexible collaboration.
4. **Web Admin Integration**: Use the browser-based admin interface (see web-admin/) for authenticated, user-friendly editing and publishing of updates.

## For Contributors

If you want to contribute to this repository, please see `templates/contributor-guide.md` for detailed instructions.

## How It Works

The Bachata Connection Explorer application fetches these JSON files directly from GitHub's raw content service. When the files are updated here, the changes will automatically appear on the website after the cache expires (typically within an hour).

## License

Copyright 2025 Markku Suominen. All rights reserved.
