export type ContentFormat =
  | "linkedin_post"
  | "x_thread"
  | "long_essay"
  | "playbook"
  | "podcast_promo"
  | "video_clip";

export const CONTENT_FORMATS: { id: ContentFormat; label: string }[] = [
  { id: "linkedin_post", label: "LinkedIn post" },
  { id: "x_thread", label: "X thread" },
  { id: "long_essay", label: "Long essay" },
  { id: "playbook", label: "Playbook" },
  { id: "podcast_promo", label: "Podcast promo" },
  { id: "video_clip", label: "Video clip script" },
];

export type InterviewerId =
  | "tim_ferriss"
  | "joe_rogan"
  | "larry_king"
  | "howard_stern"
  | "michael_barbaro"
  | "barbara_walters";

export type CouncilMemberId =
  | "morgan_housel"
  | "tim_urban"
  | "shaan_puri"
  | "greg_isenberg"
  | "david_perell"
  | "slop_detector";

export interface VoiceProfile {
  writingSamples: string;
  diagnosticAnswers: Record<string, string>;
  styleSummary?: string;
}

export interface IdeaInput {
  idea: string;
  origin: "own_idea" | "recurring_question" | "recent_experience" | "observation";
}

export interface ResearchNote {
  source: "perplexity" | "manual";
  content: string;
}

export interface InterviewTurn {
  interviewer: InterviewerId;
  question: string;
  answer: string;
}

export interface CouncilReview {
  member: CouncilMemberId;
  score: number;
  feedback: string;
}

export interface RevisionEntry {
  iteration: number;
  changesSummary: string;
  draft: string;
  reviews: CouncilReview[];
}

export interface Project {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  voice: VoiceProfile | null;
  idea: IdeaInput | null;
  research: ResearchNote[];
  interview: InterviewTurn[];
  rawFile: string | null;
  format: ContentFormat | null;
  draft: string | null;
  reviews: CouncilReview[];
  revisions: RevisionEntry[];
}

export function newProject(id: string): Project {
  const now = new Date().toISOString();
  return {
    id,
    title: "Untitled",
    createdAt: now,
    updatedAt: now,
    voice: null,
    idea: null,
    research: [],
    interview: [],
    rawFile: null,
    format: null,
    draft: null,
    reviews: [],
    revisions: [],
  };
}
