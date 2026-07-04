import { ContentFormat } from "./types";

export const FORMAT_SPEC: Record<ContentFormat, string> = {
  linkedin_post:
    "Write a LinkedIn post. 100-300 words. Short paragraphs (1-3 lines), a scroll-stopping first line, no hashtag spam, plain language. End with a line that invites engagement or leaves the reader with something to sit with.",
  x_thread:
    "Write an X (Twitter) thread. Tweet 1 is a standalone hook under 220 characters that creates curiosity. Each subsequent tweet is short, punchy, and advances one idea. Number the tweets. 6-12 tweets total. Close with a summary or call-to-action tweet.",
  long_essay:
    "Write a long-form essay, 900-1500 words. A strong opening scene or claim, clear section breaks, one idea developed with evidence and story per section, and a closing that returns to the opening image or claim.",
  playbook:
    "Write a tactical playbook. Use a clear title, a one-paragraph premise, then numbered concrete steps a reader can follow today. Include specifics (tools, numbers, sequencing) over generic advice. End with a short 'common mistakes' or 'what not to do' section.",
  podcast_promo:
    "Write podcast episode promo copy: an episode title, a 2-3 sentence teaser description built around the most surprising or emotional moment, and 3-5 punchy pull-quotes suitable for social clips.",
  video_clip:
    "Write a short-form video script (30-90 seconds). Format as: [HOOK - first line spoken on camera], then numbered beats with what's said, and a closing line. Optimize for a strong verbal hook in the first 2 seconds.",
};
