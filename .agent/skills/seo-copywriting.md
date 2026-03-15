---
description: SEO Copywriting - optimize landing pages, meta content, and ad copy for search engines and conversions
---

# SKILL: SEO Copywriting

**Trigger:** When @ba or @pm needs to create or optimize user-facing copy for search visibility and conversion. Used within the `content-marketing` pipeline or standalone for landing page optimization.

---

## When to Use
- Writing landing page copy for a new feature or product.
- Optimizing existing pages for higher search rankings.
- Creating ad headlines and descriptions (Google Ads, social ads).
- Writing meta tags (title, description) for all pages.
- Crafting CTA buttons and microcopy for conversion rate optimization (CRO).

---

## SEO Copy Framework: AIDA + Keywords

### Step 1: Keyword Research
Before writing any copy:
1. **Primary keyword:** The main search term (e.g., "Vietnamese lunar calendar app")
2. **Secondary keywords:** 3-5 related terms (e.g., "lịch vạn niên online", "tử vi trọn đời")
3. **Long-tail keywords:** Question-based queries (e.g., "cách xem ngày tốt xấu")
4. **Source keywords from:** Web search suggestions, competitor title tags, domain expertise

### Step 2: Title & Meta Optimization

| Element | Requirements | Example |
|---|---|---|
| **Title tag** | ≤60 chars, primary keyword first, brand last | "Lịch Vạn Niên - Xem Ngày Tốt Xấu \| Lịch Việt" |
| **Meta description** | ≤155 chars, include CTA, primary + 1 secondary keyword | "Tra cứu lịch âm dương, xem ngày tốt xấu, tử vi trọn đời. Miễn phí, chính xác theo trường phái Tam Hợp. Thử ngay →" |
| **H1** | 1 per page, primary keyword, ≤70 chars | "Lịch Vạn Niên — Tra Cứu Lịch Âm Dương Chính Xác" |
| **URL slug** | Lowercase, hyphenated, ≤5 words | `/lich-van-nien` |

### Step 3: AIDA Landing Page Structure

```markdown
# [H1 — Attention: Bold claim with primary keyword]

## [H2 — Interest: Expand on the problem the user has]
[2-3 sentences: relatable pain point, emotional hook]

## [H2 — Desire: Show the solution]
[Features with benefits, not just feature list]
[Include: screenshots, social proof, comparison tables]

### [H3 — Feature blocks]
[Feature name] — [User benefit in one sentence]
[Screenshot or demo]

## [H2 — Action: CTA]
[Strong verb + benefit: "Xem Lá Số Tử Vi Miễn Phí →"]
[Secondary CTA: "Tìm Hiểu Thêm"]
```

### Step 4: CRO Microcopy Rules

| Element | Pattern | Anti-pattern |
|---|---|---|
| **CTA button** | Action verb + benefit: "Xem Lá Số Ngay" | Vague: "Submit", "Click Here" |
| **Form labels** | Clear, specific: "Ngày sinh (dương lịch)" | Ambiguous: "Date" |
| **Error messages** | Helpful: "Vui lòng chọn năm sinh" | Generic: "Invalid input" |
| **Empty states** | Encouraging: "Chưa có dữ liệu — hãy thêm ngày sinh" | Blank or "No data" |
| **Loading states** | Informative: "Đang tính toán lá số..." | Spinner only |

### Step 5: Readability Checks
- **Sentence length:** ≤20 words average.
- **Paragraph length:** ≤4 sentences.
- **Active voice:** ≥80% of sentences.
- **Jargon:** Use domain terms (tử vi, phong thủy) but explain them for new users.
- **Bilingual awareness:** Vietnamese UI, but consider English meta tags for international search visibility where appropriate.

---

## Ad Copy Templates

### Google Search Ad
```
Headline 1 (30 chars): [Primary keyword + hook]
Headline 2 (30 chars): [Benefit or differentiator]
Headline 3 (30 chars): [CTA]
Description (90 chars): [Problem → Solution → CTA]
```

### Social Ad
```
Hook (1 line): [Question or bold claim]
Body (2-3 lines): [Problem → How product solves it]
CTA: [Action + benefit]
Visual: [Describe the image/video needed]
```

---

## Rules
- **Primary keyword in first 100 words** of any page.
- **No keyword stuffing.** Natural language always wins.
- **Every page has unique title/meta.** No duplicates.
- **CTA above the fold.** Users should see the action without scrolling.
- **Mobile-first copy.** Write for small screens, test line breaks.

## File Management
- Landing page copy → `.hc/content/landing/`
- Ad copy → `.hc/content/ads/`
- Meta content audit → `.hc/content/seo-audit.md`
