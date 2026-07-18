import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { AnalysisResult, AnalyzeRequest, ApiError } from "@/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are ARGUS, a senior security incident responder and threat hunter.

Analyze the supplied architecture and raw incident logs with disciplined, evidence-led reasoning. Your role is to reconstruct plausible attack narratives while preserving uncertainty.

Operating rules:
1. Generate 2 to 4 genuinely competing hypotheses, ranked by confidence (0-100). Do not merely restate the same theory with different titles. Include benign, operational, insider, or alternative explanations whenever the evidence permits.
2. Treat logs as evidence, not proof. Distinguish observed facts from inference. Every claim in a hypothesis must be traceable to evidenceItems, stated as an evidence gap, or explicitly described as an assumption in weakeningFactors.
3. Create evidenceItems for the material log events. Preserve the source line or concise source excerpt in rawContent. Use stable IDs such as ev-1, ev-2, and refer to only those IDs from hypotheses and timeline entries.
4. Build a chronological timeline from the evidence. Map relevant activity to accurate MITRE ATT&CK technique IDs and names; omit a technique only when no defensible mapping exists.
5. Consider the supplied assets, connections, zones, and trust boundaries. Attack-path steps must use actual asset IDs from the architecture, except that \"external\" may represent an outside actor. Never invent an asset, connection, host, account, log source, or observation.
6. For each hypothesis, cite supporting and conflicting evidence separately, explain weakening factors, and include only MITRE techniques that its narrative supports.
7. Identify actionable evidence gaps that could differentiate hypotheses. State which hypothesis IDs each gap would strengthen or weaken and assign a realistic priority.
8. Assess severity from the demonstrated or credibly suspected impact, not merely from suspiciousness. Use one of critical, high, medium, or low.
9. Be concise but specific. Do not expose hidden chain-of-thought; the reasoning field must be a brief, auditable analyst rationale based on the listed evidence.
10. Return only an object that conforms to the requested JSON schema. Do not include markdown, prose outside JSON, or fields not in the schema.`;

const ANALYSIS_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "severity", "evidenceItems", "timeline", "hypotheses", "evidenceGaps"],
  properties: {
    summary: { type: "string" },
    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
    evidenceItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "timestamp", "summary", "rawContent", "linkedHypotheses", "assetId"],
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: ["AUTH_LOG", "AUTH_SUCCESS_LOG", "NETWORK_LOG", "DATA_LOG", "SYSTEM_LOG", "ENDPOINT_LOG"],
          },
          timestamp: { type: "string" },
          summary: { type: "string" },
          rawContent: { type: "string" },
          linkedHypotheses: { type: "array", items: { type: "integer" } },
          assetId: { type: ["string", "null"] },
        },
      },
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["evidenceId", "timestamp", "label", "mitreTechnique", "mitreName"],
        properties: {
          evidenceId: { type: "string" },
          timestamp: { type: "string" },
          label: { type: "string" },
          mitreTechnique: { type: ["string", "null"] },
          mitreName: { type: ["string", "null"] },
        },
      },
    },
    hypotheses: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "confidence", "summary", "reasoning", "supportingEvidence", "conflictingEvidence", "weakeningFactors", "mitreTechniques", "attackPath"],
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          summary: { type: "string" },
          reasoning: { type: "string" },
          supportingEvidence: { type: "array", items: { type: "string" } },
          conflictingEvidence: { type: "array", items: { type: "string" } },
          weakeningFactors: { type: "array", items: { type: "string" } },
          mitreTechniques: { type: "array", items: { type: "string" } },
          attackPath: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["fromAssetId", "toAssetId", "action"],
              properties: {
                fromAssetId: { type: "string" },
                toAssetId: { type: "string" },
                action: { type: "string" },
              },
            },
          },
        },
      },
    },
    evidenceGaps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "description", "strengthens", "weakens", "priority"],
        properties: {
          id: { type: "string" },
          description: { type: "string" },
          strengthens: { type: "array", items: { type: "integer" } },
          weakens: { type: "array", items: { type: "integer" } },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
  },
} as const;

export async function POST(request: Request) {
  let body: Partial<AnalyzeRequest>;

  try {
    body = (await request.json()) as Partial<AnalyzeRequest>;
  } catch {
    return NextResponse.json<ApiError>({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body.architecture || typeof body.rawLogs !== "string" || !body.rawLogs.trim()) {
    return NextResponse.json<ApiError>(
      { error: "architecture and a non-empty rawLogs string are required" },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-key-here") {
    return NextResponse.json<ApiError>({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.6",
      instructions: SYSTEM_PROMPT,
      input: `Architecture JSON:\n${JSON.stringify(body.architecture, null, 2)}\n\nRaw incident logs:\n${body.rawLogs}\n\nGenerate the analysis now.`,
      text: {
        format: {
          type: "json_schema",
          name: "analysis_result",
          strict: true,
          schema: ANALYSIS_RESULT_SCHEMA,
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json<ApiError>({ error: "The analysis model returned no structured output." }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(response.output_text) as AnalysisResult);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json<ApiError>(
        { error: "OpenAI analysis request failed." },
        { status: error.status ?? 502 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json<ApiError>({ error: "The analysis model returned invalid JSON." }, { status: 502 });
    }

    console.error("Failed to analyze incident:", error);
    return NextResponse.json<ApiError>({ error: "Unable to analyze the incident." }, { status: 500 });
  }
}
