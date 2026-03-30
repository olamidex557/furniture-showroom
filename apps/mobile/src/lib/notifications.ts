import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPrefs = {
  orderUpdates: boolean;
  deliveryAlerts: boolean;
  promoOffers: boolean;
  newArrivals: boolean;
  soundEnabled: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  orderUpdates: true,
  deliveryAlerts: true,
  promoOffers: false,
  newArrivals: false,
  soundEnabled: true,
};

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    throw new Error("Push notifications require a physical device.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#355C5A",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Expo projectId not found.");
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  return token;
}

export async function getNotificationPermissionsStatus() {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}