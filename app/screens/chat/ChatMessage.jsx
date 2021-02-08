import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, Form, Item, Input } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {Alert} from 'react-native';
import {NavigationEvents, TabRouter} from 'react-navigation';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import firebase from "firebase/app";


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


  sendMessageToFirebase(chatId, userId){
    chatId = '42_5'
    userId = '42'
    console.log('armadillo')
    let newMessage = {created: new Date().toJSON(), text: 'yet another prueba'}
    let data = {};
    let dataRef = firebase.database().ref('chats');
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })
    console.log(chatId + '-' + userId)
    dataRef = firebase.database().ref().child('chats');
    console.log(data)
    let test = data[chatId]
    for (var a in test){
      if (a == userId){
        console.log(test[userId])
        if (test[userId].length>1){
          data[chatId][userId].push(newMessage)
        }
        else{
          let newData = [test[userId], newMessage]
          data[chatId][userId].push(newMessage)
        }
      }
    }
    if(!test[userId]){
      data[chatId][userId] = [newMessage]
    }
    console.log(data)
    dataRef.set(data)
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
    let chatId = this.getChatIdFromFirebase(this.props.screenProps.user.id.toString(), this.props.navigation.getParam('otherUserId', 'blank'))
    this.setState({name: this.props.navigation.getParam('name', 'blank')})
    this.setState({chatId: chatId})
    this.loadMessagesFromFirebase(chatId);
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

  getChatIdFromFirebase(user1, user2){
    let id1 = Number(user1);
    let id2 = Number(user2);
    //getting chat pairing data from firebase
    let data = {};
    const dataRef = firebase.database().ref('pairings');
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })
    //checking data for matching chat id
    for (var pairing in data) {
      let userList = data[pairing];
      if (userList.includes(id1) && userList.includes(id2)){
        return (pairing)
      }
    }
  }


  loadMessagesFromFirebase(chatId){
    let messageList = []
    let data = {};
    let message = {};
    const dataRef = firebase.database().ref('chats');
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })
    let messages = data[chatId]
    for (var sayer in messages){
      if (messages[sayer].length>=1){
        for (var messageId in messages[sayer]){
          message = messages[sayer][messageId]
          messageList.push({
            sayer: sayer,
            text: message.text,
            time: new Date(message.created)
          })
        }
      }
      else{
        message = messages[sayer]
        messageList.push({
          sayer: sayer,
          text: message.text,
          time: new Date(message.created)
        })
      }
    }
    messageList.sort((a,b) => (a.time > b.time) ? 1: -1);
    this.setState({messageList: messageList})
  }


  componentDidUpdate(prevProps, prevState, snapshot){
    let chatId = this.getChatIdFromFirebase(this.props.screenProps.user.id.toString(), this.props.navigation.getParam('otherUserId', 'blank'))
    if(prevProps.navigation !== this.props.navigation){
        this.setState({name: this.props.navigation.getParam('name', 'blank')})
        this.setState({chatId: chatId})
        this.loadMessagesFromFirebase(chatId);
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
            <Button primary style={{ alignSelf: "center", marginBottom:10, width:150 }}onPress={this.sendMessageToFirebase}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Test firebase</Text>
                </View>
            </Button>
        </Body>
      </Content>
    </Container>;
  }
}
