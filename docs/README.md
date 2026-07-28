# Published site

This directory is the complete GitHub Pages source for Helix Hub Directory. It intentionally has no build-time or runtime package dependencies.

Edit `portals.json` to add or change a destination, then run the root checks:

```bash
npm run check
```

Lifecycle values are deliberately narrow:

- `included`: the file is bundled in this directory and validated during the build;
- `external`: the HTTPS destination is controlled outside this site;
- `archive`: the bundled page is retained for historical context, not presented as a maintained service.

Do not add a `live`, `healthy`, or production claim without a documented, bounded verification process. The release workflow publishes the generated root `dist/` directory, not the entire repository.
