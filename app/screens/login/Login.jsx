import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, View, TextInput } from 'native-base';

import React from "react";
import * as Google from 'expo-google-app-auth';
import { color } from 'react-native-reanimated';
import Constants from 'expo-constants';
import {Alert} from 'react-native';
import {post} from '../../api/ApiHelper'

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          email: '',
          password: '',
          error: ''
        }
      }

  handleInputChange = (event, property) => {
    let newState = { ...this.state};
    newState[property] = event.nativeEvent.text;
    this.setState(newState);
  }

   signIn = async() => {    
    const body = {email: this.state.email, password: this.state.password, google_token: '', user_type: 'bookbnb'}
    let response = await post(Constants.manifest.extra.loginEndpoint, body)
     
    if(response.status == 200){
      let json = await response.json();      
      this.props.screenProps.handleLogIn({...json.message, accessToken: json.token});
      this.props.navigation.navigate('Home');
      }else{
      let json = await response.json();
      this.setState({error: json.message ?? 'Oops! Something went wrong.'})
  }
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if(prevProps.navigation !== this.props.navigation){
      if(this.props.navigation.getParam('alertMessage')){
        Alert.alert(this.props.navigation.getParam('alertMessage'))
        this.props.navigation.setParams({alertMessage: ''})
      }
      
    }    
  }

  signInWithGoogle = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId:
        Constants.manifest.extra.androidStandAloneClientId,
        androidStandaloneAppClientId: Constants.manifest.extra.androidStandAloneClientId,
        scopes: [Constants.manifest.extra.googleProfileEndpoint, "email"]
      })
      
      if (result.type === "success") {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({email: '', password: '', google_token: result.accessToken, user_type: 'googleuser'})
        };
    
        let response = await fetch(Constants.manifest.extra.loginEndpoint, requestOptions);
        if(response.status == 200){
          let json = await response.json();
          this.props.screenProps.handleLogIn({...json.message, accessToken: json.token});
          this.props.navigation.navigate('Home');
      }else{
          let json = await response.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'})
      }    
      } else {
        this.setState({error: 'Google authentication failed'})
      }
    } catch (e) {
      this.setState({error: 'Google authentication failed'})
    }
  }

  render() {
    return <Container>
        <Header>
          
          <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title >Welcome to BookBnB, Please Sign In</Title>
          </Body>
          
        </Header>
        <Content>
        <Form style={{ marginBottom: 70}}>
            <Item>
              <Input placeholder="Email" onChange={ (e) => this.handleInputChange(e, 'email')}/>
            </Item>
            <Item last >
              <Input placeholder="Password" secureTextEntry={true} onChange={ (e) => this.handleInputChange(e, 'password')}/>
            </Item>
          </Form>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10}}>
              <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={this.signIn}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Sign In</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }} onPress={this.signInWithGoogle}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Sign In With Google</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", width:200 }} onPress={() => this.props.navigation.navigate('Register')}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Register</Text>
            </View>
          </Button>
        </Content>        
    </Container>;
  }
}
