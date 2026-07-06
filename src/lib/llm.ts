import Anthropic from '@anthropic-ai/sdk';
import { EventEmitter } from 'events';

// Provider selection, in priority order:
//   1. Gemini — if GEMINI_API_KEY is set (free tier via Google AI Studio,
//      no credit card required: https://aistudio.google.com/apikey)
//   2. Anthropic — if ANTHROPIC_API_KEY is set to a real key
//   3. Mock — canned responses, no key needed at all, for local dev/demo
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const HAS_ANTHROPIC =
  !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock';

type Provider = 'gemini' | 'anthropic' | 'mock';
const PROVIDER: Provider = GEMINI_API_KEY ? 'gemini' : HAS_ANTHROPIC ? 'anthropic' : 'mock';

const anthropic = PROVIDER === 'anthropic' ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const GEMINI_MODEL = 'gemini-2.5-flash'; // free-tier model as of mid-2026

export interface SkillAnalysis {
  currentSkills: string[];
  missingSkills: string[];
  matchScore: number; // 0-100
  summary: string;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  estWeeks: number;
}

/**
 * Extracts skills from free-text resume content and scores fit against a
 * target role. No separate NLP pipeline needed — the model does structured
 * extraction directly, which is enough signal for a v1 product.
 */
export async function analyzeSkillGap(
  resumeText: string,
  currentRole: string,
  targetRole: string
): Promise<SkillAnalysis> {
  if (PROVIDER === 'mock') {
    return {
      currentSkills: ['Communication', 'Problem solving', 'Time management', 'Domain knowledge'],
      missingSkills: ['Advanced tooling', 'System design', 'Leadership experience'],
      matchScore: 55,
      summary:
        `[Mock mode] You have a solid foundation for ${currentRole}, but ${targetRole} ` +
        `typically expects deeper systems thinking and more hands-on ownership of larger projects.`,
    };
  }

  const prompt = `You are a career analyst. Given a person's resume text, their
current role, and their target role, do the following:
1. Extract the concrete skills evidenced in the resume (technical + relevant soft skills).
2. Identify the skills typically required for the target role that are missing.
3. Score how ready they are for the target role (0-100).
4. Write a 2-sentence plain-language summary of the gap.

Current role: ${currentRole}
Target role: ${targetRole}
Resume text:
"""
${resumeText.slice(0, 8000)}
"""

Respond with ONLY valid JSON, no markdown fences, matching this shape:
{"currentSkills": string[], "missingSkills": string[], "matchScore": number, "summary": string}`;

  const text = await callProvider(prompt);
  return parseJsonLoose(text);
}

/**
 * Turns a skill gap into an ordered set of milestones — the visual spine of
 * the roadmap page.
 */
export async function generateRoadmap(
  currentRole: string,
  targetRole: string,
  missingSkills: string[]
): Promise<RoadmapMilestone[]> {
  if (PROVIDER === 'mock') {
    return missingSkills.slice(0, 5).map((skill, i) => ({
      title: `[Mock] Build fundamentals in ${skill}`,
      description: `Placeholder milestone — set GEMINI_API_KEY or ANTHROPIC_API_KEY to generate a real roadmap toward ${targetRole}.`,
      estWeeks: 2 + i,
    }));
  }

  const prompt = `Create a realistic, ordered learning roadmap for someone
moving from "${currentRole}" to "${targetRole}". They are missing these
skills: ${missingSkills.join(', ')}.

Produce 5-7 milestones, each achievable, ordered by dependency (foundational
first). Respond with ONLY valid JSON, no markdown fences:
[{"title": string, "description": string, "estWeeks": number}, ...]`;

  const text = await callProvider(prompt);
  return parseJsonLoose(text);
}

export interface ChatStream {
  on(event: 'text', listener: (delta: string) => void): unknown;
  on(event: 'end', listener: () => void): unknown;
  on(event: 'error', listener: (err: unknown) => void): unknown;
}

/**
 * Streaming chat for the career advisor. Returns an object with the same
 * .on('text'|'end'|'error') interface regardless of provider, so the API
 * route doesn't need to know whether it's talking to Gemini, Anthropic, or
 * the mock. Anthropic streams natively; Gemini and mock responses are
 * fetched/generated in full and then played back through the same chunked
 * emitter for a consistent UX.
 */
export function streamAdvisorChat(
  history: { role: 'user' | 'assistant'; content: string }[],
  profileContext: string
): ChatStream {
  const system = `You are a warm, direct career advisor inside Career Compass.
The user's profile: ${profileContext}
Give specific, actionable guidance — not generic pep talk. Keep responses
under 150 words unless the user asks for depth.`;

  if (PROVIDER === 'mock') {
    return chunkedStream(
      `[Mock mode — set GEMINI_API_KEY (free) or ANTHROPIC_API_KEY to talk to the actual advisor] ` +
        `Based on your profile (${profileContext}), a good first step is usually to pick one ` +
        `missing skill and build something real with it rather than studying it in the abstract.`
    );
  }

  if (PROVIDER === 'anthropic') {
    return anthropic!.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system,
      messages: history,
    }) as unknown as ChatStream;
  }

  // Gemini: fetch the full reply, then play it back chunked so the UI's
  // streaming behavior is identical across providers.
  const emitter = new EventEmitter();
  callGemini(history.map((h) => h.content).join('\n\n'), system)
    .then((text) => playback(emitter, text))
    .catch((err) => emitter.emit('error', err));
  return emitter as unknown as ChatStream;
}

// --- Provider plumbing -----------------------------------------------

async function callProvider(prompt: string): Promise<string> {
  if (PROVIDER === 'gemini') return callGemini(prompt);
  const res = await anthropic!.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('Gemini returned no text — check your prompt or quota.');
  return text;
}

// Anthropic (and Gemini) sometimes wrap JSON in prose or fences despite
// instructions — this strips common wrappers before parsing so a stray
// sentence doesn't throw away an otherwise-good response.
function parseJsonLoose(text: string) {
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  const jsonSlice = start >= 0 && end >= start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(jsonSlice);
}

function chunkedStream(fullText: string): ChatStream {
  const emitter = new EventEmitter();
  setTimeout(() => playback(emitter, fullText), 0);
  return emitter as unknown as ChatStream;
}

function playback(emitter: EventEmitter, fullText: string) {
  const words = fullText.split(' ');
  let i = 0;
  const interval = setInterval(() => {
    if (i >= words.length) {
      clearInterval(interval);
      emitter.emit('end');
      return;
    }
    emitter.emit('text', (i === 0 ? '' : ' ') + words[i]);
    i++;
  }, 20);
}
