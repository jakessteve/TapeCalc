---
description: Content Marketing - generate product-driven content from feature PRDs, release notes, and product data
---

# SKILL: Content Marketing

**Trigger:** When a feature is shipped, a release is made, or @pm requests marketing content for distribution.

---

## When to Use
- After a feature ships — generate blog post draft from the PRD and implementation notes.
- Before a launch — create teaser content, product announcements, social media threads.
- For SEO — generate keyword-targeted articles that demonstrate product expertise.
- For documentation — produce user-facing guides from technical docs.

---

## The 5-Step Content Pipeline

### Step 1: Feature-to-Content Extraction
Read the source material and extract marketing-ready content:

| Source | What to Extract |
|---|---|
| `docs/biz/PRD.md` | User personas, problem statement, value proposition |
| Release notes (`.hc/releases/`) | Features shipped, improvements, fixes |
| `docs/tech/ARCHITECTURE.md` | Technical depth for developer-focused content |
| Implementation reviews (`.hc/reviews/`) | Unique approach angles, "how we built it" stories |
| Battle test reports | Edge cases handled, quality signals |

### Step 2: Content Type Selection

| Content Type | Length | Purpose | Distribution |
|---|---|---|---|
| **Release announcement** | 300-500 words | Inform existing users | Email, in-app, blog |
| **Feature deep-dive** | 800-1500 words | SEO + lead generation | Blog, Product Hunt |
| **Technical tutorial** | 1000-2000 words | Developer community + SEO | Blog, Dev.to, Medium |
| **Social thread** | 5-10 posts | Awareness + virality | X/Twitter, LinkedIn |
| **Changelog entry** | 50-100 words | Release tracking | CHANGELOG.md, blog |

### Step 3: Draft Content
Write the content following these principles:
1. **Lead with the user problem**, not the feature. "Tired of X?" not "We added Y."
2. **Show, don't tell.** Include screenshots, code snippets, or before/after comparisons.
3. **Use the user's language.** Reference Vietnamese terms naturally for the target audience.
4. **Include a clear CTA.** Every piece of content should drive an action (try it, sign up, share).
5. **SEO structure:** H1 → H2s → H3s. Front-load keywords. Use schema markup references.

### Step 4: SEO Optimization
Apply the `seo-copywriting` skill to optimize:
- Title tag (60 chars max)
- Meta description (155 chars max)
- Keyword density (primary in H1, H2s, first paragraph)
- Internal linking strategy
- Image alt text

### Step 5: Distribution Checklist
```markdown
## Content Distribution Checklist
- [ ] Blog post published
- [ ] Social media thread scheduled (X, LinkedIn)
- [ ] Email to existing users (if applicable)
- [ ] Product Hunt update (if major feature)
- [ ] Developer community post (Dev.to, Reddit)
- [ ] CHANGELOG.md updated
- [ ] Internal SOT docs updated
```

---

## Content Templates

### Release Announcement Template
```markdown
# [Product Name] [Version] — [Catchy Headline]

## What's New
[2-3 sentences on the biggest change — user-problem-first framing]

### [Feature 1 Name]
[Description + screenshot/GIF]

### [Feature 2 Name]
[Description + screenshot/GIF]

## Getting Started
[How to access/upgrade/try the new features]

## What's Next
[Brief roadmap tease]
```

### Social Thread Template
```markdown
 Thread: [Topic — hook with a question or bold statement]

1/ [Problem statement — relatable pain point]
2/ [How we solved it — brief technical angle]
3/ [Visual proof — screenshot or demo GIF]
4/ [User benefit — "This means you can now..."]
5/ [CTA — "Try it: [link]" or "What would you build with this?"]
```

---

## Rules
- **Never publish without @pm review.** All externally-facing content requires approval.
- **Source every claim.** If you say "2x faster," show the benchmark.
- **Match brand voice.** Refer to the project's tone guidelines ([professional, developer-friendly, Vietnamese-first]).
- **No AI-generic content.** Every paragraph must reference specific product features, not generic industry thoughts.

## File Management
- Blog drafts → `.hc/content/blog/`
- Social drafts → `.hc/content/social/`
- Email drafts → `.hc/content/email/`
- Published content log → `.hc/content/published.md`
