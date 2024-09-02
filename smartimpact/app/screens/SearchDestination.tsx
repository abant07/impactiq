import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native'
import React, { useRef } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux'
import { setDestination } from '../../slices/navSlice';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';

const SearchDestination = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation()

    return (
        <View style={tw`bg-black flex-1`}>
            <Text style={tw`text-center py-5 text-xl text-white`}>Good Morning! Where to?</Text>
            <View style={tw`border-t border-gray-200 flex-shrink`}>
                <View>
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
                            navigation.navigate('ChooseVehicle')
                        }}
                        textInputProps={{
                            returnKeyType: 'search'
                        }}
                        minLength={2}
                        enablePoweredByContainer={false}
                        query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                            lanugage: "en"
                        }}
                    />
                </View>
            </View>
        </View>
    )
}

export default SearchDestination

const toInputBoxStyles = StyleSheet.create({
    container: {
        backgroundColor: "black",
        paddingTop: 20,
        flex: 0
    },
    textInput : {
        backgroundColor: "#DDDDDF",
        borderRadius: 0,
        fontSize: 18
    },
    textInputContainer: {
        paddingHorizontal: 20,
        paddingBottom: 0
    }
})