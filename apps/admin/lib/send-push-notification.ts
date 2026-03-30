export async function sendPushNotification({
  expoPushToken,
  title,
  body,
  data,
}: {
  expoPushToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "object"
        ? JSON.stringify(result)
        : "Failed to send push notification."
    );
  }

  return result;
}