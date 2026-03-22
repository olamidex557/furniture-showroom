import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useEffect, useRef, useState } from "react";

type TabMeta = {
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabMeta[] = [
  { route: "index", label: "Home", icon: "home" },
  { route: "orders-tab", label: "Orders", icon: "cube" },
  { route: "cart-tab", label: "Cart", icon: "cart" },
  { route: "profile-tab", label: "Profile", icon: "person" },
];

function TabBarContent({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.96)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0.96,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 54,
        paddingTop: 4,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 2,
        }}
      >
        <Ionicons
          name={icon}
          size={17}
          color={focused ? "#081421" : "#B8C0CC"}
        />
      </View>

      <Text
        style={{
          color: focused ? "#FFFFFF" : "#B8C0CC",
          fontSize: 10,
          fontWeight: focused ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  const horizontalInset = 10;
  const pillWidth =
    barWidth > 0 ? (barWidth - horizontalInset * 2) / TABS.length : 0;

  useEffect(() => {
    if (!pillWidth) return;

    Animated.spring(translateX, {
      toValue: horizontalInset + state.index * pillWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 95,
    }).start();
  }, [state.index, pillWidth, translateX]);

  const onLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 18,
        height: 70,
        borderRadius: 999,
        backgroundColor: "#081421",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
        paddingHorizontal: horizontalInset,
        paddingVertical: 8,
      }}
    >
      {pillWidth > 0 && (
        <Animated.View
          style={{
            position: "absolute",
            top: 8,
            left: 0,
            width: pillWidth,
            height: 38,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        />
      )}

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const meta = TABS.find((tab) => tab.route === route.name);
          if (!meta) return null;

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
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <TabBarContent
                focused={isFocused}
                icon={meta.icon}
                label={meta.label}
              />
            </Pressable>
          );
        })}
      </View>
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
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="orders-tab" options={{ title: "Orders" }} />
      <Tabs.Screen name="cart-tab" options={{ title: "Cart" }} />
      <Tabs.Screen name="profile-tab" options={{ title: "Profile" }} />
    </Tabs>
  );
}