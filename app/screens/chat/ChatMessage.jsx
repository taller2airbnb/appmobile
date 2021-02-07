import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {Alert} from 'react-native';
import {NavigationEvents, TabRouter} from 'react-navigation';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';

import firebase from "firebase/app";

import mockdb from "./mockdb.json"


const FirebaseConfig = {
    apiKey: "AIzaSyDM2NPGRMQspGMEv2znm0kOuBL3iWOzPWI",
    appId: "1:481615734249:android:4b1c1c33582e15be4a9778",
    projectId: "bookbnb-degoas-ed",
    authDomain: "bookbnb-degoas-ed.firebaseapp.com",
    databaseURL: "https://bookbnb-degoas-ed.firebaseio.com",
    storageBucket: "bookbnb-degoas-ed.appspot.com",
    messagingSenderId: "481615734249",
  }
  

  function dateConvertor(date){
    var options = { weekday: "long",  
                     year: "numeric",  
                     month: "short",  
                     day: "numeric" };  
 
    var newDateFormat = new Date(date).toLocaleDateString("en-US", options); 
    var newTimeFormat = new Date(date).toLocaleTimeString();  
    var dateAndTime = newDateFormat +' ' + newTimeFormat        
   return dateAndTime
 }


export default class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.screenProps.user.email,
      error: '',
      people: [], 
      name: this.props.navigation.getParam('name', 'blank'),
      chatId: this.props.navigation.getParam('chatId', 'blank'),
      messageList: [],
      }        
  }

  async initializeFirebase(){
    if (firebase.apps.length) {
        await firebase.app().delete();
    }
    firebase.initializeApp(FirebaseConfig);
    
  }

  async componentDidMount(){
    let chatId = this.props.navigation.getParam('chatId', 'blank')
    this.setState({name: this.props.navigation.getParam('name', 'blank')})
    this.setState({chatId: chatId})
    this.initializeFirebase();
    this.reloadMessages(chatId);
  }


  reloadMessages(chatId){
    let myList = []
    console.log('______________________');
    let messageList = mockdb.chats[chatId]
    //console.log(messageList);
    for (var sayer in messageList){
        for (var messagesayer in messageList[sayer]){
            for (var message in messageList[sayer][messagesayer]){
                let m = messageList[sayer][messagesayer][message];
                let messageText = m.text;
                let messageTime = m.created
                let datet = dateConvertor(messageTime);
                console.log(messagesayer + ' ' + messageText + ' ' + messageTime)
                //console.log(datet)
                myList.push({
                    sayer: messagesayer,
                    text: messageText,
                    time: datet
                })
            }
        }
    }
    myList.sort((a,b) => (a.time > b.time) ? 1: -1);
    //console.log(myList.length)
    //console.log(myList[0])
    this.setState({messageList: myList})
    console.log(this.state.messageList.length)
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    let chatId = this.props.navigation.getParam('chatId', 'blank')
    if(prevProps.navigation !== this.props.navigation){
        this.setState({name: this.props.navigation.getParam('name', 'blank')})
        this.setState({chatId: chatId})
      }
      //this.reloadMessages(chatId);
      
    }   

    renderMessage(message){
        let sayerAlign = 'left';
        let spaceLeft =  '';
        let spaceRight = '                              ';
        if (message.sayer == 'Martin'){
            sayerAlign = 'right';
            spaceLeft = '                                '
            spaceRight = ''
        }
        return (
            <Text style={{textAlign: sayerAlign}}>
                {spaceLeft}{message.text}{spaceRight}
            </Text>
        )
    }

  render() {
    return <Container>
      <Header>
      <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
        <Title>Message with {this.state.name}</Title>
      </Body>
      </Header>
      <Content>
        <Body>
            {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
            <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
            <Text></Text>
            {this.state.messageList.map(this.renderMessage, this)}
            <Text></Text>
            <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={() => this.props.navigation.navigate("Chat")}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Return to chat list</Text>
                </View>
            </Button>
        </Body>
      </Content>
    </Container>;
  }
}
