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
import { router } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#F6F6F3",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  primary: "#355C5A",
  primaryLight: "#E8EFEE",
  danger: "#B42318",
  black: "#111111",
};

function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Pressable>
  );
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      setSubmitting(true);
      setErrorMessage("");

      const result = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setErrorMessage("Sign in could not be completed.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Unable to sign in.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
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
                top: -20,
                left: 6,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: COLORS.black,
              }}
            />

            <View
              style={{
                position: "absolute",
                top: 28,
                width: 250,
                height: 120,
                borderRadius: 100,
                backgroundColor: COLORS.primary,
                opacity: 0.18,
              }}
            />

            <View
              style={{
                width: "100%",
                maxWidth: 380,
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
                  Sign In
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.subtext,
                    textAlign: "center",
                    lineHeight: 21,
                  }}
                >
                  Hi! Welcome back, you’ve been missed
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

              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: COLORS.text,
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>

                <TextInput
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="example@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    height: 54,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    color: COLORS.text,
                    backgroundColor: "#FAFAFA",
                  }}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: COLORS.text,
                    marginBottom: 8,
                  }}
                >
                  Password
                </Text>

                <View
                  style={{
                    height: 54,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    backgroundColor: "#FAFAFA",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    placeholder="••••••••••"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      flex: 1,
                      color: COLORS.text,
                    }}
                  />

                  <Pressable onPress={() => setSecureText((prev) => !prev)}>
                    <Ionicons
                      name={secureText ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.subtext}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/forgot-password" as any)}
                style={{ alignSelf: "flex-end", marginBottom: 18 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.primary,
                    fontWeight: "600",
                  }}
                >
                  Forgot Password?
                </Text>
              </Pressable>

              <Pressable
                onPress={onSignInPress}
                disabled={submitting || !isLoaded}
                style={{
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 22,
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
                    Sign In
                  </Text>
                )}
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}
                />
                <Text
                  style={{
                    marginHorizontal: 10,
                    color: COLORS.subtext,
                    fontSize: 13,
                  }}
                >
                  Or sign in with
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <SocialButton
                  label="Apple"
                  icon={
                    <Ionicons name="logo-apple" size={22} color={COLORS.black} />
                  }
                />
                <SocialButton
                  label="Google"
                  icon={<Text style={{ fontSize: 20, fontWeight: "700" }}>G</Text>}
                />
                <SocialButton
                  label="Facebook"
                  icon={
                    <Ionicons
                      name="logo-facebook"
                      size={20}
                      color="#1877F2"
                    />
                  }
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: COLORS.subtext, fontSize: 14 }}>
                  Don’t have an account?{" "}
                </Text>

                <Pressable onPress={() => router.push("/sign-up" as any)}>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}