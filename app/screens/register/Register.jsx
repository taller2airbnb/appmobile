import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Picker, View } from 'native-base';

import React from "react";
import * as Google from 'expo-google-app-auth';

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                email: '',
                password: '',
                alias: '',
                first_name: '',
                last_name: '',
                national_id: '',
                national_id_type: '',  
                profile: 2
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
    if(this.state.formData.password.length < 8){
      this.setState({error: 'Password must be at least 8 characters long.'})
      return false;
    }
    return true;
  }

   register = async() => {
    this.setState({error: ''})
    if(!this.validForm()){
      return;
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.formData)
    };

    let response = await fetch('https://taller2airbnb-profile.herokuapp.com/register/', requestOptions);
    
    if(response.status == 200){
        let json = await response.json();
        this.props.screenProps.handleLogIn(json);
        this.props.navigation.navigate('Home');
    }else{
        let json = await response.json();
        this.setState({error: json.Error ?? json.error})
    }
    
  }

  registerWithGoogle = async () => {
    this.setState({error: ''})
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
            body: JSON.stringify({token: result.accessToken, profile: this.state.formData.profile})
          };
      
          let response = await fetch('https://taller2airbnb-profile.herokuapp.com/google_auth/register', requestOptions);
          if(response.status == 200){
            let json = await response.json();
            this.props.screenProps.handleLogIn(json);
            this.props.navigation.navigate('Home');
        }else{
            let json = await response.json();
            this.setState({error: json.Error ?? json.error})
        }   
        } else {
            this.setState({error: 'Google Authentication Failed'})
        }
      } catch (e) {
        this.setState({error: 'Google Authentication Failed'})
      }
  }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title >Welcome to BookBnB, Please Register</Title>
          </Body>
        </Header>
        <Content>
        <Form style={{marginBottom:20}}>
            <Item>
              <Input placeholder="First Name" onChange={ (e) => this.handleInputChange(e, 'first_name')}/>
            </Item>
            <Item>
              <Input placeholder="Last Name" onChange={ (e) => this.handleInputChange(e, 'last_name')}/>
            </Item>
            <Item>
              <Input placeholder="User Name" onChange={ (e) => this.handleInputChange(e, 'alias')}/>
            </Item>
            <Item>
              <Input placeholder="Email" onChange={ (e) => this.handleInputChange(e, 'email')}/>
            </Item>
            <Item>
              <Input placeholder="Document Type" onChange={ (e) => this.handleInputChange(e, 'national_id_type')}/>
            </Item>
            <Item>
              <Input placeholder="Document Number" onChange={ (e) => this.handleInputChange(e, 'national_id')}/>
            </Item>
            <Item last style={{ marginBottom:10 }}>
              <Input placeholder="Password" secureTextEntry={true} onChange={ (e) => this.handleInputChange(e, 'password')}/>
            </Item>
            <Picker
              renderHeader={backAction =>
                <Header style={{ backgroundColor: "#f44242" }}>
                  <Left>
                    <Button transparent onPress={backAction}>
                      <Icon name="arrow-back" style={{ color: "#fff" }} />
                    </Button>
                  </Left>
                  <Body style={{ flex: 3 }}>
                    <Title style={{ color: "#fff" }}>Select your user type</Title>
                  </Body>
                  <Right />
                </Header>}
              mode="dropdown"
              style={{marginLeft: 10}}
              iosIcon={<Icon name="arrow-down" />}
              selectedValue={this.state.formData.profile}
              onValueChange={this.onValueChange.bind(this)}
            >
              <Picker.Item label="Guest" value="2" />
              <Picker.Item label="Host" value="1" />
            </Picker>
          </Form>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
              <Text style={{color:'red'}}>{this.state.error}</Text>
            </View>}
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={this.register}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Register</Text>
            </View>
          </Button>
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }} onPress={this.registerWithGoogle}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Register With Google</Text>
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
