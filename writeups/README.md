# Write-ups

Markdown-driven write-up section. No build step - the pages fetch and render the Markdown in the browser.

```
writeups.html                     # listing page (tag filter, cards)
writeups/
  index.json                      # the manifest - this is the source of truth for metadata
  article.html                    # renderer: /writeups/article.html?p=<slug>
  <slug>/
    index.md                      # the article body (no front matter, no H1)
    assets/                       # images referenced as assets/foo.png
```

## Adding a new write-up

1. Create the folder `writeups/<slug>/` and drop `index.md` inside it. Put images in
   `writeups/<slug>/assets/` and reference them with relative paths: `![Alt text](assets/01-thing.png)`.
   The alt text is rendered as the figure caption, so make it descriptive.

2. Add an entry to the **top** of `writeups/index.json`:

   ```json
   {
     "slug": "my-new-writeup",
     "title": "Title shown on the card and the article header",
     "description": "One or two sentences shown on the card and as the meta description.",
     "date": "2026-09-01",
     "category": "Malware Analysis",
     "tags": ["ida", "windows"],
     "readingTime": "8 min",
     "draft": false
   }
   ```

   `slug` must match the folder name. `date` is `YYYY-MM-DD`; the list sorts newest first.
   Set `"draft": true` to keep an entry out of the listing.

3. Commit and push. That's it.

## Notes

- **Metadata lives in `index.json`, not in the Markdown.** Don't add YAML front matter - if you
  leave some in, the renderer strips it, but it won't be displayed. Don't start `index.md` with an
  H1 either; the page renders the title from the manifest.
- Start headings at `##`. A table of contents is generated automatically from `##`/`###` once there
  are three or more of them.
- Supported Markdown is GitHub-flavoured: tables, fenced code with language hints, blockquotes,
  task-free lists, inline code. Code blocks get syntax highlighting and a copy button.
- `article.html` only fetches slugs that exist in `index.json`, so a hand-crafted `?p=` value can't
  point the renderer at an arbitrary path.
- Rendered Markdown is sanitised with DOMPurify before it hits the DOM.

## Previewing locally

The pages use `fetch()`, which browsers block on `file://`. Serve the site root over HTTP:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/writeups.html>.
