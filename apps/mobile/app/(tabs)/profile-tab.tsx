import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { COLORS } from "../../src/constants/colors";

export default function ProfileTabScreen() {
    const router = useRouter();
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    const handleLogout = async () => {
        try {
            await signOut();
            router.replace("/" as any);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const displayName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.username ||
        "Guest User";

    const email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "No email found";

    if (!isLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: COLORS.textSecondary }}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!isSignedIn) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
                <View style={{ padding: 16, flex: 1, justifyContent: "center" }}>
                    <View
                        style={{
                            backgroundColor: COLORS.surface,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            padding: 24,
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                backgroundColor: COLORS.accent,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 14,
                            }}
                        >
                            <Text style={{ fontSize: 34 }}>👤</Text>
                        </View>

                        <Text
                            style={{
                                fontSize: 22,
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
                                textAlign: "center",
                                lineHeight: 22,
                                marginBottom: 20,
                            }}
                        >
                            Sign in to view your profile, manage orders, and access your account.
                        </Text>

                        <Pressable
                            onPress={() => router.push("/sign-in" as any)}
                            style={{
                                width: "100%",
                                backgroundColor: COLORS.primary,
                                paddingVertical: 16,
                                borderRadius: 16,
                                alignItems: "center",
                                marginBottom: 12,
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

                        <Pressable
                            onPress={() => router.push("/sign-up" as any)}
                            style={{
                                width: "100%",
                                backgroundColor: COLORS.surface,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                paddingVertical: 16,
                                borderRadius: 16,
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: COLORS.textPrimary,
                                    fontWeight: "700",
                                    fontSize: 16,
                                }}
                            >
                                Create Account
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View style={{ padding: 16 }}>
                <View
                    style={{
                        alignItems: "center",
                        marginBottom: 28,
                    }}
                >
                    {user?.imageUrl ? (
                        <Image
                            source={{ uri: user.imageUrl }}
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                marginBottom: 12,
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                backgroundColor: COLORS.accent,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ fontSize: 34 }}>👤</Text>
                        </View>
                    )}

                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: COLORS.textPrimary,
                        }}
                    >
                        {displayName}
                    </Text>

                    <Text
                        style={{
                            fontSize: 14,
                            color: COLORS.textSecondary,
                            marginTop: 4,
                        }}
                    >
                        {email}
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: COLORS.surface,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        overflow: "hidden",
                    }}
                >
                    <MenuItem
                        icon="cube"
                        label="My Orders"
                        onPress={() => router.push("/orders" as any)}
                    />

                    <Divider />

                    <MenuItem
                        icon="cart"
                        label="My Cart"
                        onPress={() => router.push("/cart" as any)}
                    />

                    <Divider />

                    <MenuItem
                        icon="settings"
                        label="Settings"
                        onPress={() => router.push("/settings" as any)}
                    />

                    <Divider />

                    <MenuItem
                        icon="help-circle"
                        label="Help & Support"
                        onPress={() => { }}
                    />
                </View>

                <Pressable
                    onPress={handleLogout}
                    style={{
                        marginTop: 24,
                        backgroundColor: "#FEE2E2",
                        paddingVertical: 16,
                        borderRadius: 16,
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
            </View>
        </SafeAreaView>
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