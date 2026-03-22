import { SafeAreaView, Text, View } from "react-native";

export default function ProfileTabScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F8" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Profile</Text>
        <Text style={{ marginTop: 8, color: "#6B7280" }}>
          Profile screen coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}