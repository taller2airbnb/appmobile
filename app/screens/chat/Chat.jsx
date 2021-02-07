import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {Alert} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';

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
  

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.screenProps.user.email,
      error: '',
      people: [], 
      }        
  }

  async initializeFirebase(){
    if (firebase.apps.length) {
        await firebase.app().delete();
    }
    firebase.initializeApp(FirebaseConfig);
    
  }

  async componentDidMount(){
    this.initializeFirebase();
    //let dfref = firebase.database().ref('est');
    
    const myItems = firebase.database().ref('items');
    console.log(myItems)
    myItems.on('value', datasnap=>{
        console.log(datasnap.val())
    })





    //firebase.database().ref('test').on("value", snapshot => {
    //    let myList = [];
    //    snapshot.forEach(snap => {
    //        myList.push(snap.val());
    //    });
    //    this.setState({people: myList})
    //})
    console.log('holahhAAAAAAAAAAAAA')
    this.setState({people: [1,2]})
  }

  render() {
    return <Container>
      <Header>
      <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
        <Title>Chat</Title>
      </Body>
      </Header>
      <Content>
        <Body>
            {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
            <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
            <Text>Testing</Text>
            <Text>{this.state.people.length}</Text>

        </Body>
      </Content>
    </Container>;
  }
}
