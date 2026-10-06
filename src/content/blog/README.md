# Blog posts

One folder per post; the folder name is the URL slug (`/ar/blog/<slug>`).
Inside, `ar.md` and/or `en.md` — a language without a file simply doesn't list the post.

```md
---
title: Post title
description: One or two sentences — shown on cards and in Google results.
date: 2026-10-06
tags: first tag, second tag
colors: #00d4f5, #3f4cf5
---

Markdown body. Use `##` for section headings (the page already has the `#` title).
Link to projects with /ar/projects/<slug> or /en/projects/<slug>.
```

Posts are sorted by `date`, newest first; the latest three appear on the home page.
New posts are picked up automatically by the blog pages and the sitemap.
