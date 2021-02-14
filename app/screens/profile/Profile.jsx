import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, Spinner, Left } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {get} from '../../api/ApiHelper';
import {Alert} from 'react-native';
import {NavigationEvents} from 'react-navigation';

export default class MyProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.navigation.getParam('id', 'blank').toString(),  
            profile: {},
            error: '', 
            fetching: true,
        }        
    }

    async componentDidMount(){
        this.reloadProfile();
    }


  async reloadProfile(){
    let endpoint = Constants.manifest.extra.profileEndpoint + '/' + this.props.navigation.getParam('id', 'blank').toString()
    let profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
    if(profileResponse.status == 200){
      let json = await profileResponse.json();
      this.setState({profile: json.message})
      this.setState({id: json.message.id.toString})
      this.setState({error: ''});
    }else{
      let json = await profileResponse.json();
      this.setState({error: json.message ?? 'Oops! Something went wrong.'});
    } 
    this.setState({fetching: false})
  }
  
  componentDidUpdate(prevProps, prevState, snapshot){
    if(prevProps.navigation !== this.props.navigation){
        this.setState({fetching: true})
        this.setState({profile: {}})
        this.reloadProfile();
    }    
  }


  render() {
    return <Container>
      <NavigationEvents onDidFocus={() => this.reloadProfile()} />
      <Header>          
        <Left>
          <Button primary style={{ alignSelf: "center", width:80 }}onPress={() => this.props.navigation.navigate("Chat")}>
            <Text>Back</Text>
          </Button>
        </Left>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Profile</Title>
        </Body>
      </Header>
      <Content>
        {this.state.fetching && <Spinner color='blue' />}
        { !this.state.fetching && (<>
        <Body>
          {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
            <Text style={{color:'red'}}>{this.state.error}</Text>
          </View>}
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
        </Body>
        </>)}
      </Content>
    </Container>;
  }
}
