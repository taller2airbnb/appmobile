import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, View, TextInput } from 'native-base';

import React from "react";
import * as Google from 'expo-google-app-auth';
import { color } from 'react-native-reanimated';

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
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email: this.state.email, password: this.state.password})
  };

    let response = await fetch('https://taller2airbnb-profile.herokuapp.com/login/', requestOptions);
     
    if(response.status == 200){
      let json = await response.json();
      this.props.screenProps.handleLogIn(json);
      this.props.navigation.navigate('Home');
      }else{
      let json = await response.json();
      this.setState({error: json.Error ?? json.error})
  }
  }

  signInWithGoogle = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId:
        "266504353107-usdo5g4iii624bn9hrpo7aaa1t7qeh33.apps.googleusercontent.com",
        scopes: ["https://www.googleapis.com/auth/userinfo.profile", "email"]
      })
      
      if (result.type === "success") {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({token: result.accessToken})
        };
    
        let response = await fetch('https://taller2airbnb-profile.herokuapp.com/google_auth/login', requestOptions);
        if(response.status == 200){
          let json = await response.json();
          this.props.screenProps.handleLogIn(json);
          this.props.navigation.navigate('Home');
      }else{
          let json = await response.json();
          this.setState({error: json.Error ?? json.error})
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
