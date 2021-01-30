import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {get} from '../../api/ApiHelper';
import {Alert} from 'react-native';
import {NavigationEvents} from 'react-navigation';

export default class MyProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.screenProps.user.email,
      profile: {},
      error: '', 
      }        
  }

  async componentDidMount(){
    this.reloadProfile();
  }


  async reloadProfile(){
    let endpoint = Constants.manifest.extra.profileEndpoint + '/' + this.props.screenProps.user.id
    let profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
    if(profileResponse.status == 200){
      let json = await profileResponse.json();
      this.setState({profile: json.message})
    }else{
      let json = await profileResponse.json();
      this.setState({error: json.message ?? 'Oops! Something went wrong.'});
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


  render() {
    return <Container>
      <NavigationEvents onDidFocus={() => this.reloadProfile()} />
      <Header>
      <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
        <Title>My Profile</Title>
      </Body>
      </Header>
      <Content>
        <Body>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
            <Text style={{color:'red'}}>{this.state.error}</Text>
          </View>}
          <Text></Text>
          <Text></Text>
          <Row>
            <Col><H3 style={{marginTop:10, marginLeft: 30, marginBottom:10}}>Name</H3></Col>
            <Col><Text style={{marginTop:7}}>{this.state.profile.first_name + ' ' + this.state.profile.last_name}</Text></Col>
          </Row>
          <Row>
            <Col><H3 style={{marginTop:10, marginLeft: 30, marginBottom:10}}>Username</H3></Col>
            <Col><Text style={{marginTop:7}}>{this.state.profile.alias}</Text></Col>
          </Row>
          <Row>
            <Col><H3 style={{marginTop:10, marginLeft: 30, marginBottom:10}}>Email</H3></Col>
            <Col><Text style={{marginTop:7}}>{this.state.profile.email}</Text></Col>
          </Row>
          <Row>
            <Col><H3 style={{marginTop:10, marginLeft: 30, marginBottom:10}}>Document Id</H3></Col>
            <Col><Text style={{marginTop:7}}>{this.state.profile.national_id_type} {this.state.profile.national_id}</Text></Col>
          </Row>
          <Text></Text>
          <Text></Text>
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={() => this.props.navigation.navigate("EditProfile")}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Edit profile</Text>
            </View>
          </Button>
        </Body>
      </Content>
    </Container>;
  }
}
