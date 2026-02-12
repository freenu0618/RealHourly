import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError } from "./errors";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.issues,
        },
      },
      { status: 422 },
    );
  }

  // OpenAI API errors (timeout, connection)
  if (error instanceof Error && (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT"))) {
    return NextResponse.json(
      { error: { code: "LLM_TIMEOUT", message: "AI service timed out. Please try again." } },
      { status: 504 },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}
