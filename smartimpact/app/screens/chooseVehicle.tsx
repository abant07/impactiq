import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi';
import {userVehicle, getCredentials} from "../../components/apis"
import { ScrollView } from 'react-native-gesture-handler';

const ChooseVehicle = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const { address } = useAccount();
  useEffect(() => {
    const getVehicles = async () => {
        try {
            const data = await userVehicle(address ? address : "");
            setVehicleData(data.data.vehicles.nodes);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };
    getVehicles()
        .catch(()=>console.log("Error with getting vehicles"))
  }, []);

  const handleRadioSelect = async (vehicleId: string) => {
    try {
        const data = await getCredentials(vehicleId);
    } catch (error) {
        console.error('Error fetching vehicle stats:', error);
    }
  };

  return (
    <ScrollView>
        {vehicleData.length > 0 ? (
            <View style={styles.radioContainer}>
                {vehicleData.map((vehicle) => (
                    <TouchableOpacity
                        key={vehicle.tokenId}
                        style={[
                            styles.radioButton,
                        ]}
                        onPress={() => {
                            handleRadioSelect(vehicle.tokenId)
                        }}
                    >
                        <Text style={styles.radioText}>
                            #{vehicle.tokenId} {vehicle.definition.make} {vehicle.definition.model} {vehicle.definition.year}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        ) : (
            <Text style={styles.noVehiclesText}>No vehicle data has been permitted for crash detection. Please make sure to enable permissions</Text>
        )}
    </ScrollView>
  )
}

export default ChooseVehicle

const styles = StyleSheet.create({

  radioContainer: {
      alignItems: "center",
      marginBottom: 30,
  },
  radioButton: {
      backgroundColor: "#1F2937",
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
  selectedRadioButton: {
      backgroundColor: "#2EE59D",
  },
  radioText: {
      color: "#E5E7EB",
      fontSize: 17,
      fontFamily: "SpaceMono-Regular",
  },
  noVehiclesText: {
      color: "black",
      fontSize: 20,
      fontFamily: "SpaceMono-Regular",
      textAlign: "center",
      marginVertical: 20,
  }
});