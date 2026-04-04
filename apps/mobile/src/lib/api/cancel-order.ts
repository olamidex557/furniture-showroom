export type CancelOrderParams = {
  orderId: string;
  getToken: () => Promise<string | null>;
};

export type CancelOrderResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  reason?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
  data?: unknown;
};

function normalizeServerMessage(result: CancelOrderResponse | null) {
  return (
    result?.error ||
    result?.message ||
    result?.details ||
    result?.reason ||
    'Failed to cancel order.'
  );
}

export async function cancelOrderViaAdminApi({
  orderId,
  getToken,
}: CancelOrderParams): Promise<CancelOrderResponse> {
  const adminApiUrl = process.env.EXPO_PUBLIC_ADMIN_API_URL;

  if (!adminApiUrl) {
    throw new Error('EXPO_PUBLIC_ADMIN_API_URL is not configured.');
  }

  const token = await getToken();

  if (!token) {
    throw new Error('No Clerk session token found.');
  }

  const response = await fetch(`${adminApiUrl}/api/mobile/cancel-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });

  let result: CancelOrderResponse | null = null;

  try {
    result = (await response.json()) as CancelOrderResponse;
  } catch {
    result = null;
  }

  if (!response.ok) {
    const message = normalizeServerMessage(result);
    throw new Error(message);
  }

  return result ?? { success: true, message: 'Order cancelled successfully.' };
}