import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { title, subjectName, targetAge, artStyle, ancestryData, oralHistory } =
      await req.json();

    if (!title || !subjectName) {
      return NextResponse.json(
        { error: "title and subjectName are required" },
        { status: 400 }
      );
    }

    const prompt = `You are the Story Architect for a children's genealogy book. Your job is to plan the full chapter outline for the entire book before a single word is written. This outline will guide every chapter that follows.

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    let text = message.content[0].type === "text" ? message.content[0].text : "[]";
    text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    const chapterOutline = JSON.parse(text);

    return NextResponse.json({ chapterOutline });
  } catch (error) {
    console.error("Story Architect error:", error);
    return NextResponse.json(
      { error: "Failed to generate book outline" },
      { status: 500 }
    );
  }
}
