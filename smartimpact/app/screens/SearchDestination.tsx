import { StyleSheet, View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { getPriviledgeKeys, getTelemetry } from "../../components/apis";
import { setOrigin, selectAccess, selectVehicle, setDestination } from '@/slices/navSlice';
import { useSelector } from 'react-redux'

const SearchDestination = () => {
    const [destination, setDest] = useState("");
    const dispatch = useDispatch()
    const access = useSelector(selectAccess)
    const vehicleid = useSelector(selectVehicle)

    const startRoute = async () => {
        
        //start the GPS route where it shows the current location of the user along the path.
    }

    useEffect(() => {
        const getOrigin = async () => {
            try {
                const data = await getPriviledgeKeys(access, vehicleid)
                const {currentLocationLatitude, currentLocationLongitude} = await getTelemetry(data, vehicleid)
                dispatch(setOrigin({
                    location: {lat: currentLocationLatitude, lng: currentLocationLongitude},
                    description: `(${currentLocationLatitude},${currentLocationLongitude})`
                }))

            } catch (error) {
                console.error('Error fetching vehicle stats:', error);
            }
        }
        
        getOrigin()
            .catch(() => console.log())
    }, [])

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete 
                placeholder='Enter your destination'
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={400}
                styles={toInputBoxStyles}
                fetchDetails={true}
                onPress={(data, details = null) => {
                    dispatch(setDestination({
                        location: details?.geometry.location,
                        description: data.description
                    }))
                    setDest(data.description)
                }}
                minLength={2}
                enablePoweredByContainer={false}
                query={{
                    key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                    language: "en"
                }}
                textInputProps={{
                    placeholderTextColor: "#000", // Ensure placeholder text is black
                    clearButtonMode: "always"
                }}
            />
            {destination && (
                <TouchableOpacity style={styles.start} onPress={() => {startRoute()}}>
                    <Text>
                        Start Route
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default SearchDestination

const toInputBoxStyles = StyleSheet.create({
    container: {
        backgroundColor: "#292D3E",
        paddingTop: 20,
        flex: 0
    },
    textInput : {
        backgroundColor: "#DDDDDF",
        borderRadius: 50,
        fontSize: 16
    },
    textInputContainer: {
        paddingHorizontal: 20,
        paddingBottom: 0
    }
})

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#292D3E",
        flex: 1, // This ensures the background color extends to the entire component
    },
    start: {
        backgroundColor: "white",
        paddingVertical: 15,
        width: 200,
        borderRadius: 50,
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        alignSelf: "center",
        shadowOpacity: 0.5,
        color: "black",
        shadowColor: "white",
        shadowOffset: { width: 0, height: 5 },
        marginTop: 100
    }
})
