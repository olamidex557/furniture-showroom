import { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { COLORS } from "../src/constants/colors";

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!isLoaded) return;

    try {
      setError("");

      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed");
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    try {
      setError("");

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/" as any);
      } else {
        setError("Verification not complete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 20,
            color: COLORS.textPrimary,
          }}
        >
          Create Account
        </Text>

        {!!error && (
          <Text style={{ color: "#B91C1C", marginBottom: 10 }}>{error}</Text>
        )}

        {!pendingVerification ? (
          <>
            <TextInput
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.surface,
                color: COLORS.textPrimary,
                padding: 14,
                borderRadius: 12,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.surface,
                color: COLORS.textPrimary,
                padding: 14,
                borderRadius: 12,
                marginBottom: 16,
              }}
            />

            <Pressable
              onPress={handleSignUp}
              style={{
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Create Account
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginBottom: 12,
                lineHeight: 22,
              }}
            >
              We sent a verification code to your email. Enter it below to
              complete signup.
            </Text>

            <TextInput
              placeholder="Verification code"
              placeholderTextColor={COLORS.textSecondary}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.surface,
                color: COLORS.textPrimary,
                padding: 14,
                borderRadius: 12,
                marginBottom: 16,
              }}
            />

            <Pressable
              onPress={handleVerify}
              style={{
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Verify Email
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => router.push("/sign-in" as any)}
          style={{ marginTop: 16 }}
        >
          <Text style={{ textAlign: "center", color: COLORS.textPrimary }}>
            Already have an account? Sign In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}