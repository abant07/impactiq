import { View } from 'react-native';
import React from "react"
import tw from 'tailwind-react-native-classnames';
import Satellite from './Satellite'
import { createStackNavigator } from '@react-navigation/stack';
import SearchDestination from './SearchDestination';
import ChooseVehicle from './chooseVehicle';

export default function Map() {
    const Stack = createStackNavigator()
    return (
        <View>
            <View style={tw`h-1/2`}>
                <Satellite/>
            </View>
            <View style={tw`h-1/2`}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="SearchDestination" component={SearchDestination} options={{ headerShown: false}}/>
                    <Stack.Screen name="ChooseVehicle" component={ChooseVehicle} options={{ headerShown: false}} />
                </Stack.Navigator>
            </View>
        </View>
    )
}