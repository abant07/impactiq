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
            <View style={tw`h-2/5`}>
                <Stack.Navigator screenOptions={{ title: "", headerBackTitle: "Back", headerStyle: {backgroundColor: "#292D3E"}, headerTintColor: "white" }}>
                    <Stack.Screen name="ChooseVehicle" component={ChooseVehicle} options={{ headerShown: false }}/>
                    <Stack.Screen name="SearchDestination" component={SearchDestination} />
                </Stack.Navigator>
            </View>
            <Satellite/>
        </View>
    )
}