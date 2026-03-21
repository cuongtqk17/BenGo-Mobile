import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Layout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Jakarta-Medium",
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Hoạt động",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Thu nhập",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
