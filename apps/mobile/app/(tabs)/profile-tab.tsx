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
import { MotiView } from "moti";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { supabase } from "../../src/lib/supabase";
import { COLORS } from "../../src/constants/colors";
import AnimatedScreen from "../../src/components/AnimatedScreen";
import AnimatedCard from "../../src/components/AnimatedCard";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  delivery_address: string | null;
};

export default function ProfileTabScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        if (isMounted) {
          setProfile(null);
          setLoadingProfile(false);
        }
        return;
      }

      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Profile request timed out.")), 8000)
        );

        const request = supabase
          .from("profiles")
          .select("full_name, phone, delivery_address")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        const result = (await Promise.race([request, timeout])) as {
          data: ProfileRow | null;
          error: { message: string } | null;
        };

        if (!isMounted) return;

        if (result.error) {
          console.log("Profile load error:", result.error.message);
          setProfile(null);
        } else {
          setProfile(result.data ?? null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.log("Profile load failed:", error);
        setProfile(null);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user]);

  const displayName =
    profile?.full_name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Guest User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "No email found";

  const phone = profile?.phone || "No phone saved";
  const address = profile?.delivery_address || "No delivery address saved";

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/" as any);
    } catch (error) {
      Alert.alert("Logout failed", "Something went wrong while signing out.");
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text
            style={{
              marginTop: 12,
              color: COLORS.textSecondary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <AnimatedScreen>
          <View
            style={{
              flex: 1,
              padding: 20,
              justifyContent: "center",
            }}
          >
            <AnimatedCard
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 22,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                }}
              >
                Welcome
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 22,
                  marginBottom: 18,
                }}
              >
                Sign in to view your profile, orders, saved address, and settings.
              </Text>

              <Pressable
                onPress={() => router.push("/sign-in" as any)}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 16,
                  paddingVertical: 15,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Sign In
                </Text>
              </Pressable>
            </AnimatedCard>
          </View>
        </AnimatedScreen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AnimatedScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
            style={{
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 6,
              }}
            >
              Profile
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
              }}
            >
              Manage your account and personal details
            </Text>
          </MotiView>

          <AnimatedCard
            delay={100}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 20,
              marginBottom: 18,
            }}
          >
            <MotiView
              from={{ scale: 0.92, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "timing", duration: 400 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: COLORS.accent,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="person"
                size={30}
                color={COLORS.primaryDark}
              />
            </MotiView>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              {displayName}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 16,
              }}
            >
              {email}
            </Text>

            <View style={{ gap: 12 }}>
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={loadingProfile ? "Loading..." : phone}
              />
              <InfoRow
                icon="location-outline"
                label="Address"
                value={loadingProfile ? "Loading..." : address}
              />
            </View>
          </AnimatedCard>

          <AnimatedCard
            delay={170}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <MenuItem
              icon="cube-outline"
              label="My Orders"
              onPress={() => router.push("/orders" as any)}
            />

            <Divider />

            <MenuItem
              icon="location-outline"
              label="Delivery Address"
              onPress={() => router.push("/delivery-address" as any)}
            />

            <Divider />

            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push("/notifications" as any)}
            />

            <Divider />

            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => router.push("/help-support" as any)}
            />

            <Divider />

            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push("/settings" as any)}
            />
          </AnimatedCard>

          <MotiView
            from={{ opacity: 0, translateY: 18, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 380, delay: 240 }}
          >
            <Pressable
              onPress={handleLogout}
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#B91C1C",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Logout
              </Text>
            </Pressable>
          </MotiView>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: COLORS.accent,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={18} color={COLORS.primaryDark} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.textSecondary,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: COLORS.textPrimary,
            lineHeight: 22,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
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
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: COLORS.accent,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={18} color={COLORS.primaryDark} />
      </View>

      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: COLORS.textPrimary,
        }}
      >
        {label}
      </Text>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 64,
      }}
    />
  );
}