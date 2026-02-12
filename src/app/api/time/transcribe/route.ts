import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { transcribeRateLimit } from "@/lib/api/rate-limit";
import { requireFeature } from "@/lib/polar/feature-gate";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await requireFeature(user.id, "voiceInput");

    const { success, retryAfterMs } = await transcribeRateLimit.check(user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: { code: "MISSING_AUDIO", message: "Audio file is required" } },
        { status: 422 },
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "Audio file exceeds 25MB limit" } },
        { status: 422 },
      );
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: { code: "EMPTY_AUDIO", message: "Audio file is empty" } },
        { status: 422 },
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const ext = audioFile.type.includes("mp4") ? "mp4" : "webm";
    const file = await toFile(buffer, `recording.${ext}`, { type: audioFile.type });

    const transcription = await getOpenAI().audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    const text = typeof transcription === "string" ? transcription : String(transcription);

    if (!text.trim()) {
      return NextResponse.json(
        { error: { code: "EMPTY_TRANSCRIPTION", message: "No speech detected" } },
        { status: 422 },
      );
    }

    return NextResponse.json({ data: { text: text.trim() } });
  } catch (error) {
    return handleApiError(error);
  }
}
