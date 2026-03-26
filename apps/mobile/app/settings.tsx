import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { COLORS } from "../src/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Guest User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "No email found";

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/" as any);
    } catch (error) {
      Alert.alert("Logout failed", "Something went wrong while signing out.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
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
            <Text style={{ fontSize: 20, color: COLORS.textPrimary }}>‹</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.textPrimary,
            }}
          >
            Settings
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
              fontSize: 13,
              color: COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            ACCOUNT
          </Text>

          {isLoaded && isSignedIn ? (
            <>
              <Text
                style={{
                  fontSize: 20,
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
                }}
              >
                {email}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 4,
                }}
              >
                Guest User
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  marginBottom: 14,
                }}
              >
                Sign in to manage your account
              </Text>

              <Pressable
                onPress={() => router.push("/sign-in" as any)}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: COLORS.white, fontWeight: "700" }}>
                  Sign In
                </Text>
              </Pressable>
            </>
          )}
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
          <MenuItem
            icon="person-circle-outline"
            label="Profile"
            value={isSignedIn ? "Connected" : "Guest"}
            onPress={() => router.push("/(tabs)/profile-tab" as any)}
          />

          <Divider />

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

          <Divider />

          <MenuItem
            icon="card-outline"
            label="Payment Methods"
            value="Coming soon"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Payment settings will be added later."
              )
            }
          />

          <Divider />

          <MenuItem
            icon="location-outline"
            label="Delivery Address"
            value="Manage"
            onPress={() => router.push("/delivery-address" as any)}
          />

          <Divider />

          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            value="Coming soon"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Notification settings will be added later."
              )
            }
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
              marginBottom: 8,
            }}
          >
            APP INFO
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: COLORS.textPrimary,
              marginBottom: 6,
            }}
          >
            Furniture Store
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              lineHeight: 22,
            }}
          >
            Manage your account, orders, and shopping preferences from one
            place.
          </Text>
        </View>

        {isSignedIn ? (
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
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
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

      {value ? (
        <Text
          style={{
            marginRight: 8,
            fontSize: 13,
            color: COLORS.textSecondary,
          }}
        >
          {value}
        </Text>
      ) : null}

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