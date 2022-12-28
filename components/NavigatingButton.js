//Imports
import React, {Component} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Transition from "../screens/transition";
import Search from "../screens/search";

const Tab = createBottomTabNavigator();

export default class NavigateButton extends Component{
    render(){
        return(
            <SafeAreaProvider>
                <NavigationContainer>
                    <Tab.Navigator>
                        <Tab.Screen name="Transação" component={Transition}/>
                        <Tab.Screen name="Pesquisa" component={Search}/>
                    </Tab.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        )
    }
}