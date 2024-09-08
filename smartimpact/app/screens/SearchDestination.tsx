import { StyleSheet, View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux'
import { getPriviledgeKeys, getTelemetry, getAccessKeys } from "../../components/apis";
import { setOrigin, selectVehicle, setDestination, selectDistance, selectTravelTimeInformation } from '@/slices/navSlice';
import { useSelector } from 'react-redux'

const SearchDestination = () => {
    const dispatch = useDispatch()
    const vehicleid = useSelector(selectVehicle)
    const duration = useSelector(selectTravelTimeInformation)
    const distance = useSelector(selectDistance)

    useEffect(() => {
        const getOrigin = async () => {
            try {
                const access = await getAccessKeys();
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
                }}
                minLength={2}
                enablePoweredByContainer={false}
                query={{
                    key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                    language: "en"
                }}
                textInputProps={{
                    placeholderTextColor: "#000",
                    clearButtonMode: "always"
                }}
            />
            <View style={styles.vertcontainer}>
                <Text style={styles.text}>
                    Trip Details
                </Text>
                <Text style={styles.headerText}>
                    Distance: {Math.round(distance)} km
                </Text>
                <Text style={styles.headerText}>
                    Duration: {Math.round(duration)} min
                </Text>
            </View>
        </View>
    )
}

export default SearchDestination

const toInputBoxStyles = StyleSheet.create({
    container: {
        backgroundColor: "#1E2132",
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
        backgroundColor: "#1E2132",
        flex: 1,
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
    },
    vertcontainer: {
        padding: 10,
    },
    text: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
        marginTop: 15
    },
    headerText: {
        color: "white",
        fontSize: 20,
        marginBottom: 10,
        marginTop: 10,
    },
})
