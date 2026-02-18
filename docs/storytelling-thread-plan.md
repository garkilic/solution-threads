# Plan: Storytelling Thread (Children's Book Genealogy Workflow)

## Context

Nathan Getty needs a repeatable, human-in-the-loop system to produce a children's genealogy book. The book emphasizes oral history over raw family tree data and uses a waterfall process: data in → generate one chapter + illustration → Nathan reviews → approve or revise → repeat until book is complete.

This plan adds a second thread ("Storytelling") to the existing Solution Threads app alongside the current "Client Meeting Prep" thread.

---

## New DB Tables (Supabase — run manually via SQL editor)

```sql
CREATE TABLE book_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  art_style TEXT NOT NULL,
  target_age TEXT NOT NULL,
  ancestry_data TEXT,
  oral_history TEXT,
  chapter_outline JSONB,       -- full outline generated at project creation
  character_guide TEXT,        -- living character sheet maintained across chapters
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE book_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES book_projects(id),
  chapter_number INTEGER NOT NULL,
  title TEXT,
  narrative TEXT,
  illustration_prompt TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft',   -- draft | approved | revision_requested
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);
```

Also create a Supabase Storage bucket named `book-images` (public read).

---

## New Dependencies

```bash
npm install replicate openai
```

Add to `.env.local` and Vercel:
- `REPLICATE_API_TOKEN` — from replicate.com
- (No OpenAI key needed — image generation is via Replicate/Flux)

---

## Multi-Agent Pipeline Architecture

Each chapter generation runs **5 specialized Claude agents in sequence**. This is the key design decision — each agent has a narrow, expert focus to maximize output quality.

```
Agent 1: Story Architect     (runs ONCE at project creation)
         → Plans full book outline (chapter titles + themes for all chapters)
         → Stored in book_projects.chapter_outline

Agent 2: Character Keeper    (runs each chapter)
         → Reads existing character_guide + new chapter events
         → Updates the character guide (names, ages, relationships, personality traits)
         → Stored back in book_projects.character_guide

Agent 3: Oral History Weaver (runs each chapter)
         → Given: current chapter's theme + oral history input
         → Selects and shapes the best oral history moments for this chapter
         → Outputs: curated story beats to give to the Narrative Writer

Agent 4: Narrative Writer    (runs each chapter)
         → Given: chapter theme, story beats, character guide, previous chapters summary
         → Writes the full chapter narrative (~350 words, age-appropriate)
         → If feedback present from previous attempt: applies revision notes explicitly

Agent 5: Art Director        (runs each chapter)
         → Given: chapter narrative + art style + character guide
         → First selects the single most emotionally resonant and visually compelling moment
           from the chapter (not just any scene — the one that best captures the heart of
           the chapter and will move a child reader)
         → Then produces a Flux-optimized illustration prompt for that specific moment
         → Format: "children's book illustration, [art_style], [scene description], [character details], soft lighting, high detail"
         → Also returns a brief "Scene Rationale" (1 sentence) explaining why this moment was chosen
```

All 5 agents use `claude-sonnet-4-6` (latest model). Agents 2–5 run per chapter. Agent 1 runs once at setup.

---

## New API Routes

### `POST /api/run-chapter`

Runs agents 2–5 in sequence for a given chapter. Also calls Replicate/Flux for the image.

Request:
```json
{
  "projectId": "uuid",
  "chapterNumber": 1,
  "regenerate": false,
  "feedback": "Make the grandmother's voice warmer and add more detail about the kitchen"
}
```

Pipeline:
1. Load `book_projects` record (outline, character guide, art style, etc.)
2. Load all approved chapters (for continuity context)
3. Agent 2 (Character Keeper): update character guide → save to DB
4. Agent 3 (Oral History Weaver): extract best story beats for this chapter
5. Agent 4 (Narrative Writer): write chapter narrative (includes feedback if present)
6. Agent 5 (Art Director): generate Flux illustration prompt
7. Call Replicate Flux model with prompt → get image URL
8. Download image → upload to Supabase Storage → store permanent URL
9. Save chapter to `book_chapters` table

Returns: `{ id, title, narrative, illustrationPrompt, imageUrl }`

### `POST /api/run-story-architect`

Runs only Agent 1. Called once when the project is created.

Request: full project data (title, subject, ancestry data, oral history, target age)

Returns: `{ chapterOutline: [{ number, title, theme, keyCharacters }] }`

---

## New Types — `lib/types.ts` (additions)

```typescript
export interface BookProject {
  id: string;
  title: string;
  subjectName: string;
  artStyle: string;
  targetAge: string;
  ancestryData?: string;
  oralHistory?: string;
  chapterOutline?: ChapterOutlineItem[];
  createdAt: string;
}

export interface ChapterOutlineItem {
  number: number;
  title: string;
  theme: string;
  keyCharacters: string[];
}

export interface BookChapter {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  illustrationPrompt: string;
  imageUrl: string;
  status: 'draft' | 'approved' | 'revision_requested';
  feedback?: string;
  createdAt: string;
  approvedAt?: string;
}
```

