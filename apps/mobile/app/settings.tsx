import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { supabase } from "../src/lib/supabase";
import { COLORS } from "../src/constants/colors";

type Profile = {
  full_name: string | null;
  phone: string | null;
  delivery_zone: string | null;
  street_address: string | null;
  landmark: string | null;
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Guest User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "No email";

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name, phone, delivery_zone, street_address, landmark"
          )
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        setProfile((data as Profile | null) ?? null);
      } catch (error) {
        console.log("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isSignedIn, user]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/" as any);
    } catch {
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  const addressPreview = profile?.delivery_zone
    ? `${profile.delivery_zone} • ${profile.street_address ?? ""}${
        profile?.landmark ? ` • ${profile.landmark}` : ""
      }`
    : "Not set";

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.textPrimary }}>
            Settings
          </Text>

          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        <View style={card}>
          <Text style={label}>ACCOUNT</Text>

          <Text style={title}>{displayName}</Text>
          <Text style={sub}>{email}</Text>
        </View>

        <View style={card}>
          <MenuItem
            icon="location-outline"
            label="Delivery Address"
            value={addressPreview}
            onPress={() => router.push("/delivery-address" as any)}
          />

          <Divider />

          <MenuItem
            icon="call-outline"
            label="Phone"
            value={profile?.phone ?? "Not set"}
            onPress={() => router.push("/delivery-address" as any)}
          />
        </View>

        <View style={card}>
          <MenuItem
            icon="cube-outline"
            label="My Orders"
            onPress={() => router.push("/orders" as any)}
          />

          <Divider />

          <MenuItem
            icon="cart-outline"
            label="My Cart"
            onPress={() => router.push("/cart" as any)}
          />
        </View>

        {isSignedIn ? (
          <Pressable onPress={handleLogout} style={logoutBtn}>
            <Text style={{ color: "#B91C1C", fontWeight: "700" }}>
              Logout
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const card = {
  backgroundColor: COLORS.surface,
  padding: 16,
  borderRadius: 20,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: COLORS.border,
} as const;

const label = {
  fontSize: 12,
  color: COLORS.textSecondary,
  marginBottom: 8,
} as const;

const title = {
  fontSize: 18,
  fontWeight: "700",
  color: COLORS.textPrimary,
} as const;

const sub = {
  fontSize: 14,
  color: COLORS.textSecondary,
} as const;

const logoutBtn = {
  backgroundColor: "#FEE2E2",
  padding: 16,
  borderRadius: 16,
  alignItems: "center",
  marginTop: 10,
} as const;

function MenuItem({ icon, label, value, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <Ionicons name={icon} size={20} color={COLORS.textPrimary} style={{ marginRight: 12 }} />

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", color: COLORS.textPrimary }}>
          {label}
        </Text>

        {value ? (
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {value}
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </Pressable>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
      }}
    />
  );
}