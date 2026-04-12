const API_BASE_URL = "http://172.20.10.5:3000";

export async function getPaymentStatus(reference: string, token: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/status/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to load payment status.");
  }

  return result.data as {
    reference: string;
    paymentStatus: string;
    paidAt: string | null;
    order: {
      id: string;
      status: string;
      paymentStatus: string;
      paymentReference: string | null;
      paidAt: string | null;
      total: number;
      createdAt: string;
    } | null;
  };
}