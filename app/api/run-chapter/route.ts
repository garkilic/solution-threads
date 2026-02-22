import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  buildCharacterKeeperPrompt,
  buildOralHistoryWeaverPrompt,
  buildNarrativeWriterPrompt,
  buildArtDirectorPrompt,
} from "@/lib/prompts";

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
    const characterKeeperPrompt = buildCharacterKeeperPrompt({
      project,
      chapterInfo,
      chapterNumber,
      existingCharacterGuide,
    });

    const oralHistoryWeaverPrompt = buildOralHistoryWeaverPrompt({
      project,
      chapterInfo,
      chapterNumber,
    });

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

    const narrativePrompt = buildNarrativeWriterPrompt({
      project,
      chapterInfo,
      chapterNumber,
      updatedCharacterGuide,
      storyBeats,
      approvedSummary,
      feedback,
    });

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

    const artDirectorPrompt = buildArtDirectorPrompt({
      project,
      narrative,
      updatedCharacterGuide,
      previousIllustrations,
    });

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
