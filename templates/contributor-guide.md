# Contributor Guide for Bachata Updates

This guide explains how to contribute content to the Bachata Connection Explorer "What's New" page.

## Getting Started

1. **Fork this repository** if you don't have direct write access
2. **Clone your fork** to your local machine
3. **Create a new branch** for your updates

## Adding Content

### Adding a New Update

1. Open the file at `whats-new/updates.json`
2. Add a new entry to the beginning of the `items` array
3. Follow the structure in `templates/update-template.json`
4. Ensure each update has a unique `id`

Example:
```json
{
  "id": "spanish-translation-update",
  "title": "Spanish Translation Update",
  "content": "Spanish translation has been updated with improved terminology consistency across all sections.",
  "date": "2025-01-20",
  "badge": null
}
```

### Updating Translation Status

1. Open the file at `whats-new/status.json`
2. Find the language entry you want to update
3. Update the `progress` percentage (0-100)
4. Update the `status` to one of: "complete", "in-review", "in-progress", "machine-translation"

## For Translators

If you're working on translations:

1. Create or update files in the `translations/<language-code>/` directory
2. Follow the existing structure for your language
3. Update your language's progress in `whats-new/status.json`

## Submitting Changes

1. Commit your changes with a clear message
2. Push your branch to GitHub
3. Create a Pull Request with a detailed description of your changes
4. Wait for review and approval

## JSON Validation

Before submitting, make sure your JSON is valid:
- No trailing commas
- Proper use of quotation marks
- Correct structure following templates

## Need Help?

Open an issue if you need assistance or have questions about the contribution process.
