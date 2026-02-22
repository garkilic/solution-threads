import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  EXTRACTION_PROMPTS,
  DEFAULT_EXTRACTION_PROMPT,
  buildSynthesisPrompt,
} from "@/lib/prompts";

const client = new Anthropic();

interface Attachment {
  source: string;
  content: string;
}

const DEMO_DATA_FILES: Record<string, string> = {
  Ridgeline: "ridgeline-portfolio-whitfield.csv",
  Salesforce: "salesforce-whitfield.txt",
};

async function loadDemoData(source: string): Promise<string | null> {
  const filename = DEMO_DATA_FILES[source];
  if (!filename) return null;
  try {
    const filePath = join(process.cwd(), "demo-data", filename);
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function extractFromSource(
  source: string,
  content: string
): Promise<{ source: string; extracted: Record<string, unknown> }> {
  const prompt = EXTRACTION_PROMPTS[source] || DEFAULT_EXTRACTION_PROMPT;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `${prompt}\n\n═══ RAW DATA FROM ${source.toUpperCase()} ═══\n${content}`,
      },
    ],
  });

  let text =
    message.content[0].type === "text" ? message.content[0].text : "";
  text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

  try {
    return { source, extracted: JSON.parse(text) };
  } catch {
    return { source, extracted: { rawContent: content, parseError: true } };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientName, company, title, context, attachments, autoSources } =
      await req.json();

    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 }
      );
    }

    const allAttachments: Attachment[] = [];

    if (autoSources && Array.isArray(autoSources)) {
      for (const source of autoSources) {
        const content = await loadDemoData(source);
        if (content) {
          allAttachments.push({ source, content });
        }
      }
    }

    if (attachments && attachments.length > 0) {
      allAttachments.push(...attachments);
    }

    const hasData = allAttachments.length > 0;

    const extractions = hasData
      ? await Promise.all(
          allAttachments.map((a) => extractFromSource(a.source, a.content))
        )
      : [];

    const synthesisPrompt = buildSynthesisPrompt({
      clientName,
      company,
      title,
      context,
      extractions,
      hasData,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [{ role: "user", content: synthesisPrompt }],
    });

    let text =
      message.content[0].type === "text" ? message.content[0].text : "";
    text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(text);

    const { keyStats, ...sections } = parsed;

    return NextResponse.json({ keyStats, sections });
  } catch (error) {
    console.error("Workflow error:", error);
    return NextResponse.json(
      { error: "Failed to run workflow" },
      { status: 500 }
    );
  }
}
