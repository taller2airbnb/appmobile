import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Picker, View } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import * as Google from 'expo-google-app-auth';
import Constants from 'expo-constants';
import {post} from '../../api/ApiHelper';


export default class Password extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                email: '',
            },
          error: ''
        }        
      }

  handleInputChange = (event, property) => {
    let newState = { ...this.state};
    newState.formData[property] = event.nativeEvent.text;
    this.setState(newState);
  }

  onValueChange(value) {
    let newState = { ...this.state};
    newState.formData.profile = value;
    this.setState({
        newState
    });
  }

  validForm(){
    if(this.state.formData.email == ''){
      this.setState({error: 'Enter a valid email.'})
      return false;
    }
    return true;
  }

  sendToken = async() => {
    this.setState({error: ''})
    if(!this.validForm()){
        return;
    }
    let endpoint = Constants.manifest.extra.recoverPasswordEndpoint + this.state.formData.email;
    let body = {};
    let response = await post(endpoint, body, this.props.screenProps.user.accessToken)
    if(response.status == 200){
        this.setState({error: 'Token successfully sent.'})
        this.props.navigation.navigate('Login', {alertMessage: 'Token successfully sent to your email.'});    
    }else{
        let json = await response.json();
        this.setState({error: json.message ?? 'Oops! Something went wrong.'})
    }
  }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title >Please enter your email.</Title>
          </Body>
        </Header>
        <Content>
        <Form style={{marginBottom:20}}>
            <Item last style={{ marginBottom:10 }}>
              <Input placeholder="Email" onChange={ (e) => this.handleInputChange(e, 'email')}/>
            </Item>
          </Form>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
              <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10 }} onPress={this.sendToken}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Get token</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10 }} onPress={() => this.props.navigation.navigate('ChangePassword')}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Use token</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10 }} onPress={() => this.props.navigation.navigate('Login')}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Sign In</Text>
            </View>
          </Button>
        </Content>
    </Container>;
  }
}
