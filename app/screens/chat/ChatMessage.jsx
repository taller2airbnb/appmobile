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


export default class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.screenProps.user.email,
      error: '',
      people: [], 
      name: this.props.navigation.getParam('name', 'blank'),
      chatId: '',
      messageList: [],
      formData: {
          message:''
      },
      }        
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
  }

  async componentDidMount(){
    let chatId = this.getChatId(this.props.screenProps.user.id.toString(), this.props.navigation.getParam('otherUserId', 'blank'))
    this.setState({name: this.props.navigation.getParam('name', 'blank')})
    this.setState({chatId: chatId})
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

  getChatId(user1, user2){
    let userList = [];
    let pairingList = mockdb.pairings;
    for (var pairing in pairingList) {
      userList = pairingList[pairing].users
      console.log('userList')
      console.log(userList)
      if (userList.includes(user1) && userList.includes(user2)){
        
        console.log('Match!')
        console.log(pairingList[pairing].chat)
        return (pairingList[pairing].chat)
      }
    }
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
    console.log('other user id: ' + this.props.navigation.getParam('otherUserId', 'blank'))
    let chatId = this.getChatId(this.props.screenProps.user.id.toString(), this.props.navigation.getParam('otherUserId', 'blank'))
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
      this.newMessage(this.state.formData.message)
      this.resetMessageField();
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
