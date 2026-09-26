import { NextRequest } from "next/server";

/**
 * Next.js API Route: /api/iot/stream
 * Proxies the MJPEG live stream from IoT edge node (Raspberry Pi 4).
 * This avoids browser CORS / Mixed-Content restrictions by tunneling
 * the multipart MJPEG response server-side.
 */
export async function GET(request: NextRequest) {
  // Query param takes priority (user may customize IP in the UI)
  const edgeHost =
    request.nextUrl.searchParams.get("host") ||
    process.env.NEXT_PUBLIC_EDGE_HOST ||
    "192.168.137.251:8080";

  const edgeStreamUrl = `http://${edgeHost}/stream`;

  try {
    const upstream = await fetch(edgeStreamUrl, {
      headers: {
        Accept: "multipart/x-mixed-replace, */*",
      },
      // @ts-expect-error - Next.js fetch supports duplex for streaming
      duplex: "half",
      cache: "no-store",
      signal: request.signal,
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Edge node returned HTTP ${upstream.status}` }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pass through the streaming MJPEG response with correct headers
    const headers = new Headers();
    const contentType = upstream.headers.get("Content-Type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-cache, no-store");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to IoT edge node";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
