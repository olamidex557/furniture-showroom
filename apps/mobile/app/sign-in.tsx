import { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { COLORS } from "../src/constants/colors";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!isLoaded) return;

    try {
      setError("");

      const result = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: result.createdSessionId });
      router.replace("/" as any);
    } catch (err: any) {
      const clerkMessage = err.errors?.[0]?.message || "Sign in failed";

      if (clerkMessage.toLowerCase().includes("couldn't find your account")) {
        setError("No account found for this email. Please create an account first.");
      } else {
        setError(clerkMessage);
      }
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
          Sign In
        </Text>

        {!!error && (
          <Text style={{ color: "#B91C1C", marginBottom: 10 }}>{error}</Text>
        )}

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
          onPress={handleSignIn}
          style={{
            backgroundColor: COLORS.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            Sign In
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/sign-up" as any)}
          style={{ marginTop: 16 }}
        >
          <Text style={{ textAlign: "center", color: COLORS.textPrimary }}>
            Don’t have an account? Sign Up
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}