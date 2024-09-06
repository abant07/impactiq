import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from "react-redux"
import { store } from '../store';
import '@walletconnect/react-native-compat'
import { WagmiProvider } from 'wagmi'
import { polygon } from '@wagmi/core/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient()
const projectId = process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID
const metadata = {
    name: 'ImpactIQ',
    description: 'DIMO Crash Detection App',
    url: 'https://walletconnect.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'YOUR_APP_SCHEME://',
      universal: 'YOUR_APP_UNIVERSAL_LINK.com'
    }
}

const chains = [polygon] as const

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({
    projectId,
    wagmiConfig,
    defaultChain: polygon,
    enableAnalytics: true
})

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="screens/Map" options={{ title: "", headerBackTitle: "Go to Permissions", headerStyle: {backgroundColor: "black"}, headerTintColor: "white" }} />
                </Stack>
              </Provider>
              <Web3Modal />
            </QueryClientProvider>
        </WagmiProvider>
    </SafeAreaProvider>
  );
}
