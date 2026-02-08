import { z } from "zod/v4";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  LLM_MODEL_PARSE: z.string().min(1),
  LLM_MODEL_PARSE_FALLBACK: z.string().min(1),
  LLM_MODEL_GENERATE: z.string().min(1),
  LLM_MODEL_GENERATE_PREMIUM: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  LLM_MODEL_PARSE: process.env.LLM_MODEL_PARSE,
  LLM_MODEL_PARSE_FALLBACK: process.env.LLM_MODEL_PARSE_FALLBACK,
  LLM_MODEL_GENERATE: process.env.LLM_MODEL_GENERATE,
  LLM_MODEL_GENERATE_PREMIUM: process.env.LLM_MODEL_GENERATE_PREMIUM,
});