---

## New Storage Functions — `lib/storage.ts` (additions)

- `createBookProject(clientId, projectData) → Promise<string>` — returns project ID
- `updateBookProjectOutline(projectId, outline, characterGuide) → Promise<void>`
- `getBookProject(projectId) → Promise<BookProject | null>`
- `getBookProjects(clientId) → Promise<BookProject[]>`
- `getBookChapters(projectId) → Promise<BookChapter[]>`
- `saveBookChapter(projectId, chapterNumber, chapterData) → Promise<string>` — returns chapter ID
- `updateChapterStatus(chapterId, status, feedback?) → Promise<void>`

---

## New Pages

### 1. Setup Page — `app/workflows/[slug]/run/storytelling/page.tsx`

Sequential intake form:
- Book title
- Family subject name (e.g. "The Getty Family")
- Target age range (select: 3–5 / 5–8 / 8–12)
- Art style (text input, e.g. "watercolor, soft pastels, storybook illustration")
- Ancestry data: file upload (CSV/GEDCOM) **or** text paste (toggle between modes)
- Oral history notes: textarea
- "Generate Book Outline" button

On submit:
1. Create `book_projects` record
2. Call `POST /api/run-story-architect` → show animated "Planning your book..." state
3. Display the generated chapter outline for Nathan to review
4. "Begin Writing Chapter 1" button → call `POST /api/run-chapter` → redirect to workspace

### 2. Chapter Workspace — `app/workflows/[slug]/storytelling/[projectId]/page.tsx`

**Two-column layout (50/50 split):**

```
┌─────────────────────────────────────────────────┐
│ Chapter 3: The Letters from Ireland             │
├──────────────────────────┬──────────────────────┤
│  NARRATIVE (left col)    │  ILLUSTRATION        │
│                          │  (right col)         │
│  Full chapter text,      │  Generated Flux      │
│  scrollable, serif       │  image, full-width   │
│  typeface for readability│                      │
│                          │  ▼ Illustration      │
│                          │  Prompt (collapsed)  │
├──────────────────────────┴──────────────────────┤
│ LEFT SIDEBAR: Chapter list with status chips    │
│  Ch.1 ✓ Approved  Ch.2 ✓ Approved  Ch.3 Draft  │
├─────────────────────────────────────────────────┤
│ ACTION BAR                                      │
│  [Approve & Generate Ch.4]  [Request Revisions] │
└─────────────────────────────────────────────────┘
```

- "Approve" → marks chapter approved, calls `POST /api/run-chapter` for next chapter number
- "Request Revisions" → opens feedback textarea inline, "Regenerate" button → re-calls `/api/run-chapter` with `{ regenerate: true, feedback: "..." }` → overwrites chapter
- While generating: full-screen overlay "Agents are writing Chapter N..." with animated step indicator showing which agent is active

---

## Dashboard Update — `app/workflows/[slug]/page.tsx`

Add second thread card below "Client Meeting Prep":
- Title: "Children's Book Storytelling"
- Description: "Transforms family genealogy and oral history into a chapter-by-chapter illustrated children's book."
- Link: `/workflows/${slug}/run/storytelling`
- Data source chips: Ancestry (amber/upload), Oral History (amber/upload)

---

## Files to Create / Modify

| Action | File |
|---|---|
| Modify | `lib/types.ts` — add `BookProject`, `ChapterOutlineItem`, `BookChapter` |
| Modify | `lib/storage.ts` — add 7 book storage functions |
| Modify | `app/workflows/[slug]/page.tsx` — add storytelling thread card |
| Create | `app/workflows/[slug]/run/storytelling/page.tsx` — setup + outline review |
| Create | `app/workflows/[slug]/storytelling/[projectId]/page.tsx` — two-col chapter workspace |
| Create | `app/api/run-story-architect/route.ts` — Agent 1 (book outline) |
| Create | `app/api/run-chapter/route.ts` — Agents 2–5 + Flux image generation |

---

## Verification

1. `npm run dev`, go to `/workflows/demo`
2. See second thread card "Children's Book Storytelling"
3. Click → setup page, fill fields, paste sample ancestry + oral history text
4. "Generate Book Outline" → animated state → chapter outline appears
5. "Begin Writing Chapter 1" → 5-agent pipeline runs → chapter workspace loads
6. Two-column layout shows: narrative left, generated illustration right
7. Click "Request Revisions", type feedback → chapter regenerates with changes
8. Click "Approve & Generate Chapter 2" → Chapter 2 appears with narrative continuity
9. Sidebar shows Ch.1 (Approved), Ch.2 (Draft)
