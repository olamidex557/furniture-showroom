export type DeleteAccountParams = {
  getToken: () => Promise<string | null>;
};

type DeleteAccountResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  reason?: string | null;
};

export async function deleteAccountViaAdminApi({
  getToken,
}: DeleteAccountParams): Promise<DeleteAccountResponse> {
  const adminApiUrl = process.env.EXPO_PUBLIC_ADMIN_API_URL;

  if (!adminApiUrl) {
    throw new Error("EXPO_PUBLIC_ADMIN_API_URL is not configured.");
  }

  const token = await getToken();

  if (!token) {
    throw new Error("No Clerk session token found.");
  }

  const response = await fetch(`${adminApiUrl}/api/mobile/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let result: DeleteAccountResponse | null = null;

  try {
    result = (await response.json()) as DeleteAccountResponse;
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.error ||
        result?.message ||
        result?.reason ||
        "Failed to delete account."
    );
  }

  return result ?? {
    success: true,
    message: "Account deleted successfully.",
  };
}