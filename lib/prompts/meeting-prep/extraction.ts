// Extraction prompts for meeting prep — one per data source.
// Each prompt instructs Claude Haiku to return a strict JSON schema
// from raw exported data. Add new sources by extending EXTRACTION_PROMPTS.

export const EXTRACTION_PROMPTS: Record<string, string> = {
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

// Fallback for unrecognised data sources
export const DEFAULT_EXTRACTION_PROMPT = `Extract all structured facts from this data export. Return ONLY a valid JSON object (no markdown, no code fences) with these fields:

{
  "facts": [{ "category": string, "key": string, "value": string }],
  "summary": string
}

Extract facts exactly as stated. Do not infer or add information.`;
