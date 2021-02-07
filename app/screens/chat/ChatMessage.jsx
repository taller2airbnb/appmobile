import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, Form, Item, Input } from 'native-base';
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
 
    var newDateFormat = new Date(date).toLocaleDateString("fr-CA", options); 
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
      formData: {
          message:''
      },
      }        
  }

  async initializeFirebase(){
    if (firebase.apps.length) {
        await firebase.app().delete();
    }
    firebase.initializeApp(FirebaseConfig);
    
  }

  handleInputChange = (event, property) => {
    let newState = { ...this.state};
    newState.formData[property] = event.nativeEvent.text;
    this.setState(newState);
}

  newMessage(messageText){
    let myList = this.state.messageList
    myList.push({
      sayer: this.props.screenProps.user.id.toString(),
      text: messageText,
      time: new Date()
  })
    myList.sort((a,b) => (a.time > b.time) ? 1: -1);
    this.setState({messageList: myList})
    //console.log(myList)
  }

  async componentDidMount(){
    let chatId = this.props.navigation.getParam('chatId', 'blank')
    this.setState({name: this.props.navigation.getParam('name', 'blank')})
    this.setState({chatId: chatId})
    this.initializeFirebase();
    this.reloadMessages(chatId);
    this.getUser
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

  reloadMessages(chatId){
    let myList = []
    console.log('______________________');
    let messageList = mockdb.chats[chatId]
    for (var sayer in messageList){
        for (var messagesayer in messageList[sayer]){
            for (var message in messageList[sayer][messagesayer]){
                let m = messageList[sayer][messagesayer][message];
                let messageText = m.text;
                let messageTime = m.created
                let datet = new Date(messageTime)
                console.log(messagesayer + ' ' + messageText + ' ' + messageTime)
                myList.push({
                    sayer: messagesayer,
                    text: messageText,
                    time: datet
                })
            }
        }
    }
    myList.sort((a,b) => (a.time > b.time) ? 1: -1);
    this.setState({messageList: myList})
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    let chatId = this.props.navigation.getParam('chatId', 'blank')
    if(prevProps.navigation !== this.props.navigation){
        this.setState({name: this.props.navigation.getParam('name', 'blank')})
        this.setState({chatId: chatId})
        this.reloadMessages(chatId);
        this.resetMessageField();
      }
      
    }   

    validForm(){
      if(this.state.formData.message == ''){
          return false;
      }
      return true;
  }

  resetMessageField(){
    this.setState({formData: {message: ''}})
  }

    send = async() => {
      this.setState({error: ''})
      if(!this.validForm()){
          return;
      }
      console.log(this.state.formData)
      this.newMessage(this.state.formData.message)
      this.resetMessageField();
      console.log(this.state.formData)
  }


    renderMessage(message){
        let sayerAlign = 'left';
        let sayer = this.state.name + ': '
        if (message.sayer == this.props.screenProps.user.id){
            sayerAlign = 'right';
            sayer = ''
        }
        return (
          <Text style={{minWidth: '70%', textAlign: sayerAlign}}>
              {sayer}{message.text}
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

            <Form style={{marginBottom:20, minWidth: '70%'}}>
              <Item>
                <Input placeholder={'Say'} onChange={ (e) => this.handleInputChange(e, 'message')}/>
              </Item>
              
              </Form>
            <Button primary disabled={!this.validForm()} style={{ alignSelf: "center", marginBottom:10, width:70 }}onPress={this.send}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Send</Text>
                </View>
            </Button>
            <Button primary style={{ alignSelf: "center", marginBottom:10, width:80 }}onPress={() => this.props.navigation.navigate("Chat")}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Return</Text>
                </View>
            </Button>
        </Body>
      </Content>
    </Container>;
  }
}
