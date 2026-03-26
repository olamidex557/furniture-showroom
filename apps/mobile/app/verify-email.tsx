import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

const COLORS = {
  background: "#F7F7F5",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  primary: "#355C5A",
  danger: "#B42318",
  black: "#111111",
};

export default function VerifyEmailScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const params = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      setSubmitting(true);
      setErrorMessage("");

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        setErrorMessage("Verification could not be completed.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid verification code.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 28,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ position: "relative", alignItems: "center" }}>
            <View
              style={{
                position: "absolute",
                top: -18,
                right: 14,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: COLORS.black,
              }}
            />

            <View
              style={{
                position: "absolute",
                top: 30,
                width: 230,
                height: 110,
                borderRadius: 100,
                backgroundColor: COLORS.primary,
                opacity: 0.18,
              }}
            />

            <View
              style={{
                width: "100%",
                maxWidth: 360,
                backgroundColor: COLORS.card,
                borderRadius: 30,
                paddingHorizontal: 22,
                paddingTop: 28,
                paddingBottom: 26,
                borderWidth: 1,
                borderColor: "#F0F0F0",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 2,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 28 }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "700",
                    color: COLORS.text,
                    marginBottom: 8,
                  }}
                >
                  Verify Code
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.subtext,
                    textAlign: "center",
                    lineHeight: 21,
                  }}
                >
                  Please enter the code sent to{" "}
                  <Text style={{ fontWeight: "700", color: COLORS.text }}>
                    {params.email || "your email"}
                  </Text>
                </Text>
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

              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="Enter code"
                placeholderTextColor="#9CA3AF"
                style={{
                  height: 58,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  color: COLORS.text,
                  backgroundColor: "#FAFAFA",
                  textAlign: "center",
                  fontSize: 22,
                  letterSpacing: 8,
                  marginBottom: 14,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: COLORS.subtext, fontSize: 13 }}>
                  Didn’t receive OTP?{" "}
                </Text>

                <Pressable onPress={onResendPress}>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    Resend Code
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={onVerifyPress}
                disabled={submitting || !isLoaded}
                style={{
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: submitting || !isLoaded ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Verify
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}