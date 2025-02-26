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
├── translations/            # For independent translator contributions
│   ├── es/                  # Spanish language directory
│   │   ├── updates/         # Translated updates
│   │   └── progress.json    # Translation progress tracking
│   ├── fr/                  # French language directory
│   └── ...                  # Other languages
└── README.md                # This file
```

## Purpose

This repository separates content from code to enable:

1. **Easy Content Updates**: Update the "What's New" page without code deployments
2. **Translator Collaboration**: Provide a structured way for independent translators to contribute
3. **Version History**: Track changes to content over time using Git
4. **Content Review**: Use GitHub's pull request system for content review

## For Contributors

If you want to contribute to this repository, please see `templates/contributor-guide.md` for detailed instructions.

## How It Works

The Bachata Connection Explorer application fetches these JSON files directly from GitHub's raw content service. When the files are updated here, the changes will automatically appear on the website after the cache expires (typically within an hour).

## License

Copyright © 2025 Markku Suominen. All rights reserved.
