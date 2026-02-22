// Central prompt registry — import all prompts from here.
// Adding a new workflow thread = add its prompts here, not inside API routes.

export {
  EXTRACTION_PROMPTS,
  DEFAULT_EXTRACTION_PROMPT,
} from "./meeting-prep/extraction";

export {
  buildSynthesisPrompt,
  type SynthesisInput,
} from "./meeting-prep/synthesis";

export {
  buildStoryArchitectPrompt,
  buildCharacterKeeperPrompt,
  buildOralHistoryWeaverPrompt,
  buildNarrativeWriterPrompt,
  buildArtDirectorPrompt,
  type StoryArchitectInput,
  type CharacterKeeperInput,
  type OralHistoryWeaverInput,
  type NarrativeWriterInput,
  type ArtDirectorInput,
} from "./storytelling/agents";
