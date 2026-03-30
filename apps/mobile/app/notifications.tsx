import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useUser } from "@clerk/clerk-expo";
import { COLORS } from "../src/constants/colors";
import { supabase } from "../src/lib/supabase";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPrefs,
  getNotificationPermissionsStatus,
  registerForPushNotificationsAsync,
} from "../src/lib/notifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS
  );

  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return;

      try {
        setLoading(true);

        if (!isSignedIn || !user) {
          setLoading(false);
          return;
        }

        const permissionStatus = await getNotificationPermissionsStatus();

        const { data, error } = await supabase
          .from("profiles")
          .select("notifications_enabled, notification_settings, expo_push_token")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        setPushEnabled(
          Boolean(data?.notifications_enabled) && permissionStatus === "granted"
        );

        if (data?.notification_settings) {
          setPrefs({
            ...DEFAULT_NOTIFICATION_PREFS,
            ...(data.notification_settings as Partial<NotificationPrefs>),
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load notifications.";
        Alert.alert("Error", message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, isSignedIn, user]);

  const persistSettings = async (
    nextPushEnabled: boolean,
    nextPrefs: NotificationPrefs,
    expoPushToken?: string | null
  ) => {
    if (!isSignedIn || !user) {
      Alert.alert("Sign in required", "Please sign in to manage notifications.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        notifications_enabled: nextPushEnabled,
        notification_settings: nextPrefs,
        expo_push_token: expoPushToken ?? null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "clerk_user_id",
      });

      if (error) {
        throw new Error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePushEnabled = async (value: boolean) => {
    if (!isSignedIn || !user) {
      Alert.alert("Sign in required", "Please sign in to enable notifications.");
      return;
    }

    try {
      if (value) {
        const token = await registerForPushNotificationsAsync();

        if (!token) {
          Alert.alert(
            "Permission needed",
            "Notifications permission was not granted."
          );
          return;
        }

        setPushEnabled(true);
        await persistSettings(true, prefs, token);

        Alert.alert("Enabled", "Push notifications are now enabled.");
      } else {
        setPushEnabled(false);
        await persistSettings(false, prefs, null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enable notifications.";
      Alert.alert("Error", message);
    }
  };

  const updatePref = async (
    key: keyof NotificationPrefs,
    value: boolean
  ) => {
    const nextPrefs = { ...prefs, [key]: value };
    setPrefs(nextPrefs);

    try {
      await persistSettings(pushEnabled, nextPrefs);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save settings.";
      Alert.alert("Error", message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: COLORS.textSecondary }}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={COLORS.textPrimary}
            />
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.textPrimary,
            }}
          >
            Notifications
          </Text>

          <View style={{ width: 42 }} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 360, delay: 60 }}
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: COLORS.textPrimary,
              marginBottom: 8,
            }}
          >
            Manage alerts
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: COLORS.textSecondary,
            }}
          >
            Turn on push notifications and choose what you want to receive.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 18 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 120 }}
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          <NotificationItem
            title="Enable Push Notifications"
            subtitle="Allow the app to send you real push alerts"
            value={pushEnabled}
            onValueChange={togglePushEnabled}
            disabled={saving}
            index={0}
          />

          <Divider />

          <NotificationItem
            title="Order Updates"
            subtitle="Get notified when your order status changes"
            value={prefs.orderUpdates}
            onValueChange={(v) => updatePref("orderUpdates", v)}
            disabled={!pushEnabled || saving}
            index={1}
          />

          <Divider />

          <NotificationItem
            title="Delivery Alerts"
            subtitle="Receive updates about delivery progress"
            value={prefs.deliveryAlerts}
            onValueChange={(v) => updatePref("deliveryAlerts", v)}
            disabled={!pushEnabled || saving}
            index={2}
          />

          <Divider />

          <NotificationItem
            title="Promotions & Offers"
            subtitle="Be the first to know about discounts and promos"
            value={prefs.promoOffers}
            onValueChange={(v) => updatePref("promoOffers", v)}
            disabled={!pushEnabled || saving}
            index={3}
          />

          <Divider />

          <NotificationItem
            title="New Arrivals"
            subtitle="Get alerts when new products are added"
            value={prefs.newArrivals}
            onValueChange={(v) => updatePref("newArrivals", v)}
            disabled={!pushEnabled || saving}
            index={4}
          />

          <Divider />

          <NotificationItem
            title="Notification Sound"
            subtitle="Play sound when a new notification arrives"
            value={prefs.soundEnabled}
            onValueChange={(v) => updatePref("soundEnabled", v)}
            disabled={!pushEnabled || saving}
            index={5}
          />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
  index,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: 12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 260,
        delay: index * 50,
      }}
      style={{
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: COLORS.textPrimary,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: COLORS.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <MotiView
        animate={{
          scale: value ? 1.04 : 1,
        }}
        transition={{
          type: "timing",
          duration: 140,
        }}
      >
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: "#D1D5DB", true: COLORS.primary }}
          thumbColor="#FFFFFF"
        />
      </MotiView>
    </MotiView>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 16,
      }}
    />
  );
}