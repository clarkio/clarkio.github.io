---
title: 'Upgrading to Astro 6'
publishDate: May 16, 2026
author: 'Brian Clark'
description: 'What changed and what I had to fix when upgrading this site from Astro 4 to Astro 6.'
keywords: 'Astro, Astro 6, upgrade, migration, web development, static site'
layout: '../../layouts/BaseLayout.astro'
---

# Upgrading to Astro 6

I recently upgraded this site from Astro 4 to Astro 6 - two major versions in one go. Here's what actually broke and how I fixed it.

## What Changed

Astro 6 dropped support for several things that were deprecated in Astro 5:

- **`Astro.glob()`** - removed entirely. The replacement is Vite's `import.meta.glob()` with `{ eager: true }`.
- **`<ViewTransitions />`** - renamed to `<ClientRouter />` in Astro 5 and removed in Astro 6.
- **Lowercase API route handlers** - `export const get` must now be `export const GET`.
- **Node.js 18/20** - Astro 6 requires Node 22 or higher.

## The Migration

### Replacing `Astro.glob()`

Before:

```js
const allPosts = await Astro.glob('./**/*.md')
```

After:

```js
const allPosts = Object.values(import.meta.glob('./**/*.md', { eager: true }))
```

The `{ eager: true }` option makes the import synchronous, so the function no longer needs to be `async`. The returned module objects have the same `frontmatter`, `url`, and `rawContent()` shape as before.

### Replacing `<ViewTransitions />`

Before:

```astro
import { ViewTransitions } from 'astro:transitions'
...
<ViewTransitions />
```

After:

```astro
import { ClientRouter } from 'astro:transitions'
...
<ClientRouter />
```

### Fixing the RSS route

Astro 6 requires uppercase HTTP method names for API routes:

```js
// Before
export const get = () => rss({ ... })

// After
export const GET = () => rss({ ... })
```

## Was It Worth It?

Yes. The build is noticeably faster and the new defaults are sensible. The migration itself took less than an hour since the codebase was already avoiding most deprecated patterns.
