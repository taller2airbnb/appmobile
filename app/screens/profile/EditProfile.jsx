import { Container, Header, Title, Content, Body, Text, Button, View, Form, Item, H3, Input } from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {put, get} from '../../api/ApiHelper';
import {NavigationEvents} from 'react-navigation';

export default class EditProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: this.props.screenProps.user.email,
            profile: {},
            formData: {
                //first_name: "",
                //last_name: "",
                //national_id_type: "",
                //national_id: ""
            },
            error: '', 
            id: 0,
        }        
      }

    //obtengo datos del perfil para los defaults del form
    async componentDidMount(){
        this.getProfile()
    }
    
    async getProfile(){
        let endpoint = Constants.manifest.extra.profileEndpoint + '/' + this.props.screenProps.user.id
        let profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
        if(profileResponse.status == 200){
          let json = await profileResponse.json();
          this.setState({profile: json.message})
          this.setState({id: this.state.profile.id})
          this.setState({formData:{id: this.state.profile.id}})
        }else{
          let json = await profileResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        } 

    }


    handleInputChange = (event, property) => {
        let newState = { ...this.state};
        newState.formData[property] = event.nativeEvent.text;
        this.setState(newState);
    }

    validForm(){
        if((this.state.formData.national_id) && (isNaN(this.state.formData.national_id))){
            this.setState({error: 'National ID must be a number.'})
            return false;
        }
        return true;
    }

    edit = async() => {
        this.setState({error: ''})
        if(!this.validForm()){
            return;
        }
        //this.setState({formData,id: this.state.profile.id})
        const body = {...this.state.formData}
        let response = await put(Constants.manifest.extra.profileEndpoint, body, this.props.screenProps.user.accessToken)
        if(response.status == 200){
            this.props.navigation.navigate('MyProfile', {alertMessage: 'Changes saved successfully.'});        
        }else{
            let json = await response.json();
            this.setState({error: json.message ?? 'Oops! Something went wrong.'})
        }
    }
    

    render() {
        return <Container>
            <NavigationEvents onDidFocus={() => this.getProfile()} />
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
                    <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, borderRadius: 30 }}onPress={this.edit}>
                        <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                            <Text style={{color:'white'}}>Save changes</Text>
                        </View>
                    </Button>
                    <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, borderRadius: 30 }}onPress={() => this.props.navigation.navigate("MyProfile")}>
                        <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                            <Text style={{color:'white'}}>Return to profile</Text>
                        </View>
                    </Button>
                </Body>
            </Content>
        </Container>;
    }
}
