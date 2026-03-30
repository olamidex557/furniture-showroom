import { sendPushNotification } from "../../../lib/send-push-notification";
import { supabaseAdmin } from "../../../lib/supabase-admin";

async function sendTestNotification(formData: FormData) {
  "use server";

  const clerkUserId = String(formData.get("clerkUserId") || "").trim();

  if (!clerkUserId) {
    throw new Error("Missing Clerk user ID.");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("expo_push_token, notifications_enabled")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    throw new Error("Profile not found for that Clerk user ID.");
  }

  if (!profile.notifications_enabled) {
    throw new Error("Notifications are not enabled for this user.");
  }

  if (!profile.expo_push_token) {
    throw new Error("No Expo push token found for this user.");
  }

  await sendPushNotification({
    expoPushToken: profile.expo_push_token,
    title: "Test Notification",
    body: "Your push notifications are working correctly.",
    data: {
      screen: "notifications",
      test: true,
    },
  });
}

export default function TestNotificationPage() {
  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-card p-6 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-stone-500">
            Furniture Admin
          </p>

          <h1 className="admin-title">Send Test Notification</h1>

          <p className="admin-subtitle mt-3">
            Paste a customer Clerk user ID below and send a test push
            notification to their device.
          </p>

          <form action={sendTestNotification} className="mt-6 space-y-4">
            <div>
              <label className="admin-label mb-2 block">Clerk User ID</label>
              <input
                name="clerkUserId"
                placeholder="user_2abc123xyz..."
                className="admin-input"
                required
              />
            </div>

            <button type="submit" className="admin-btn-primary">
              Send Test Notification
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}