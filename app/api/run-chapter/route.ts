import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const maxDuration = 60; // seconds (requires Vercel Pro for >10s)
import {
  getBookProject,
  getBookChapters,
  updateBookProjectOutline,
  saveBookChapter,
} from "@/lib/storage-server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { projectId, chapterNumber, feedback } = await req.json();

    if (!projectId || !chapterNumber) {
      return NextResponse.json(
        { error: "projectId and chapterNumber are required" },
        { status: 400 }
      );
    }

    // 1. Load project + approved chapters from DB
    const project = await getBookProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const allChapters = await getBookChapters(projectId);
    const approvedChapters = allChapters
      .filter((c) => c.status === "approved")
      .map((c) => ({
        chapterNumber: c.chapter_number,
        title: c.title || "",
        narrative: c.narrative || "",
        illustrationPrompt: c.illustration_prompt || "",
      }));

    const chapterInfo = project.chapter_outline?.[chapterNumber - 1];
    const existingCharacterGuide = project.character_guide || "";

    // --- Agents 2 & 3: Character Keeper + Oral History Weaver (parallel) ---
    const characterKeeperPrompt = `You are the Character Keeper for a children's genealogy book. Maintain a living character guide that tracks all characters across chapters.

Current character guide:
${existingCharacterGuide || "No characters established yet."}

This chapter is about: "${chapterInfo?.theme || `Chapter ${chapterNumber}`}"
Key characters in this chapter: ${chapterInfo?.keyCharacters?.join(", ") || "to be determined"}
Family subject: "${project.subject_name}"
Ancestry data: ${project.ancestry_data || "Not provided"}

Update the character guide to include any new characters or updated details. Keep it concise and organized by character name. For each character include: full name, approximate age/generation, relationship to ${project.subject_name}, brief physical description, personality traits.

Return ONLY the updated character guide as plain text, no JSON, no markdown headers.`;

    const oralHistoryWeaverPrompt = `You are the Oral History Weaver for a children's genealogy book. Select and shape the most powerful oral history moments for this chapter.

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

    const [characterKeeperMsg, weaverMsg] = await Promise.all([
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: characterKeeperPrompt }],
      }),
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: oralHistoryWeaverPrompt }],
      }),
    ]);

    const updatedCharacterGuide =
      characterKeeperMsg.content[0].type === "text"
        ? characterKeeperMsg.content[0].text
        : existingCharacterGuide;

    const storyBeats =
      weaverMsg.content[0].type === "text" ? weaverMsg.content[0].text : "";

    // Update character guide in DB (parallel with narrative writing — NW uses in-memory value)
    const characterGuideDbWrite = updateBookProjectOutline(
      projectId,
      project.chapter_outline || [],
      updatedCharacterGuide
    );

    // --- Agent 4: Narrative Writer ---
    const approvedSummary =
      approvedChapters.length > 0
        ? approvedChapters
            .map(
              (ch) =>
                `Chapter ${ch.chapterNumber}: ${ch.title}\n${ch.narrative.substring(0, 250)}...`
            )
            .join("\n\n")
        : "This is the first chapter.";

    const narrativePrompt = `You are the Narrative Writer for a children's genealogy book. Write a warm, age-appropriate chapter narrative.

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

    const narrativeMsg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: narrativePrompt }],
    });
    const narrative =
      narrativeMsg.content[0].type === "text" ? narrativeMsg.content[0].text : "";

    // --- Agent 5: Art Director ---
    const previousIllustrations = approvedChapters
      .filter((c) => c.illustrationPrompt)
      .map((c) => `Chapter ${c.chapterNumber}: ${c.illustrationPrompt}`)
      .join("\n\n");

    const artDirectorPrompt = `You are the Art Director for a children's illustrated book. Select the single most emotionally resonant moment from this chapter and craft a perfect illustration prompt.

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

    const artDirectorMsg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: artDirectorPrompt }],
    });

    let artText =
      artDirectorMsg.content[0].type === "text"
        ? artDirectorMsg.content[0].text
        : "{}";
    artText = artText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    let illustrationPrompt = "";
    let sceneRationale = "";
    try {
      const artData = JSON.parse(artText);
      illustrationPrompt = artData.illustrationPrompt || "";
      sceneRationale = artData.sceneRationale || "";
    } catch {
      illustrationPrompt = artText;
    }

    // --- Replicate / Flux image generation ---
    let imageUrl = "";
    if (process.env.REPLICATE_API_TOKEN && illustrationPrompt) {
      try {
        const Replicate = (await import("replicate")).default;
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
          useFileOutput: false,
        });

        const output = await replicate.run("black-forest-labs/flux-schnell", {
          input: {
            prompt: illustrationPrompt,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
          },
        });

        let replicateUrl = "";
        if (Array.isArray(output) && output[0]) {
          replicateUrl = String(output[0]);
        } else if (output) {
          replicateUrl = String(output);
        }

        // Upload to Supabase Storage for a permanent URL
        if (replicateUrl) {
          try {
            const imgResponse = await fetch(replicateUrl);
            const blob = await imgResponse.blob();
            const fileName = `chapter-${projectId}-${chapterNumber}-${Date.now()}.webp`;

            const serverClient = createServerClient();
            const { error: uploadError } = await serverClient.storage
              .from("book-images")
              .upload(fileName, blob, { contentType: "image/webp", upsert: true });

            if (!uploadError) {
              const { data: urlData } = serverClient.storage
                .from("book-images")
                .getPublicUrl(fileName);
              imageUrl = urlData.publicUrl;
            } else {
              imageUrl = replicateUrl;
            }
          } catch {
            imageUrl = replicateUrl;
          }
        }
      } catch (err) {
        console.error("Replicate image generation error:", err);
      }
    }

    // Save chapter + ensure character guide write completes
    const [chapterId] = await Promise.all([
      saveBookChapter(projectId, chapterNumber, {
        title: chapterInfo?.title || `Chapter ${chapterNumber}`,
        narrative,
        illustrationPrompt,
        imageUrl,
      }),
      characterGuideDbWrite,
    ]);

    return NextResponse.json({
      id: chapterId,
      title: chapterInfo?.title || `Chapter ${chapterNumber}`,
      narrative,
      illustrationPrompt,
      sceneRationale,
      imageUrl,
    });
  } catch (error) {
    console.error("Chapter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate chapter" },
      { status: 500 }
    );
  }
}
