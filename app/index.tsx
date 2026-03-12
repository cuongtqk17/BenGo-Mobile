import { useAuth } from '@/context/AuthContext';
import { Redirect, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

const Home = () => {
  const { token, hasHydrated, user } = useAuth();
  const rootNavigationState = useRootNavigationState();

  // Wait for auth to hydrate AND for Expo Router's root navigation container to be ready
  if (!hasHydrated || !rootNavigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (token) {
    if (user?.role?.toLowerCase() === 'driver') {
      return <Redirect href="/(driver)/tabs/home" />;
    } else {
      return <Redirect href="/(root)/tabs/home" />;
    }
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Home;