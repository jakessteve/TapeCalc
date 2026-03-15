---
description: Documentation Style Guide - unified brand voice, terminology, bilingual rules, and formatting standards for all document types
---

# SKILL: Documentation Style Guide

**Trigger:** Before writing any document — project or business-facing. This is the **foundational reference** that all other writing skills inherit from.

---

## When to Use
- Starting any new document (check this guide first).
- Reviewing a document before publishing (use as a quality lens).
- Onboarding a new agent role that writes documents.
- Resolving disputes about tone, terminology, or formatting choices.

---

## Brand Voice

### Core Principles
| Principle | Description | Example |
|---|---|---|
| **Professional but human** | Authoritative without being stiff. Avoid corporate-speak. | "This feature helps you find auspicious dates faster." "This functionality facilitates optimized date selection." |
| **Data-driven** | Every claim backed by a number or source. No vague superlatives. | "35M Vietnamese check lunar dates daily." "Millions of people use lunar calendars." |
| **Culturally respectful** | Domain terms (Tử Vi, Phong Thủy) used accurately. Never trivialize traditional knowledge. | "Based on the Tam Hợp school of interpretation." "Based on ancient superstitions." |
| **Action-oriented** | Every document ends with a clear next step or decision point. | "Next step: @dev implements the API by March 20." "Further discussion may be warranted." |

### Voice by Audience
| Audience | Tone | Jargon Level | Language |
|---|---|---|---|
| Internal agents (@dev, @ba, etc.) | Direct, technical | High — use domain terms freely | English |
| End users (app UI, help docs) | Warm, guiding | Low — explain all terms | Vietnamese primary |
| Business partners | Professional, benefit-focused | Medium — business terms OK | Match recipient |
| Investors | Concise, data-first | None — plain language | English or Vietnamese per context |

---

## Terminology Standards

### Rules
1. **Define terms on first use.** Link to `GLOSSARY.md` if project-wide.
2. **Use consistent naming.** Pick one term and stick with it throughout a document.
3. **Domain terms stay in their language.** Don't translate "Tử Vi" to "Purple Star Astrology" unless writing for a non-Vietnamese audience.

### Common Term Decisions
| Use This | Not This | Reason |
|---|---|---|
| Lịch Việt | Vietnamese Calendar App | Brand name |
| Tử Vi | Purple Star Astrology | Domain standard |
| Bát Tự | Four Pillars / BaZi | Vietnamese audience primary |
| Phong Thủy | Feng Shui | Vietnamese audience primary |
| auspicious/inauspicious | good/bad | Precision |
| lunar date | âm lịch date | English context clarity |

---

## Bilingual Writing Standards

### Language Selection
| Context | Primary Language | Secondary Language |
|---|---|---|
| Technical docs (PRDs, ADRs, architecture) | English | Vietnamese terms for domain concepts |
| User-facing UI copy | Vietnamese | English for technical labels (e.g., "Settings") |
| Help docs / guides | Vietnamese | English technical terms in parentheses |
| Business outreach (domestic) | Vietnamese | — |
| Business outreach (international) | English | — |
| Marketing content (blog, social) | Vietnamese | English keywords for SEO |
| Investor materials | English | Vietnamese market terms with translation |

### Mixed-Language Rules
1. **Technical terms in English stay in English** inside Vietnamese text: "sử dụng API endpoint `/api/lunar`" not "sử dụng điểm cuối giao diện lập trình ứng dụng."
2. **Domain terms in Vietnamese stay in Vietnamese** inside English text: "The Tử Vi engine calculates..." not "The Purple Star engine..."
3. **Parenthetical translations** for cross-audience docs: "Bát Tự (Four Pillars)" on first use, then just "Bát Tự."
4. **Never auto-translate domain terms** without human review — mistranslation damages credibility.

---

## Formatting Standards

### Universal Rules (All Doc Types)
- **Date format:** `YYYY-MM-DD` everywhere.
- **File naming:** `kebab-case-document-name.md`.
- **Status labels:** `Draft → Review → Approved → Final`.
- **Headers:** H1 for title, H2 for major sections, H3 for sub-sections. Max depth: H4.
- **Bold:** Key terms on first use, metrics, and decision points.
- **Code blocks:** Any file paths, commands, variable names, or API endpoints.
- **Tables over prose:** For comparisons, structured data, and timelines.
- **Paragraphs:** 3 sentences max. One idea per paragraph.
- **Lists:** Bullet points for 3+ unordered items. Numbered lists for sequential steps.

### Document Metadata
Every document starts with:
```markdown
# [Document Type]: [Title]
**Version:** X.Y | **Date:** YYYY-MM-DD | **Author:** @role
**Status:** Draft | Review | Approved | Final
```

---

## Cross-Skill Reference

This guide is the foundation. Specific skills add domain-specific rules:

| Skill | Adds |
|---|---|
| `technical-writing` | Project doc templates (Brief, Meeting Notes, Research, ADR, CHANGELOG, Help Article) |
| `prd-architect` | PRD structure, acceptance criteria, phase decomposition |
| `business-writing` | External communication templates, stakeholder tone |
| `investor-pitch-writer` | One-pager structure, "no jargon" rule |
| `content-marketing` | Content pipeline, distribution checklists |
| `seo-copywriting` | SEO structure, CRO microcopy, keyword integration |
| `content-strategy` | Editorial calendar, content audit methodology |
| `postmortem-writing` | Incident documentation, blameless language |
| `research-analysis` | Source citation, confidence scoring, serendipity logs |

---

## Rules
- **Check this guide first** before writing any document.
- **Voice consistency > personal preference.** Follow the brand voice table.
- **When in doubt, be specific.** Vague text wastes everyone's time.
- **Date everything.** Undated documents are unreliable.
- **Link, don't duplicate.** Reference existing docs instead of copying content.
