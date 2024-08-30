import '@walletconnect/react-native-compat'
import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, arbitrum } from '@wagmi/core/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal, defaultWagmiConfig, Web3Modal, useWeb3Modal } from '@web3modal/wagmi-react-native'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

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

const chains = [mainnet, polygon, arbitrum] as const

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({
    projectId,
    wagmiConfig,
    defaultChain: mainnet, // Optional
    enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export default function HomeScreen() {
    const { open } = useWeb3Modal()

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <View style={styles.container}>
                    <Image style={styles.image}
                        source={require('../assets/images/dimo.png')}
                    ></Image>
                    <Text style={styles.text}>Log in with DIMO</Text>
                    <TouchableOpacity style={styles.connect} onPress={() => open()}>
                        <Text style={styles.buttonText}>Connect Wallet</Text>
                    </TouchableOpacity>
                </View>
                <Web3Modal />
            </QueryClientProvider>
        </WagmiProvider>
    );    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#030507"
  },
  text: {
    color: "white",
    marginTop: 20,
    textAlign: "center",
    fontSize: 30,
    paddingBottom: 100
  },
  image: {
    marginTop: 100,
    marginBottom: -20
  },
  connect: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: 'rgba(46, 229, 157, 0.4)',
    shadowOpacity: 1.5,
    elevation: 8,
    shadowRadius: 20 ,
    shadowOffset : { width: 1, height: 13}
  },
  buttonText: {
    color: "black",
    fontSize: 18
  }
});