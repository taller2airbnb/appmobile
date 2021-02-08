import * as Expo from "expo";
import * as Font from 'expo-font'
import React, { Component } from "react";
import { StyleProvider } from "native-base";
import { Ionicons } from '@expo/vector-icons';
import MainApp from "../components/MainApp";
import getTheme from "../theme/components";
import variables from "../theme/variables/commonColor";
import firebase from "firebase/app";

const FirebaseConfig = {
  apiKey: "AIzaSyDM2NPGRMQspGMEv2znm0kOuBL3iWOzPWI",
  appId: "1:481615734249:android:4b1c1c33582e15be4a9778",
  projectId: "bookbnb-degoas-ed",
  authDomain: "bookbnb-degoas-ed.firebaseapp.com",
  databaseURL: "https://bookbnb-degoas-ed.firebaseio.com",
  storageBucket: "bookbnb-degoas-ed.appspot.com",
  messagingSenderId: "481615734249",
}

firebase.initializeApp(FirebaseConfig);

export default class Setup extends Component {
  constructor() {
    super();
    this.state = {
      isReady: false
    };
  }
  componentWillMount() {
    this.loadFonts();
  }
  async loadFonts() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
      Entypo: require("native-base/Fonts/Entypo.ttf"),
      Feather: require("native-base/Fonts/Feather.ttf"),
      FontAwesome: require("native-base/Fonts/FontAwesome.ttf"),
      // MaterialIcons: require("native-base/Fonts/MaterialIcons.ttf"),
      // MaterialCommunityIcons: require("native-base/Fonts/MaterialCommunityIcons.ttf"),
      Octicons: require("native-base/Fonts/Octicons.ttf"),
      // Zocial: require("@expo/vector-icons/fonts/Zocial.šttf"),
      // SimpleLineIcons: require("native-base/Fonts/SimpleLineIcons.ttf"),
      // EvilIcons: require("native-base/Fonts/EvilIcons.ttf"),
      // ...Ionicons.font,
    });
    this.setState({ isReady: true });
  }
  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return (
      <StyleProvider style={getTheme(variables)}>
        <MainApp />
      </StyleProvider>
    );
  }
}
