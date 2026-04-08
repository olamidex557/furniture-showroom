import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { MotiView } from "moti";

import { COLORS } from "../src/constants/colors";
import { deleteAccountViaAdminApi } from "../src/lib/api/delete-account";

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const clerk = useClerk();

  const [deleting, setDeleting] = useState(false);
  const [playThrow, setPlayThrow] = useState(false);

  const displayName = useMemo(() => {
    return (
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Customer"
    );
  }, [user]);

  const email = useMemo(() => {
    return (
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "No email"
    );
  }, [user]);

  const resetAnimation = () => {
    setPlayThrow(false);
  };

  const handleConfirmedDelete = async () => {
    try {
      setDeleting(true);
      setPlayThrow(true);

      await wait(950);

      await deleteAccountViaAdminApi({ getToken });

      try {
        await clerk.signOut();
      } catch (signOutError) {
        console.log("Sign out after delete failed:", signOutError);
      }

      Alert.alert("Deleted", "Your account has been deleted.", [
        {
          text: "OK",
          onPress: () => router.replace("/sign-in" as any),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account.";

      resetAnimation();
      Alert.alert("Delete account", message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!isSignedIn || !user) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }

    Alert.alert(
      "Delete account",
      "This permanently deletes your account and removes your saved profile data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: resetAnimation,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleConfirmedDelete,
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6F8" }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6F8" }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}>
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
            disabled={deleting}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E6E7EB",
            }}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </Pressable>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.textPrimary,
            }}
          >
            Delete Account
          </Text>

          <View style={{ width: 42 }} />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0, translateY: 26 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#E7E7EC",
              padding: 22,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 6,
            }}
          >
            <View
              style={{
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: "#0F172A",
                  marginBottom: 10,
                }}
              >
                Delete Account
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 24,
                  color: "#6B7280",
                }}
              >
                This removes your saved profile data and signs you out of the app.
                Your past order history can stay anonymized for admin records.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#FFF5F5",
                borderWidth: 1,
                borderColor: "#F8CACA",
                borderRadius: 20,
                padding: 16,
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 0.5,
                  color: "#B91C1C",
                  marginBottom: 8,
                }}
              >
                ACCOUNT TO BE DELETED
              </Text>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                {displayName}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                {email}
              </Text>
            </View>

            <View
              style={{
                height: 240,
                marginBottom: 22,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  bottom: 20,
                  width: 180,
                  height: 28,
                  borderRadius: 999,
                  backgroundColor: "rgba(15, 23, 42, 0.08)",
                  transform: [{ scaleX: playThrow ? 0.8 : 1 }],
                }}
              />

              <MotiView
                animate={{
                  translateY: playThrow ? 26 : 0,
                  scale: playThrow ? 1.06 : 1,
                }}
                transition={{
                  type: "timing",
                  duration: 350,
                }}
                style={{
                  position: "absolute",
                  bottom: 42,
                  alignItems: "center",
                }}
              >
                <MotiView
                  animate={{
                    rotateZ: playThrow ? "-22deg" : "0deg",
                    translateY: playThrow ? -14 : 0,
                    translateX: playThrow ? 8 : 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 220,
                  }}
                  style={{
                    width: 96,
                    height: 18,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    backgroundColor: "#9CA3AF",
                    marginBottom: -4,
                  }}
                />

                <MotiView
                  animate={{
                    scale: playThrow ? 1.04 : 1,
                  }}
                  transition={{
                    type: "timing",
                    duration: 250,
                  }}
                  style={{
                    width: 112,
                    height: 116,
                    borderBottomLeftRadius: 22,
                    borderBottomRightRadius: 22,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    backgroundColor: "#D1D5DB",
                    borderWidth: 1,
                    borderColor: "#9CA3AF",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 16,
                      flexDirection: "row",
                      gap: 10,
                    }}
                  >
                    <View style={trashLine} />
                    <View style={trashLine} />
                    <View style={trashLine} />
                  </View>

                  <Ionicons name="trash-outline" size={34} color="#374151" />
                </MotiView>
              </MotiView>

              <MotiView
                from={{
                  opacity: 1,
                  scale: 1,
                  translateY: 0,
                  translateX: 0,
                  rotateZ: "0deg",
                  rotateX: "0deg",
                }}
                animate={{
                  opacity: playThrow ? 0 : 1,
                  scale: playThrow ? 0.38 : 1,
                  translateY: playThrow ? 120 : 0,
                  translateX: playThrow ? 42 : 0,
                  rotateZ: playThrow ? "28deg" : "0deg",
                  rotateX: playThrow ? "70deg" : "0deg",
                }}
                transition={{
                  type: "timing",
                  duration: 820,
                }}
                style={{
                  width: 126,
                  height: 156,
                  borderRadius: 20,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 18,
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 5,
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <View
                    style={{
                      width: 44,
                      height: 12,
                      borderRadius: 999,
                      backgroundColor: "#FECACA",
                      marginBottom: 12,
                    }}
                  />

                  <View style={paperLine} />
                  <View style={paperLine} />
                  <View style={[paperLine, { width: "70%" }]} />
                </View>

                <View
                  style={{
                    alignSelf: "flex-end",
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: "#FEE2E2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="warning-outline" size={18} color="#B91C1C" />
                </View>
              </MotiView>
            </View>

            <View
              style={{
                backgroundColor: "#FFF7ED",
                borderWidth: 1,
                borderColor: "#FED7AA",
                borderRadius: 18,
                padding: 14,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#9A3412",
                  fontSize: 13,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                This action is permanent. Make sure you really want to remove this account before continuing.
              </Text>
            </View>

            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: deleting ? "#FCA5A5" : "#C81E1E",
                borderRadius: 20,
                paddingVertical: 18,
                alignItems: "center",
                marginBottom: 12,
                shadowColor: "#C81E1E",
                shadowOpacity: deleting ? 0 : 0.22,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
              }}
            >
              {deleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  Delete My Account
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              disabled={deleting}
              style={{
                borderRadius: 20,
                paddingVertical: 18,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "800",
                  fontSize: 18,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </MotiView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const paperLine = {
  width: "100%" as const,
  height: 10,
  borderRadius: 999,
  backgroundColor: "#E5E7EB",
  marginBottom: 8,
};

const trashLine = {
  width: 8,
  height: 54,
  borderRadius: 999,
  backgroundColor: "#9CA3AF",
};