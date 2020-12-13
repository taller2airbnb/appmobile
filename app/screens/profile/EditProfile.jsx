import { Container, Header, Title, Content, Body, Text, Button, View, Form, Item, H3, Input } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {post, get} from '../../api/ApiHelper';

export default class EditProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: this.props.screenProps.user.email,
            profile: {},
            formData: {
              //first_name: "",
              //last_name: "",
              //id: "",
              //national_id_type: "",
              //national_id: ""
            },
            error: '', 
            id: 0,
        }        
      }

    //obtengo datos del perfil para los defaults del form
    async componentDidMount(){
        let profileResponse = await get(Constants.manifest.extra.profileEndpoint, this.props.screenProps.user.accessToken)
        if(profileResponse.status == 200){
          let json = await profileResponse.json();          
          //busco el perfil cuyo mail matchee con el mio
          for (var i = 0; i < json.message.users.length; i++){
            if (json.message.users[i].email == this.props.screenProps.user.email){
                this.setState({profile: json.message.users[i]})
                this.setState({id: i})
            }
          }
        }else{
          let json = await profileResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }   
      }
      
    editProfile = async() => {
        this.setState({error: ''})
        //if(!this.validForm()){
        //  return;
        //}
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...this.state.formData, google_token: '', user_type: 'bookbnb'})
        };
    
        let response = await fetch(Constants.manifest.extra.profileEndpoint, requestOptions);
        
        if(response.status == 200){
            this.props.navigation.navigate('Login', {alertMessage: 'Profile edited Successfully'});        
        }else{
            let json = await response.json();
            this.setState({error: json.message ?? 'Oops! Something went wrong.'})
        }
      
    }

    setFormData = async() => {
        this.setState({testName: "bobo"})
    }

    handleInputChange = (event, property) => {
        let newState = { ...this.state};
        newState.formData[property] = event.nativeEvent.text;
        this.setState(newState);
    }

    validForm(){
        if(isNaN(this.state.formData.national_id)){
            this.setState({error: 'National id must be a number.'})
            return false;
        }
        return true;
    }

    edit = async() => {
        this.setState({error: ''})
        if(!this.validForm()){
          return;
        }
        //const requestOptions = {
        //  method: 'POST',
        //  headers: { 'Content-Type': 'application/json' },
        //  body: JSON.stringify({...this.state.formData, google_token: '', user_type: 'bookbnb'})
        //};
    
        //let response = await fetch(Constants.manifest.extra.registerEndpoint, requestOptions);
        
        //if(response.status == 200){
        //    this.props.navigation.navigate('Login', {alertMessage: 'Registered Successfully'});        
        //}else{
        //    let json = await response.json();
        //    this.setState({error: json.message ?? 'Oops! Something went wrong.'})
        //}
        {() => this.props.navigation.navigate("MyProfile")}
    }
    

    render() {
        return <Container>
            <Header>
                <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                    <Title>Edit Profile</Title>
                </Body>
            </Header>
            <Content>
                <Body>
                    <Form style={{marginBottom:20}}>
                        <H3 style={{marginTop:20, marginLeft: 10}}>First Name:</H3>
                        <Item>
                            <Input placeholder={this.state.profile.first_name} onChange={ (e) => this.handleInputChange(e, 'first_name')}/>
                        </Item>
                        <H3 style={{marginTop:20, marginLeft: 10}}>Last Name:</H3>
                        <Item>
                            <Input placeholder={this.state.profile.last_name} onChange={ (e) => this.handleInputChange(e, 'last_name')}/>
                        </Item>
                        <H3 style={{marginTop:20, marginLeft: 10}}>User Name:</H3>
                        <Item>
                            <Input placeholder={this.state.profile.alias} onChange={ (e) => this.handleInputChange(e, 'alias')}/>
                        </Item>
                        <H3 style={{marginTop:20, marginLeft: 10}}>National ID Type:</H3>
                        <Item>
                            <Input placeholder={this.state.profile.national_id_type} onChange={ (e) => this.handleInputChange(e, 'national_id_type')}/>
                        </Item>
                        <H3 style={{marginTop:20, marginLeft: 10}}>National ID number:</H3>
                        <Item>
                            <Input placeholder={this.state.profile.national_id} onChange={ (e) => this.handleInputChange(e, 'national_id')}/>
                        </Item>
                    </Form>
                    {(this.state.error !== '') && <View style={{flex:1,justifyContent: "center",alignItems: "center", marginBottom:10, marginRight:10, marginLeft: 10}}>
                        <Text style={{color:'red'}}>{this.state.error}</Text>
                    </View>}
                    <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={this.edit}>
                        <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                            <Text style={{color:'white'}}>Save changes</Text>
                        </View>
                    </Button>
                    <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={() => this.props.navigation.navigate("MyProfile")}>
                        <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                            <Text style={{color:'white'}}>Return to profile</Text>
                        </View>
                    </Button>
                    <Text>First name: {this.state.formData.first_name}</Text>
                    <Text>Last name: {this.state.formData.last_name}</Text>
                    <Text>User name: {this.state.formData.alias}</Text>
                    <Text>Document: {this.state.formData.national_id_type} {this.state.formData.national_id}</Text>
                </Body>
            </Content>
        </Container>;
    }
}
