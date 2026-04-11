import crypto from "crypto";

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

  return hash === signature;
}