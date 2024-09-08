import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { userVehicle } from "../../components/apis";
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux'
import { setVehicle, setDestination, setOrigin, setDistanceTravel, setTravelTimeInformation } from '@/slices/navSlice';

const ChooseVehicle = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const { address } = useAccount();
  const navigation = useNavigation()
  const dispatch = useDispatch()

  useEffect(() => {
    const getVehicles = async () => {
        try {
            const data = await userVehicle(address ? address : "");
            setVehicleData(data.data.vehicles.nodes);
            dispatch(setOrigin(null))
            dispatch(setDestination(null))
            dispatch(setDistanceTravel(0))
            dispatch(setTravelTimeInformation(0))
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };
    
    getVehicles()
        .catch(() => console.log("Error with getting vehicles"));
  }, []);

  const handleRadioSelect = async (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    dispatch(setVehicle(vehicleId))
  };

  return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {vehicleData.length > 0 ? (
                <View style={styles.radioContainer}>
                    {selectedVehicleId && (
                        <TouchableOpacity style={styles.continue} onPress={() => {
                            navigation.navigate('SearchDestination')
                        }}>
                            <Text>
                                Continue-&gt;
                            </Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.noVehiclesText}>
                        Choose a vehicle that you are driving today
                    </Text>
                    {vehicleData.map((vehicle) => (
                        <TouchableOpacity
                            key={vehicle.tokenId}
                            style={[
                                styles.radioButton,
                                selectedVehicleId === vehicle.tokenId && styles.selectedRadioButton,
                            ]}
                            onPress={() => handleRadioSelect(vehicle.tokenId)}
                        >
                            <View style={styles.radioContent}>
                                <Text style={styles.radioText}>
                                    {vehicle.definition.make} {vehicle.definition.model} {vehicle.definition.year}
                                </Text>
                                {selectedVehicleId === vehicle.tokenId && (
                                    <Text style={styles.carEmoji}>🚗</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text style={styles.noVehiclesText}>
                    No vehicle data has been permitted for crash detection. Please make sure to enable permissions.
                </Text>
            )}
        </ScrollView>
    </View>
  );
}

export default ChooseVehicle;

const styles = StyleSheet.create({
  container: {
      flex: 1,  // Ensures the container takes up the full height of the screen
      backgroundColor: '#1E2132',  // Dark background color to match the image style
      padding: 20,
  },
  scrollContent: {
      flexGrow: 1,  // Ensures the ScrollView content expands to fill the available space
      justifyContent: 'space-between',  // Makes sure content is spaced nicely
  },
  radioContainer: {
      marginBottom: 30,
  },
  radioButton: {
      backgroundColor: "#292D3E",  // Unselected button background color
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 10,
      marginVertical: 8,
      width: '100%',
      flexDirection: 'row',
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 2,
      borderColor: 'transparent',
  },
  selectedRadioButton: {
      borderColor: "#00A6FF",  // Border color for the selected button
      backgroundColor: "#334056",  // Selected button background color
  },
  radioContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
  },
  radioText: {
      color: "#FFFFFF",  // White text color
      fontSize: 16,
      fontWeight: '600',
  },
  carEmoji: {
      fontSize: 24,
      marginLeft: 10,
  },
  noVehiclesText: {
      color: "#FFFFFF",
      fontSize: 16,
      textAlign: "center",
      marginVertical: 20,
  },
  continue: {
    backgroundColor: "#2EE59D",
    width: 100,
    height: 50,
    paddingVertical: 15,
    borderRadius: 50,
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
  }
});
