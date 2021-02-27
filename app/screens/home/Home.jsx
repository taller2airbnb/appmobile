import React, { Component } from "react";
import { ImageBackground, View, StatusBar, Dimensions } from "react-native";
import { Container, Button, H3, Text } from "native-base";

import styles from "./styles";

const launchscreenBg = require("../../assets/degoas-francella-flip.png");
const launchscreenLogo = require("../../assets/logo-kitchen-sink.png");
const deviceHeight = Dimensions.get("window").height;

class Home extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>          
          <View
            style={{
              alignItems: "center",
              marginBottom: 5,
              backgroundColor: "transparent",
              top: deviceHeight / 2
            }}
          >
          <H3 style={styles.text}>Welcome</H3>
            <View style={{ marginTop: 8 }} />
          <H3 style={styles.text}>{this.props.screenProps.user.email ?? ''}</H3>
            <View style={{ marginTop: 8 }} />
          </View>
          <View style={{ marginBottom: 80, top: deviceHeight / 2 }}>
            <Button
              style={{ backgroundColor: "#6FAF98", alignSelf: "center" }}
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Text>Start Browsing!</Text>
            </Button>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

export default Home;
