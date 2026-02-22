// Agent prompts for the Storytelling (children's genealogy book) thread.
// Five specialised agents run per chapter; the Story Architect runs once per book.

import { BookProject, ChapterOutlineItem } from "@/lib/types";

// ── Story Architect (runs once, generates full chapter outline) ──────────────

export interface StoryArchitectInput {
  title: string;
  subjectName: string;
  targetAge: string;
  artStyle: string;
  ancestryData?: string;
  oralHistory?: string;
}

export function buildStoryArchitectPrompt({
  title,
  subjectName,
  targetAge,
  artStyle,
  ancestryData,
  oralHistory,
}: StoryArchitectInput): string {
  return `You are the Story Architect for a children's genealogy book. Your job is to plan the full chapter outline for the entire book before a single word is written. This outline will guide every chapter that follows.

Book title: "${title}"
Family subject: "${subjectName}"
Target age: ${targetAge}
Art style: ${artStyle}

Ancestry data:
${ancestryData || "Not provided — generate a compelling outline based on the subject name and context"}

Oral history notes:
${oralHistory || "Not provided — infer rich themes from the family context"}

Create an outline for 6-8 chapters. Each chapter should:
- Focus on a specific time period, place, or emotional theme in the family's story
- Build naturally from the previous chapter (beginning → middle → end arc)
- Be age-appropriate and emotionally resonant for children
- Draw on specific people, places, or events from the ancestry and oral history data
- Have 2-4 key characters who appear in that chapter

Return ONLY a valid JSON array (no markdown, no code fences):
[
  {
    "number": 1,
    "title": "Chapter title (evocative, short)",
    "theme": "One sentence describing what this chapter is about thematically and narratively",
    "keyCharacters": ["Name 1", "Name 2"]
  }
]`;
}

// ── Character Keeper (Agent 2, runs per chapter) ─────────────────────────────

export interface CharacterKeeperInput {
  project: BookProject;
  chapterInfo: ChapterOutlineItem | undefined;
  chapterNumber: number;
  existingCharacterGuide: string;
}

export function buildCharacterKeeperPrompt({
  project,
  chapterInfo,
  chapterNumber,
  existingCharacterGuide,
}: CharacterKeeperInput): string {
  return `You are the Character Keeper for a children's genealogy book. Maintain a living character guide that tracks all characters across chapters.

Current character guide:
${existingCharacterGuide || "No characters established yet."}

This chapter is about: "${chapterInfo?.theme || `Chapter ${chapterNumber}`}"
Key characters in this chapter: ${chapterInfo?.keyCharacters?.join(", ") || "to be determined"}
Family subject: "${project.subject_name}"
Ancestry data: ${project.ancestry_data || "Not provided"}

Update the character guide to include any new characters or updated details. Keep it concise and organized by character name. For each character include: full name, approximate age/generation, relationship to ${project.subject_name}, brief physical description, personality traits.

Return ONLY the updated character guide as plain text, no JSON, no markdown headers.`;
}

// ── Oral History Weaver (Agent 3, runs per chapter) ─────────────────────────

export interface OralHistoryWeaverInput {
  project: BookProject;
  chapterInfo: ChapterOutlineItem | undefined;
  chapterNumber: number;
}

export function buildOralHistoryWeaverPrompt({
  project,
  chapterInfo,
  chapterNumber,
}: OralHistoryWeaverInput): string {
  return `You are the Oral History Weaver for a children's genealogy book. Select and shape the most powerful oral history moments for this chapter.

Chapter ${chapterNumber}: "${chapterInfo?.title || `Chapter ${chapterNumber}`}"
Theme: "${chapterInfo?.theme || "family history"}"
Key characters: ${chapterInfo?.keyCharacters?.join(", ") || "family members"}
Family subject: "${project.subject_name}"

Full oral history notes:
${project.oral_history || "No oral history provided — create plausible, warm family memories based on the theme"}

Ancestry data:
${project.ancestry_data || "Not provided"}

Select 2-4 specific moments, memories, or stories that best illuminate this chapter's theme. Shape each into a vivid story beat that a child could understand and feel emotionally.

Return ONLY numbered story beats as plain text (1-2 sentences each). No JSON, no headers.`;
}

// ── Narrative Writer (Agent 4, runs per chapter) ─────────────────────────────

export interface NarrativeWriterInput {
  project: BookProject;
  chapterInfo: ChapterOutlineItem | undefined;
  chapterNumber: number;
  updatedCharacterGuide: string;
  storyBeats: string;
  approvedSummary: string;
  feedback?: string;
}

export function buildNarrativeWriterPrompt({
  project,
  chapterInfo,
  chapterNumber,
  updatedCharacterGuide,
  storyBeats,
  approvedSummary,
  feedback,
}: NarrativeWriterInput): string {
  return `You are the Narrative Writer for a children's genealogy book. Write a warm, age-appropriate chapter narrative.

Book title: "${project.title}"
Family subject: "${project.subject_name}"
Target age: ${project.target_age}
Chapter ${chapterNumber}: "${chapterInfo?.title || `Chapter ${chapterNumber}`}"
Theme: "${chapterInfo?.theme || "family history"}"

Character guide:
${updatedCharacterGuide}

Story beats to weave in:
${storyBeats}

Previous chapters (for continuity):
${approvedSummary}

${feedback ? `REVISION NOTES — apply these changes explicitly:\n${feedback}` : ""}

Write approximately 350 words. Use warm, conversational language appropriate for the target age. Bring characters to life with specific sensory details. Ground the story in the family's real history. End with a moment that connects past to present — something a child reading this book would remember.

Return ONLY the narrative text, no title, no chapter number, no headers.`;
}

// ── Art Director (Agent 5, runs per chapter) ─────────────────────────────────

export interface ArtDirectorInput {
  project: BookProject;
  narrative: string;
  updatedCharacterGuide: string;
  previousIllustrations: string;
}

export function buildArtDirectorPrompt({
  project,
  narrative,
  updatedCharacterGuide,
  previousIllustrations,
}: ArtDirectorInput): string {
  return `You are the Art Director for a children's illustrated book. Select the single most emotionally resonant moment from this chapter and craft a perfect illustration prompt.

Chapter narrative:
${narrative}

Art style: ${project.art_style}
Target age: ${project.target_age}
Character guide: ${updatedCharacterGuide}

${previousIllustrations ? `Previous chapter illustrations (maintain visual consistency — same character appearances, color palette, and style language):\n${previousIllustrations}` : ""}

Identify THE one best moment to illustrate — the one that would move a child most deeply and work best as a full-page illustration. Then write a Flux-optimized prompt for that exact moment.

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "sceneRationale": "One sentence explaining why this moment was chosen",
  "illustrationPrompt": "children's book illustration, ${project.art_style}, [vivid scene description with specific character details, colors, setting], soft warm lighting, high detail, storybook quality, no text"
}`;
}
