import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS } from "../../src/constants/colors";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 18,
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title ?? route.name;

        const isFocused = state.index === index;

        let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";

        if (route.name === "index") iconName = "home-outline";
        if (route.name === "cart-tab") iconName = "cart-outline";
        if (route.name === "orders-tab") iconName = "cube-outline";
        if (route.name === "profile-tab") iconName = "person-outline";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <MotiView
              animate={{
                scale: isFocused ? 1.08 : 1,
                translateY: isFocused ? -4 : 0,
              }}
              transition={{
                type: "spring",
                damping: 14,
                stiffness: 180,
              }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 16,
                backgroundColor: isFocused ? COLORS.accent : "transparent",
                minWidth: 68,
              }}
            >
              <MotiView
                animate={{
                  rotate: isFocused ? "8deg" : "0deg",
                }}
                transition={{
                  type: "timing",
                  duration: 180,
                }}
              >
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isFocused ? COLORS.primaryDark : COLORS.textSecondary}
                />
              </MotiView>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: isFocused ? "700" : "500",
                  color: isFocused ? COLORS.primaryDark : COLORS.textSecondary,
                }}
              >
                {String(label)}
              </Text>
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="cart-tab"
        options={{
          title: "Cart",
        }}
      />

      <Tabs.Screen
        name="orders-tab"
        options={{
          title: "Orders",
        }}
      />

      <Tabs.Screen
        name="profile-tab"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}