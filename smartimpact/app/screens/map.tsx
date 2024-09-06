import { View } from 'react-native';
import React from "react"
import tw from 'tailwind-react-native-classnames';
import Satellite from './Satellite'
import { createStackNavigator } from '@react-navigation/stack';
import SearchDestination from './SearchDestination';
import ChooseVehicle from './ChooseVehicle';

export default function Map() {
    const Stack = createStackNavigator()
    return (
        <View>
            <View style={tw`h-2/5`}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="ChooseVehicle" component={ChooseVehicle} options={{ headerShown: false}} />
                    <Stack.Screen name="SearchDestination" component={SearchDestination} options={{ headerShown: false}}/>
                </Stack.Navigator>
            </View>
            <View style={tw`h-3/5`}>
                <Satellite/>
            </View>
        </View>
    )
}