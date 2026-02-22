// Synthesis prompt for meeting prep — combines structured facts extracted from
// all connected data sources into a five-section client briefing.

export interface SynthesisInput {
  clientName: string;
  company?: string;
  title?: string;
  context?: string;
  extractions: { source: string; extracted: Record<string, unknown> }[];
  hasData: boolean;
}

export function buildSynthesisPrompt({
  clientName,
  company,
  title,
  context,
  extractions,
  hasData,
}: SynthesisInput): string {
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
