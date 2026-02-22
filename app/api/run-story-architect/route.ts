import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildStoryArchitectPrompt } from "@/lib/prompts";

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

    const prompt = buildStoryArchitectPrompt({
      title,
      subjectName,
      targetAge,
      artStyle,
      ancestryData,
      oralHistory,
    });

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
