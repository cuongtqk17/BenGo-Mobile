import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false }} />
      <Stack.Screen name="promos" options={{ headerShown: false }} />
      <Stack.Screen name="promo-detail" options={{ headerShown: false }} />
      <Stack.Screen name="driver-profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="driver-registration"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default Layout;
