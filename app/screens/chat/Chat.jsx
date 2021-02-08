import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {Alert} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import {get} from '../../api/ApiHelper';
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
      contacts: [],
      people: [], 
      users: {},
      }        
  }

  async initializeFirebase(){
    if (firebase.apps.length) {
        await firebase.app().delete();
    }
    firebase.initializeApp(FirebaseConfig);
    
  }

  async componentDidMount(){
    this.getUserInfo();
    this.initializeFirebase();
    this.getFirebaseContacts();
  }

  async getUserInfo(){
    let endpoint = Constants.manifest.extra.profileEndpoint
    let profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
    if(profileResponse.status == 200){
      let json = await profileResponse.json();
      this.setState({users: this.userIntoList(json.message.users)})
    }else{
      let json = await profileResponse.json();
      this.setState({error: json.message ?? 'Oops! Something went wrong.'});
    } 
  }

  userIntoList(userInfo){
    let userDict = {}
    for (var user in userInfo){
      userDict[userInfo[user].id] = userInfo[user].first_name
    }
    return(userDict)
  }

  async getFirebaseContacts(){
    
    let myContacts = [];
    let myId = Number(this.props.screenProps.user.id);
    let contact = 0;
    console.log('__________________')
    //getting chat pairing data from firebase
    let data = {};
    const dataRef = firebase.database().ref('pairings');
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })
    //organizing the contacts for this user
    for (var pairing in data){
      let userIds = data[pairing]
      if (userIds.includes(myId)){
        if (userIds[0]!=myId){
          contact = userIds[0];
        }
        else{
          contact = userIds[1];
        }
        myContacts.push(contact.toString());
      }
    }
    this.setState({contacts: myContacts})
  }

  renderContact(contactId){
    return (
        <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}
        onPress={() => this.props.navigation.navigate("ChatMessage", {name: this.state.users[contactId], otherUserId: contactId})}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Chat with {this.state.users[contactId]}</Text>
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
