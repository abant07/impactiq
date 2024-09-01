import '@walletconnect/react-native-compat'
import { WagmiProvider } from 'wagmi'
import { polygon } from '@wagmi/core/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native'
import Connect from './screens/connect'
import { store } from '../store';
import { Provider } from "react-redux"
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()
const projectId = 'bb375bdc8cf95de4508136103acf0c43'
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


export default function HomeScreen() {
    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
                    <QueryClientProvider client={queryClient}>
                        <Connect/>
                        <Web3Modal />
                    </QueryClientProvider>
                </WagmiProvider>
            </SafeAreaProvider>
        </Provider>
    );    
}
