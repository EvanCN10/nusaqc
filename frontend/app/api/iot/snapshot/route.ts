import { NextRequest } from "next/server";

/**
 * Next.js API Route: /api/iot/snapshot
 * Proxies a single JPEG snapshot from the IoT edge node.
 * Used when "Capture Snapshot & Run AI" is triggered in hardware mode.
 */
export async function GET(request: NextRequest) {
  // Query param takes priority (user may customize IP in the UI)
  const edgeHost =
    request.nextUrl.searchParams.get("host") ||
    process.env.NEXT_PUBLIC_EDGE_HOST ||
    "192.168.137.251:8080";

  const snapshotUrl = `http://${edgeHost}/snapshot`;

  try {
    const upstream = await fetch(snapshotUrl, {
      cache: "no-store",
      headers: { Accept: "image/jpeg, image/*" },
      signal: AbortSignal.timeout(3000),
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Edge node returned HTTP ${upstream.status}` }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const blob = await upstream.arrayBuffer();

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to capture snapshot from IoT edge node";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Health check for the edge node via proxy
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const edgeHost =
    body?.host ||
    process.env.NEXT_PUBLIC_EDGE_HOST ||
    "192.168.137.251:8080";

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);

    const res = await fetch(`http://${edgeHost}/health`, {
      cache: "no-store",
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ online: res.ok, ...data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ online: false, error: "Unreachable" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
