import { NextResponse } from "next/server";
import type { AnalyzeRequest, ApiError } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AnalyzeRequest>;
  if (!body.architecture || !body.rawLogs) {
    return NextResponse.json<ApiError>({ error: "architecture and rawLogs are required" }, { status: 400 });
  }
  return NextResponse.json<ApiError>({ error: "Analysis pipeline has not been implemented." }, { status: 501 });
}
