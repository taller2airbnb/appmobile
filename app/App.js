import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TextInput, Button } from 'react-native';

const App = () => {
  return (
    
      <View style={{
        justifyContent: "center",
        alignItems: "center"
      }}>
      <ImageBackground source={{
            uri: 'https://www.laprensa.hn/csp/mediapool/sites/dt.common.streams.StreamServer.cls?STREAMOID=THjb9uHQe4McutbIodzgps$daE2N3K4ZzOUsqbU5sYtgFRLkufOsRgvpd5rThyvBWCsjLu883Ygn4B49Lvm9bPe2QeMKQdVeZmXF$9l$4uCZ8QDXhaHEp3rvzXRJFdy0KqPHLoMevcTLo3h8xh70Y6N_U_CryOsw6FTOdKL_jpQ-&CONTENTTYPE=image/jpeg',
          }} style={{width: '100%', height: '100%'}}>

      <Text style= {{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 50,
        textAlign:"center",
        margin: 20
      }}>Hello World!</Text>
      </ImageBackground>
      
      </View>
  );
}

export default App;
