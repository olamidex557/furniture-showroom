const API_BASE_URL = "http://172.20.10.5:3000";

export async function initializePayment(orderId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to initialize payment.");
  }

  return result.data as {
    orderId: string;
    reference: string;
    authorization_url: string;
    access_code: string;
  };
}
