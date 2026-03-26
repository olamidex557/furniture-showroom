import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../src/lib/supabase";

const COLORS = {
  background: "#F7F7F5",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  primary: "#355C5A",
  danger: "#B42318",
};

export default function DeliveryAddressScreen() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, delivery_address")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        const fallbackName =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "";

        setFullName(data?.full_name ?? fallbackName);
        setPhone(data?.phone ?? "");
        setAddress(data?.delivery_address ?? "");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load delivery address.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  const saveAddress = async () => {
    if (!isSignedIn || !user) {
      Alert.alert("Sign in required", "Please sign in to save your address.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please enter your delivery address.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        full_name: fullName.trim(),
        phone: phone.trim(),
        delivery_address: address.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "clerk_user_id",
      });

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert("Saved", "Your delivery address has been updated.");
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save address.";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.subtext }}>
            Loading address...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </Pressable>

          <View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: COLORS.text,
              }}
            >
              Delivery Address
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 13,
                color: COLORS.subtext,
              }}
            >
              Save your delivery details for faster checkout
            </Text>
          </View>
        </View>

        {!!errorMessage && (
          <View
            style={{
              backgroundColor: "#FEF3F2",
              borderWidth: 1,
              borderColor: "#FDA29B",
              borderRadius: 14,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: COLORS.danger,
                fontSize: 14,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            Full Name
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              color: COLORS.text,
              backgroundColor: "#FAFAFA",
              marginBottom: 14,
            }}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="08012345678"
            placeholderTextColor="#9CA3AF"
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              color: COLORS.text,
              backgroundColor: "#FAFAFA",
              marginBottom: 14,
            }}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            Delivery Address
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            placeholder="Enter your full delivery address"
            placeholderTextColor="#9CA3AF"
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: COLORS.text,
              backgroundColor: "#FAFAFA",
              textAlignVertical: "top",
              marginBottom: 18,
            }}
          />

          <Pressable
            onPress={saveAddress}
            disabled={saving}
            style={{
              height: 54,
              borderRadius: 16,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: saving ? 0.7 : 1,
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}