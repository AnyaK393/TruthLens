# TruthLens

> **Pause before you share.** A media-literacy companion that helps young people evaluate viral claims, understand online manipulation, and find credible evidence.

TruthLens is being built for the **UNESCO Youth Hackathon 2026** and supports UNESCO's Media and Information Literacy (MIL) mission. Rather than giving users a black-box “true/false” answer, it explains *why* a claim may need more scrutiny and teaches verification skills users can reuse.

## The problem

Viral posts can use urgency, fear, sensational language, and missing context to make people share misinformation. Young people need quick, clear, and accessible ways to pause, evaluate content, and seek original sources.

## What TruthLens does

1. A user pastes a claim, headline, social-media post, or link.
2. TruthLens identifies the factual claim and potential red flags.
3. It checks evidence against an approved set of credible, primary sources.
4. It presents a transparent assessment, source trail, and practical “before you share” checklist.

## Current prototype

- Claim input with character count
- Clear, non-binary assessment and confidence indicator
- Red-flag explanation: absolute language, missing source/date, and missing context
- Visual evidence-trail concept
- Responsive mobile-friendly interface

The current version uses sample results for demonstration. It does **not** yet make live fact-checking decisions.

## Proposed technology

| Layer | Technology |
| --- | --- |
| User interface | React / Next.js, TypeScript, Tailwind CSS |
| API | Python FastAPI or Node.js |
| Claim extraction and explanation | OpenAI API |
| Evidence retrieval | RAG with an approved source list and pgvector / Supabase |
| Screenshots | OCR plus a vision model |
| Authentication and data | Supabase |
| Hosting | Vercel + Railway / Render |

## Responsible AI

TruthLens is an educational tool, not a final arbiter of truth. It will show uncertainty, cite original sources, distinguish evidence from inference, and encourage users to consult credible primary sources.

## Run the prototype

No installation is required. Open `index.html` in a browser.

## Team

Add team members, roles, and contact information here before submitting.
