import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useUser } from "@clerk/clerk-expo";

import { supabase } from "../src/lib/supabase";
import { COLORS } from "../src/constants/colors";
import AnimatedScreen from "../src/components/AnimatedScreen";
import AnimatedCard from "../src/components/AnimatedCard";
import {
  fetchActiveDeliveryZones,
  type DeliveryZone,
} from "../src/lib/delivery-zones";
import { saveDeliveryAddress } from "../src/lib/api/save-delivery-address";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  delivery_zone: string | null;
  street_address: string | null;
  landmark: string | null;
};

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");

  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  const selectedZone = useMemo(() => {
    return deliveryZones.find((zone) => zone.id === selectedZoneId) ?? null;
  }, [deliveryZones, selectedZoneId]);

  useEffect(() => {
    const loadPageData = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        const [zones, profileResult] = await Promise.all([
          fetchActiveDeliveryZones(),
          supabase
            .from("profiles")
            .select(
              "full_name, phone, delivery_zone, street_address, landmark"
            )
            .eq("clerk_user_id", user.id)
            .maybeSingle(),
        ]);

        setDeliveryZones(zones);

        if (profileResult.error) {
          throw new Error(profileResult.error.message);
        }

        const profile = (profileResult.data as ProfileRow | null) ?? null;

        setPhone(profile?.phone ?? "");
        setStreetAddress(profile?.street_address ?? "");
        setLandmark(profile?.landmark ?? "");

        if (zones.length > 0) {
          if (profile?.delivery_zone) {
            const matchedZone = zones.find(
              (zone) =>
                zone.name.toLowerCase() === profile.delivery_zone?.toLowerCase()
            );

            if (matchedZone) {
              setSelectedZoneId(matchedZone.id);
            } else {
              setSelectedZoneId(zones[0].id);
            }
          } else {
            setSelectedZoneId(zones[0].id);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load delivery address details.";
        Alert.alert("Error", message);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [isLoaded, isSignedIn, user]);

  const handleSave = async () => {
    if (!isSignedIn || !user) {
      Alert.alert("Sign in required", "Please sign in to save your address.");
      return;
    }

    if (!selectedZone) {
      Alert.alert("Select location", "Please choose a delivery zone.");
      return;
    }

    if (!streetAddress.trim()) {
      Alert.alert("Missing address", "Please enter your street address.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Missing phone", "Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);

      await saveDeliveryAddress({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        fullName:
          [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
          user.username ||
          null,
        phone: phone.trim(),
        deliveryZone: selectedZone.name,
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim() || null,
      });

      Alert.alert("Saved", "Your delivery address has been updated.");
      router.back();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save delivery address.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoaded) {
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
            Loading address...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
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
                  fontSize: 26,
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                }}
              >
                Sign in required
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 22,
                  marginBottom: 18,
                }}
              >
                You need to sign in before managing your delivery address.
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
              Delivery Address
            </Text>

            <View style={{ width: 42 }} />
          </MotiView>

          <AnimatedCard
            delay={80}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 18,
              marginBottom: 16,
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
              Saved Delivery Details
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 22,
              }}
            >
              Choose your delivery zone and save your street address for faster
              checkout.
            </Text>
          </AnimatedCard>

          <AnimatedCard
            delay={130}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 12,
              }}
            >
              Delivery Zone
            </Text>

            {deliveryZones.length === 0 ? (
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                No delivery zones are available at the moment.
              </Text>
            ) : (
              <View style={{ gap: 10 }}>
                {deliveryZones.map((zone) => {
                  const active = selectedZoneId === zone.id;

                  return (
                    <Pressable
                      key={zone.id}
                      onPress={() => setSelectedZoneId(zone.id)}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: active ? COLORS.primary : COLORS.border,
                        backgroundColor: active
                          ? COLORS.accent
                          : COLORS.background,
                        padding: 14,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "700",
                              color: COLORS.textPrimary,
                              marginBottom: 4,
                            }}
                          >
                            {zone.name}
                          </Text>

                          <Text
                            style={{
                              fontSize: 13,
                              color: COLORS.textSecondary,
                            }}
                          >
                            Delivery fee set by admin
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: COLORS.primaryDark,
                          }}
                        >
                          ₦{Number(zone.fee).toLocaleString()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </AnimatedCard>

          <AnimatedCard
            delay={180}
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
                fontSize: 16,
                fontWeight: "700",
                color: COLORS.textPrimary,
                marginBottom: 12,
              }}
            >
              Address Details
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                marginBottom: 12,
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            />

            <TextInput
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Street address"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                minHeight: 100,
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
                textAlignVertical: "top",
                marginBottom: 12,
              }}
            />

            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Nearest landmark (optional)"
              placeholderTextColor={COLORS.textSecondary}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            />
          </AnimatedCard>

          <MotiView
            from={{ opacity: 0, translateY: 18, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "timing", duration: 380, delay: 240 }}
          >
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? COLORS.border : "#000000",
                borderRadius: 16,
                paddingVertical: 17,
                alignItems: "center",
              }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Save Address
                </Text>
              )}
            </Pressable>
          </MotiView>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}