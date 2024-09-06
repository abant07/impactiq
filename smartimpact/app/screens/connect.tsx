import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useFonts } from 'expo-font';
import Vehicle from './Vehicles';

export default function Connect() {
    const { open } = useWeb3Modal();
    const { isConnected, isConnecting } = useAccount();

    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('../../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    if (isConnected) {
        return (
            <Vehicle />
        );
    } else {
        return (
            <View style={styles.container}>
                <Image style={styles.image} source={require('../../assets/images/dimo.png')} />
                <Text style={styles.text}>Log in with DIMO</Text>
                <TouchableOpacity style={styles.connect} onPress={() => open()}>
                    <Text style={styles.connectText}>{isConnecting ? "Connecting..." : "Connect Wallet"}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#030507",
        justifyContent: "center",
    },
    text: {
        color: "#E5E7EB",
        marginTop: 20,
        textAlign: "center",
        fontSize: 27,
        fontFamily: "SpaceMono-Regular",
        paddingBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 20,
    },
    connect: {
        backgroundColor: "#292D3E",
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        shadowColor: '#2EE59D',
        shadowOpacity: 0.5,
        elevation: 10,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    connectText: {
        color: "#E5E7EB",
        fontSize: 15,
        fontFamily: "SpaceMono-Regular",
    },
});


