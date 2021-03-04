import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Picker, View } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {put} from '../../api/ApiHelper';


export default class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                email: '',
                token: '',
                password: '',
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
    if(this.state.formData.password.length < 8){
      this.setState({error: 'Password must be at least 8 characters long.'})
      return false;
    }
    return true;
  }

  passwordChange = async() => {
    this.setState({error: ''})
    if(!this.validForm()){
        return;
    }
    const body = {new_password: this.state.formData.password, token: this.state.formData.token}
    let endpoint = Constants.manifest.extra.profileEndpoint + '/' + this.state.formData.email + '/password/';
    let response = await put(endpoint, body)
    if(response.status == 200){
        this.setState({error: 'Password successfully changed.'})
        this.props.navigation.navigate('Login', {alertMessage: 'Password successfully changed.'});   
    }else{
        let json = await response.json();
        this.setState({error: json.message ?? 'Oops! Something went wrong.'})
    }
  }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title >Please enter token and new password.</Title>
          </Body>
        </Header>
        <Content>
        <Form style={{marginBottom:20}}>
            <Item last style={{ marginBottom:10 }}>
              <Input placeholder="Email" onChange={ (e) => this.handleInputChange(e, 'email')}/>
            </Item>
            <Item last style={{ marginBottom:10 }}>
              <Input placeholder="Token" onChange={ (e) => this.handleInputChange(e, 'token')}/>
            </Item>
            <Item last style={{ marginBottom:10 }}>
              <Input placeholder="Password" secureTextEntry={true} onChange={ (e) => this.handleInputChange(e, 'password')}/>
            </Item>
          </Form>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
              <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10, borderRadius: 30 }} onPress={this.passwordChange}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Change Password</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('Password')}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Get token</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", width:200, marginBottom:10, borderRadius: 30 }} onPress={() => this.props.navigation.navigate('Login')}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Sign In</Text>
            </View>
          </Button>
        </Content>
    </Container>;
  }
}