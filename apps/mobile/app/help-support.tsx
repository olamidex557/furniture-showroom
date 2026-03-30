import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../src/constants/colors";

export default function HelpSupportScreen() {
  const router = useRouter();

  const openEmailSupport = async () => {
    const email = "support@ivorywood.com";
    const subject = "Help & Support Request";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Email unavailable", "No email app was found on this device.");
    }
  };

  const openWhatsAppSupport = async () => {
    const phone = "2348000000000";
    const message = "Hello, I need help with my order.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Unavailable", "WhatsApp is not available on this device.");
    }
  };

  const makePhoneCall = async () => {
    const phone = "tel:+2348000000000";
    const supported = await Linking.canOpenURL(phone);

    if (supported) {
      await Linking.openURL(phone);
    } else {
      Alert.alert("Unavailable", "Phone calling is not available on this device.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <View
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
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.textPrimary,
            }}
          >
            Help & Support
          </Text>

          <View style={{ width: 42 }} />
        </View>

        <View
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
            We’re here to help
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: COLORS.textSecondary,
            }}
          >
            Need help with an order, payment issue, delivery question, or anything
            else? Reach out through any of the options below.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          <SupportItem
            icon="mail-outline"
            title="Email Support"
            subtitle="Send us an email and we’ll respond as soon as possible"
            onPress={openEmailSupport}
          />

          <Divider />

          <SupportItem
            icon="logo-whatsapp"
            title="WhatsApp Chat"
            subtitle="Chat with support directly on WhatsApp"
            onPress={openWhatsAppSupport}
          />

          <Divider />

          <SupportItem
            icon="call-outline"
            title="Call Support"
            subtitle="Speak with our support team"
            onPress={makePhoneCall}
          />
        </View>

        <View
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
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 10,
            }}
          >
            FAQ
          </Text>

          <FaqItem
            question="How do I track my order?"
            answer="Go to My Orders in your profile to view the latest status of each order."
          />

          <FaqItem
            question="How do I change my delivery address?"
            answer="Open Delivery Address from Settings and update your saved details."
          />

          <FaqItem
            question="What happens if an item is out of stock?"
            answer="Out-of-stock products remain visible in the app but cannot be ordered until the admin updates stock."
          />

          <FaqItem
            question="How do refunds or cancellations work?"
            answer="Please contact support directly for help with cancellations, delivery issues, or refund requests."
          />
        </View>

        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: 18,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            SUPPORT HOURS
          </Text>

          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: COLORS.textPrimary,
              marginBottom: 6,
            }}
          >
            Monday - Saturday
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: COLORS.textSecondary,
            }}
          >
            9:00 AM - 6:00 PM
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SupportItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: COLORS.accent,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={COLORS.primaryDark} />
      </View>

      <View style={{ flex: 1 }}>
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

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: COLORS.textPrimary,
          marginBottom: 6,
        }}
      >
        {question}
      </Text>

      <Text
        style={{
          fontSize: 13,
          lineHeight: 21,
          color: COLORS.textSecondary,
        }}
      >
        {answer}
      </Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 70,
      }}
    />
  );
}