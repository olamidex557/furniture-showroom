import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { subscribeToNotifications } from "../lib/in-app-notifications";
import { COLORS } from "../constants/colors";

type NotificationMessage = {
  title: string;
  body: string;
};

export default function NotificationBanner() {
  const [message, setMessage] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((msg) => {
      setMessage(msg);

      setTimeout(() => {
        setMessage(null);
      }, 3200);
    });

    return unsubscribe;
  }, []);

  return (
    <AnimatePresence>
      {message ? (
        <MotiView
          key={`${message.title}-${message.body}`}
          from={{ opacity: 0, translateY: -50, scale: 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -30, scale: 0.98 }}
          transition={{
            type: "timing",
            duration: 320,
          }}
          style={{
            position: "absolute",
            top: 58,
            left: 16,
            right: 16,
            zIndex: 9999,
            backgroundColor: "#111827",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              {message.title}
            </Text>

            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {message.body}
            </Text>
          </View>
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
}