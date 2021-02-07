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
  
import mockdb from "./mockdb.json"
//import mockdb from "../mockdb.js"


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.screenProps.user.email,
      error: '',
      //contacts: [],
      contacts: ['Jorge', 'Claudia', 'Lautaro'],
      chatIds: {},
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
    this.getContacts();
  }

  getContacts(){
      let myName = 'Martin';
      let myContacts = [];
      let userList = [];
      let contact = '';
      let myChats = {};
      let pairingList = mockdb.pairings;
      for (var pairing in pairingList) {
          //myContacts = pairing.users;
        userList = pairingList[pairing].users
          if (userList.includes(myName)){
            if (userList[0]!=myName){
                contact = userList[0];
            }
            else{
                contact = userList[1];
            }
            myChats[contact] = pairingList[pairing].chat
            myContacts.push(contact);
          }
      }
      this.setState({chatIds: myChats})
      this.setState({contacts: myContacts})
  }

  renderContact(contactName){
    return (
        <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}
        //onPress={() => this.props.navigation.navigate("ChatMessage", {name: contactName})}>
        onPress={() => this.props.navigation.navigate("ChatMessage", {name: contactName, chatId: this.state.chatIds[contactName]})}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Chat with {contactName}</Text>
            </View>
        </Button>
    )
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
            <Text></Text>
            {this.state.contacts.map(this.renderContact, this)}
        </Body>
      </Content>
    </Container>;
  }
}
