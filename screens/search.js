import React, {Component} from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";

export default class Search extends Component {
    render(){
        return(
            <View style={styleSheet.container}>
                <Text style={styleSheet.text}>
                    Tela de Pesquisa
                </Text>
            </View>
        )
    }
}

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "purple"
    },
    text: {
        color: "white"
    }
})