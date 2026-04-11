const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
    };
    metadata?: Record<string, unknown> | null;
  };
};

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("Missing PAYSTACK_SECRET_KEY");
  }

  return key;
}

async function parsePaystackJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Invalid response received from Paystack.");
  }
}

export async function initializePaystackTransaction(payload: {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  const secretKey = getPaystackSecretKey();

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await parsePaystackJson<PaystackInitializeResponse>(response);

  if (!response.ok || !result.status) {
    throw new Error(result.message || "Failed to initialize payment.");
  }

  return result;
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = getPaystackSecretKey();

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await parsePaystackJson<PaystackVerifyResponse>(response);

  if (!response.ok || !result.status) {
    throw new Error(result.message || "Failed to verify payment.");
  }

  return result;
}