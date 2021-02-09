import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, Form, Icon, Item, Input, Left} from 'native-base';
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
      textInput: '',
      }        
  }


  rewriteFirebaseChatData(data, thisUserId, newMessage){
    if (data != null && data != {}){
      if (data[thisUserId]){
        data[thisUserId].push(newMessage)
      }
      else{
        data[thisUserId] = [newMessage]
      }
    }
    else{
      let newChat = {}
      newChat[thisUserId] = [newMessage]
      data = newChat
    }
    return(data)
  }


  sendMessageToFirebase(chatId, userId){
    chatId = this.state.chatId
    userId = this.props.screenProps.user.id.toString()
    let newMessage = {created: new Date().toJSON(), text: this.state.textInput}
    //getting messages data from firebase
    let data = {};
    let dataRef = firebase.database().ref('chats').child(chatId);
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })

    //editing and sending the data
    data = this.rewriteFirebaseChatData(data, userId, newMessage);
    dataRef.set(data)

    this.loadMessagesFromFirebase(chatId);
    this.resetMessageField();
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

  createNewChatId(user1, user2){
    let newChatId = user1.toString() + '_' + user2.toString()
    console.log('Chat missing. Creating chat.')
    let dataRef = firebase.database().ref().child('pairings').child(newChatId);
    dataRef.set([user1, user2])
    console.log('Chat created.')
    return newChatId
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
    //if there's no return yet, the chat is missing. We will create it:
    if (data != null && data != {}){
      return(this.createNewChatId(id1, id2))
    }
  }


  loadMessagesFromFirebase(chatId){
    let messageList = []
    let data = {};
    let message = {};
    const dataRef = firebase.database().ref('chats').child(chatId);
    dataRef.on('value', datasnap=>{
        data = datasnap.val()
    })
    for (var sayer in data){
      if (data[sayer].length>=1){
        for (var messageId in data[sayer]){
          message = data[sayer][messageId]
          messageList.push({
            sayer: sayer,
            text: message.text,
            time: new Date(message.created)
          })
        }
      }
      else{
        message = data[sayer]
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
    if(prevProps.navigation !== this.props.navigation){
        let chatId = this.getChatIdFromFirebase(this.props.screenProps.user.id.toString(), this.props.navigation.getParam('otherUserId', 'blank'))
        this.setState({name: this.props.navigation.getParam('name', 'blank')})
        this.setState({chatId: chatId})
        this.loadMessagesFromFirebase(chatId);
        this.resetMessageField();
      }
      
    }   

  validForm(){
    if(this.state.textInput == ''){
        return false;
    }
    return true;
  }

  resetMessageField(){
    this.setState({textInput: ''})
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
        <Left>
          <Button primary style={{ alignSelf: "center", width:80 }}onPress={() => this.props.navigation.navigate("Chat")}>
            <Text>Back</Text>
          </Button>
        </Left>
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
            <Row>
              <Col style={{minWidth:'60%', alignItems: "center"}}>
                <Item rounded>
                  <Input 
                  style={{minWidth: '95%', maxWidth: '95%'}}
                  autoCapitalize='none'
                  underlineColorAndroid="transparent" 
                  placeholder={'Write...'}
                  onChangeText={(textInput) => this.setState({textInput})}
                  value={this.state.textInput} />
                </Item>

              </Col>
              <Col>
                <Button primary disabled={!this.validForm()} style={{ alignSelf: "center", marginBottom:10, width:60 }}onPress={this.sendMessageToFirebase.bind(this)}>
                  <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                    <Text style={{color:'white'}}>Send</Text>
                  </View>
                </Button>
              </Col>
            </Row>
        </Body>
      </Content>
    </Container>;
  }
}
