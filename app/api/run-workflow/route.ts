import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

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

// --- Phase 1: Source-specific extraction prompts ---

const EXTRACTION_PROMPTS: Record<string, string> = {
  Ridgeline: `Extract structured facts from this Ridgeline portfolio report. Return ONLY a valid JSON object (no markdown, no code fences) with these fields. Use null for any field not found in the data.

{
  "totalAUM": number or null,
  "cashPosition": number or null,
  "unrealizedGainLoss": number or null,
  "ytdReturn": string or null (e.g. "+2.14%"),
  "benchmarkReturn": string or null,
  "excessReturn": string or null,
  "allocations": [{ "assetClass": string, "marketValue": number, "weight": string, "target": string, "variance": string }],
  "topHoldings": [{ "security": string, "ticker": string, "marketValue": number, "weight": string, "esgRating": string }],
  "esgScore": string or null,
  "carbonIntensity": string or null,
  "fossilFuelExposure": string or null,
  "recentTransactions": [{ "date": string, "action": string, "security": string, "amount": number, "notes": string }],
  "notes": [string]
}

Extract numbers exactly as they appear. Do not round or estimate.`,

  Salesforce: `Extract structured facts from this Salesforce CRM export. Return ONLY a valid JSON object (no markdown, no code fences) with these fields. Use null for any field not found in the data.

{
  "clientSince": string or null (e.g. "March 2018"),
  "aumTier": string or null,
  "serviceModel": string or null,
  "relatedContacts": [{ "name": string, "relationship": string, "details": string }],
  "timeline": [{ "date": string, "event": string }],
  "recentActivity": [{ "date": string, "type": string, "summary": string }],
  "openTasks": [{ "task": string, "assignee": string, "due": string, "notes": string }],
  "preferences": [string]
}

Extract all facts exactly as stated. Do not infer or add information.`,

  Fidelity: `Extract structured facts from this Fidelity custodian export. Return ONLY a valid JSON object (no markdown, no code fences) with these fields. Use null for any field not found in the data.

{
  "accountNumber": string or null,
  "accountType": string or null,
  "cashBalance": number or null,
  "pendingDebits": number or null,
  "pendingCredits": number or null,
  "pendingTransactions": [{ "date": string, "type": string, "amount": number, "description": string }],
  "recentTransactions": [{ "date": string, "type": string, "amount": number, "description": string }],
  "complianceItems": [string],
  "authorizedContacts": [string]
}

Extract numbers exactly as they appear. Do not round or estimate.`,

  Outlook: `Extract structured facts from this Outlook email/calendar export. Return ONLY a valid JSON object (no markdown, no code fences) with these fields. Use null for any field not found in the data.

{
  "emailThreads": [{ "subject": string, "date": string, "from": string, "to": string, "summary": string, "actionItems": [string] }],
  "upcomingCalendar": [{ "date": string, "event": string, "details": string }]
}

Summarize each email thread concisely. Extract all action items mentioned.`,
};

// Generic extraction prompt for unknown sources
const DEFAULT_EXTRACTION_PROMPT = `Extract all structured facts from this data export. Return ONLY a valid JSON object (no markdown, no code fences) with these fields:

{
  "facts": [{ "category": string, "key": string, "value": string }],
  "summary": string
}

Extract facts exactly as stated. Do not infer or add information.`;

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
    // If extraction fails to parse, pass raw content through
    return { source, extracted: { rawContent: content, parseError: true } };
  }
}

// --- Phase 2: Synthesis prompt ---

function buildSynthesisPrompt(
  clientName: string,
  company: string | undefined,
  title: string | undefined,
  context: string | undefined,
  extractions: { source: string; extracted: Record<string, unknown> }[],
  hasData: boolean
): string {
  const extractedDataSection = extractions
    .map(
      (e) =>
        `\n═══ EXTRACTED FACTS FROM ${e.source.toUpperCase()} ═══\n${JSON.stringify(e.extracted, null, 2)}`
    )
    .join("\n");

  return `You are an AI assistant embedded in a wealth management firm's workflow system. You are preparing a client meeting briefing for a portfolio manager at an RIA (Registered Investment Advisor) that provides bespoke, high-touch sustainable investing services.

Client: ${clientName}
${company ? `Entity: ${company}` : ""}
${title ? `Title/Role: ${title}` : ""}
${context ? `Meeting context: ${context}` : ""}
${
  hasData
    ? `\nThe following STRUCTURED FACTS have been extracted from the firm's systems. Use these facts as the PRIMARY source for your briefing. Cite specific numbers, dates, and names exactly as they appear in the extracted data. Do NOT fabricate any data points.\n${extractedDataSection}`
    : `\nNo data exports were attached. Generate realistic demo data that shows what the output would look like when connected to real systems. Use specific dollar amounts, dates, and percentages to make it feel real.`
}

Respond with ONLY a valid JSON object (no markdown, no code fences) with a "keyStats" object and five sections. Each section should have 3-5 concise, specific bullet points:

{
  "keyStats": {
    "aum": "Total AUM as a formatted string, e.g. '$12.8M'",
    "tenure": "How long they've been a client, e.g. '7 years'",
    "ytdReturn": "YTD portfolio return, e.g. '+2.14%'",
    "keyAsk": "The single most important thing the client wants to discuss, one short phrase"
  },
  "portfolioSummary": ["bullet 1", "bullet 2", "..."],
  "relationshipHistory": ["bullet 1", "bullet 2", "..."],
  "accountStatus": ["bullet 1", "bullet 2", "..."],
  "recentCommunications": ["bullet 1", "bullet 2", "..."],
  "meetingAgenda": ["bullet 1", "bullet 2", "..."]
}

For portfolioSummary (source: Ridgeline): current AUM, asset allocation breakdown, YTD performance vs benchmark, notable positions, ESG/sustainability metrics.
For relationshipHistory (source: Salesforce): client tenure, key milestones, family/entity structure, open cases or pending requests, last meeting summary.
For accountStatus (source: Fidelity Custodian): recent transfers or cash movements, pending transactions, compliance flags or required actions, account types.
For recentCommunications (source: Outlook): last 3-5 interactions (emails, calls), outstanding requests or follow-ups, tone of recent communications.
For meetingAgenda (synthesized from all sources): recommended talking points, questions to ask, concerns to address proactively, action items to propose.

Be concise and professional. Each bullet should be one clear sentence. ${hasData ? "Stick strictly to the extracted facts — do not fabricate information." : ""}`;
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

    // Build full attachment list: auto-connected demo data + manual uploads
    const allAttachments: Attachment[] = [];

    // Load demo data for auto-connected sources
    if (autoSources && Array.isArray(autoSources)) {
      for (const source of autoSources) {
        const content = await loadDemoData(source);
        if (content) {
          allAttachments.push({ source, content });
        }
      }
    }

    // Add manual attachments
    if (attachments && attachments.length > 0) {
      allAttachments.push(...attachments);
    }

    const hasData = allAttachments.length > 0;

    // --- Phase 1: Extract structured facts from each source in parallel ---
    const extractions = hasData
      ? await Promise.all(
          allAttachments.map((a) => extractFromSource(a.source, a.content))
        )
      : [];

    // --- Phase 2: Synthesize briefing from extracted facts ---
    const synthesisPrompt = buildSynthesisPrompt(
      clientName,
      company,
      title,
      context,
      extractions,
      hasData
    );

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
