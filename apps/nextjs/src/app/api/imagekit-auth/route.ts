import { v4 as uuidv4 } from "uuid";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? uuidv4();
  const expire = searchParams.get("expire") ?? Math.round(Date.now() / 1000) + 2400;

  const encoder = new TextEncoder();
  const data = encoder.encode(token + expire);
  const keyData = encoder.encode(process.env.IMAGEKIT_PRIVATE_KEY);

  try {
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: { name: "SHA-1" } }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, data);
    const hexSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const response = new Response(JSON.stringify({ token, expire, signature: hexSignature }));
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ success: false }));
  }
}
