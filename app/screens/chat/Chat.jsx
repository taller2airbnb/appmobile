import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, List, Spinner} from 'native-base';
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
      fetching: true,
      people: [], 
      users: {},
      full_names: {},
      }        
  }

  async initializeFirebase(){
    if (firebase.apps.length) {
        await firebase.app().delete();
    }
    firebase.initializeApp(FirebaseConfig);
  }

  componentDidUpdate(prevProps){
    if(prevProps.navigation !== this.props.navigation){
      this.getFirebaseContacts();
    }
  }

  async componentDidMount(){
    this.getUserInfo();
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
    let full_names = {}
    for (var user in userInfo){
      let first_name = userInfo[user].first_name
      let full_name = userInfo[user].first_name + ' ' + userInfo[user].last_name
      full_names[userInfo[user].id] = full_name
      userDict[userInfo[user].id] = {first_name: first_name, full_name: full_name}
    }
    this.setState({full_names: full_names})
    return(userDict)
  }

  organizeContacts(data){
    let myContacts = [];
    let myId = Number(this.props.screenProps.user.id);
    let contact = 0;
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
    return myContacts;
  }

  getFirebaseContacts(){
    //getting chat pairing data from firebase
    let data = {};
    const dataRef = firebase.database().ref('pairings');
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
        //organizing the contacts for this user
        this.setState({contacts: this.organizeContacts(data)})
        this.setState({fetching: false})
    })
  }

  renderContact(contactId){
    return (
      <Button primary style={{ backgroundColor: '#dbdbdb', alignSelf: "center", marginBottom:5, width:'100%' }}
        onPress={() => this.props.navigation.navigate("ChatMessage", {name: this.state.users[contactId], otherUserId: contactId})}>
        <View style={{flex:1}}>
          <Text style={{marginLeft: 20, color:'#383838'}}>{this.state.full_names[contactId]}</Text>
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
        { this.state.fetching && <Spinner color='blue' />}
        { !this.state.fetching && (<>
        <Body>
            {(this.state.contacts.length == 0) &&
              <Body>
                <Content padder></Content>
                <Text>
                  You have not started any conversations.
                </Text>
              </Body>
            }
            <Content padder></Content>
            {this.state.contacts.map(this.renderContact, this)}
            {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
            <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
        </Body>
      </>)}
      </Content>
    </Container>;
  }
}
