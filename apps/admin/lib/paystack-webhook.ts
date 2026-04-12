import crypto from "crypto";

const PAYSTACK_WEBHOOK_IPS = new Set([
  "52.31.139.75",
  "52.49.173.169",
  "52.214.14.220",
]);

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("Missing PAYSTACK_SECRET_KEY");
  }

  return key;
}

export function isValidPaystackSignature(
  rawBody: string,
  signature: string | null
) {
  if (!signature) {
    return false;
  }

  const secretKey = getPaystackSecretKey();

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export function getWebhookIpDetails(request: Request) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const xRealIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const forwarded = request.headers.get("forwarded");

  const parsedForwardedFor = xForwardedFor
    ? xForwardedFor.split(",").map((value) => value.trim()).filter(Boolean)
    : [];

  const clientIp =
    parsedForwardedFor[0] ||
    xRealIp?.trim() ||
    cfConnectingIp?.trim() ||
    null;

  return {
    clientIp,
    xForwardedFor,
    parsedForwardedFor,
    xRealIp,
    cfConnectingIp,
    forwarded,
  };
}

export function isPaystackIp(ip: string | null) {
  if (!ip) {
    return false;
  }

  return PAYSTACK_WEBHOOK_IPS.has(ip);
}