import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, Alert } from 'react-native';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import { vehicles, vehicleStats } from '../../components/apis';
import Connect from './connect';
import dimoABI from "../../components/abi.json";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

export default function Vehicle() {
    const { open } = useWeb3Modal();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [vehicleData, setVehicleData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);
    const [date, setDate] = useState(new Date())
    const [car, setCarMake] = useState("")
    const [token, setToken] = useState(0)
    const { writeContract } = useWriteContract()
    const balance = useBalance({
        address: address
    });

    useEffect(() => {
        const getVehicles = async () => {
            try {
                const data = await vehicles(address ? address : "");
                setVehicleData(data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };
        getVehicles()
            .catch(()=>console.log("Error with getting vehicles"))
    }, []);

    const handleRadioSelect = async (vehicleId: string, queryparam: string) => {
        try {
            queryparam = queryparam.replace(" ", "-")
            const data = await vehicleStats(queryparam.toLowerCase());
            setSelectedVehicleDetails(data.data.deviceDefinition);
            setModalVisible(true);
            setToken(Number(vehicleId))
        } catch (error) {
            console.error('Error fetching vehicle stats:', error);
        }
    };

    const givePermission = (vehicleId: number) => {
        setModalVisible(false)
        try {
            writeContract ({
                dimoABI,
                address: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF', // Contract address
                functionName: 'setPrivileges', // Contract function name
                args: [
                    [
                        (vehicleId, 1, "0x7516c0358EbaBf58122c59D9068dEEc25332f946", Math.floor(date.getTime() / 1000)),
                        (vehicleId, 3, '0x7516c0358EbaBf58122c59D9068dEEc25332f946', Math.floor(date.getTime() / 1000)),
                        (vehicleId, 4, '0x7516c0358EbaBf58122c59D9068dEEc25332f946', Math.floor(date.getTime() / 1000)),
                        (vehicleId, 6, '0x7516c0358EbaBf58122c59D9068dEEc25332f946', Math.floor(date.getTime() / 1000))
                    ]
                ]
            });
        }
        catch {
            Alert.alert("Transaction Failed", "There was an error executing the contract.");
        }
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setDate(currentDate);
    };
    

    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('../../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    if (isConnected) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.horizontalContainer}>
                        <Text style={styles.headerText}>{address?.substring(0, 6) + "..." + address?.substring(address.length - 4)}</Text>
                        <Text style={styles.headerText}>{String(Number(balance.data?.value) / 1000000000000000000).substring(0, 5)} MATIC</Text>
                    </View>

                    <Text style={styles.title}>Your Vehicles</Text>
                    <Text style={styles.subtitle}>Grant permission to use vehicle data for crash detection</Text>
                    {vehicleData.length > 0 ? (
                        <View style={styles.radioContainer}>
                            {vehicleData.map((vehicle) => (
                                <TouchableOpacity
                                    key={vehicle.tokenId}
                                    style={[
                                        styles.radioButton,
                                    ]}
                                    onPress={() => {
                                        handleRadioSelect(vehicle.tokenId, vehicle.definition.make + "_" + vehicle.definition.model + "_" + vehicle.definition.year)
                                        setCarMake(vehicle.definition.make)
                                    }}
                                >
                                    <Text style={styles.radioText}>
                                        #{vehicle.tokenId} {vehicle.definition.make} {vehicle.definition.model} {vehicle.definition.year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noVehiclesText}>No vehicles are left to give permission</Text>
                    )}
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeIconText}>✕</Text>
                        </TouchableOpacity>
                        {selectedVehicleDetails && (
                            <>
                                <Text style={styles.titleText}>{car}</Text>
                                <Text style={styles.modalText}>Model Year: {selectedVehicleDetails.year}</Text>
                                <Text style={styles.modalText}>Model: {selectedVehicleDetails.model}</Text>
                                {selectedVehicleDetails.attributes.map((attr, index) => (
                                    <Text key={index} style={styles.modalText}>{attr.name}: {attr.value}</Text>
                                ))}
                                <View style={styles.horizontalContainer}>
                                    <Text style={styles.modalText}>Expire Data:</Text>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="date"
                                        is24Hour={true}
                                        onChange={onChange}
                                        />
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="time"
                                        is24Hour={true}
                                        onChange={onChange}
                                        />
                                </View>
                                <TouchableOpacity style={styles.button} onPress={() => givePermission(token)}>
                                    <Text style={styles.buttonText}>Give Permission</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </Modal>
                <View style={styles.bottomHorizontalContainer}>
                    <TouchableOpacity style={[styles.button, styles.disconnect]} onPress={() => open()}>
                        <Text style={styles.headerText}>Disconnect Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.next} onPress={() => router.push("/screens/map")}>
                        <Text style={styles.buttonText} >Done -&gt;</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    } else {
        return (
            <Connect/>
        );
    }
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#030507",
    },
    scrollContainer: {
        padding: 20,
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#2EE59D',
        shadowOpacity: 0.3,
        elevation: 8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    headerText: {
        color: "white",
        fontSize: 16,
    },
    title: {
        color: "white",
        fontSize: 25,
        textAlign: "center",
        fontFamily: "SpaceMono-Regular",
    },
    subtitle: {
        color: "white",
        fontSize: 17,
        textAlign: "center",
        paddingBottom: 30
    },
    radioContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    radioButton: {
        backgroundColor: "#1E2132",
        paddingVertical: 20,
        borderRadius: 10,
        marginVertical: 8,
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        shadowColor: 'white',
        shadowOpacity: 0.3,
        elevation: 8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    radioText: {
        color: "#E5E7EB",
        fontSize: 17,
    },
    noVehiclesText: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
        marginVertical: 20,
    },
    button: {
        backgroundColor: "#2EE59D",
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: 'white',
        shadowOpacity: 0.5,
        elevation: 10,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        marginBottom: 5,
    },
    buttonText: {
        color: "#030507",
        fontSize: 15,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 5,
        textAlign: "center",
        fontSize: 18,
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 1,
    },
    closeIconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#000",
    },
    disconnect: {
        backgroundColor: "#1E2132",
        paddingVertical: 15,
        marginStart: 10,
        width: '65%',
        borderRadius: 50,
        alignItems: "center",
        shadowColor: 'white',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        marginBottom: 5,
        alignSelf: "flex-start"
    },
    next: {
        backgroundColor: "white",
        paddingVertical: 15,
        marginEnd: 10,
        width: '25%',
        borderRadius: 50,
        alignItems: "center",
        shadowColor: 'white',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        marginBottom: 5,
        alignSelf: "flex-end"
    },
    titleText: {
        marginBottom: 5,
        textAlign: "center",
        fontSize: 35,
    },
    bottomHorizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: '#2EE59D',
        shadowOpacity: 0.3,
        elevation: 8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
});
