/**
 * Toolkit v2 — AI via Rork AI Cloud-proxy (/v2/vercel).
 *
 * Ersätter compat-API:t i @rork-ai/toolkit-sdk (generateObject/generateText)
 * med officiell AI SDK mot Toolkit v2-gatewayen. Modellval: snabbast/billigast.
 *
 * Säkerhet & kostnadskontroll:
 *  - ALL text som skickas till modellen klemmas hårt (MAX_PROMPT_CHARS).
 *  - ALLA svar är tokenbegränsade (MAX_OUTPUT_TOKENS) — inget anrop kan
 *    generera obegränsad output och drabba fakturan.
 *  - Fallback-modell konfigurerad via gatewayen (model-fallbacks).
 *
 * OBS: Den verkliga kostnadsskyddet ligger serverside i Rork AI Cloud
 * (auth, billing, rate limiting per projekt). Klientgränserna här är ett
 * extra skyddslager, inte en ersättning.
 */
import {
  createGateway,
  generateObject as aiGenerateObject,
  generateText as aiGenerateText,
} from 'ai';
import type { z } from 'zod';

/** Snabbaste/billigaste kapabla modellen på gatewayen (text + bild-input). */
export const AI_MODEL = 'google/gemini-2.5-flash-lite';
/** Fallback om primärmodellen inte svarar. */
export const AI_MODEL_FALLBACK = 'google/gemini-2.5-flash';

/** Högsta antal tecken användarmaterial som får skickas till modellen. */
export const MAX_PROMPT_CHARS = 8_000;
/** Högsta antal output-tokens per anrop. */
export const MAX_OUTPUT_TOKENS = 8_000;
/** Högsta antal bilder per anrop. */
export const MAX_INPUT_IMAGES = 4;

/** Klemma användarkontrollerad text — skydd mot gigantiska prompts. */
export const clampText = (text: string, max: number = MAX_PROMPT_CHARS): string =>
  typeof text === 'string' ? text.slice(0, max) : '';

type TextPartMsg = { type: 'text'; text: string };
type ImagePartMsg = { type: 'image'; image: string };
export type ToolkitMessage = {
  role: 'user' | 'assistant';
  content: string | (TextPartMsg | ImagePartMsg)[];
};

/** Rensar meddelanden: klemmar text, begränsar antal bilder. */
function sanitizeMessages(messages: ToolkitMessage[]): ToolkitMessage[] {
  let imageBudget = MAX_INPUT_IMAGES;
  return (messages ?? []).slice(0, 24).map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: clampText(m.content) };
    }
    const content = m.content
      .map((part) => {
        if (part.type === 'text') {
          return { type: 'text' as const, text: clampText(part.text) };
        }
        if (imageBudget > 0) {
          imageBudget -= 1;
          return { type: 'image' as const, image: part.image };
        }
        return null;
      })
      .filter(Boolean) as (TextPartMsg | ImagePartMsg)[];
    return { role: m.role, content };
  });
}

const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL ?? 'https://toolkit.rork.com';

const gateway = createGateway({
  baseURL: `${TOOLKIT_URL}/v2/vercel/v3/ai`,
  apiKey: process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY ?? '',
});

/** Strukturerad generering (JSON enligt zod-schema) via Toolkit v2. */
export async function generateObject<T extends z.ZodType>(params: {
  messages: ToolkitMessage[];
  schema: T;
  maxOutputTokens?: number;
}): Promise<z.infer<T>> {
  const { object } = await aiGenerateObject({
    model: gateway(AI_MODEL),
    schema: params.schema,
    messages: sanitizeMessages(params.messages) as any,
    maxOutputTokens: Math.min(params.maxOutputTokens ?? MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS),
    providerOptions: { gateway: { models: [AI_MODEL_FALLBACK] } },
  } as any);
  return object as z.infer<T>;
}

/** Fri textgenerering via Toolkit v2. */
export async function generateText(params: {
  messages: ToolkitMessage[];
  maxOutputTokens?: number;
}): Promise<string> {
  const result = await aiGenerateText({
    model: gateway(AI_MODEL),
    messages: sanitizeMessages(params.messages) as any,
    maxOutputTokens: Math.min(params.maxOutputTokens ?? MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS),
    providerOptions: { gateway: { models: [AI_MODEL_FALLBACK] } },
  } as any);
  return result.text;
}
