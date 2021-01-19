import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3 } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import * as Google from 'expo-google-app-auth';
import Constants from 'expo-constants';
import {post, get} from '../../api/ApiHelper';
import moment from 'moment';
import CountryDropdown from '../../components/CountryDropdown';

export default class Posting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                price_day: 0,
                start_date: '',
                end_date: '',                
                public: true,
                state:'',
                content: "",
                name: '',
                latitude: 0,
                longitude:0,
                country:'Argentina',
                city: '',
                max_number_guests: 1
            },
          possibleFeatures: [],
          startDate: new Date(),
          endDate: new Date(),
          currentDate: new Date(),
          error: ''
        }        
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
        this.createPosting = this.createPosting.bind(this);
        this.navigateToMyPostings = this.navigateToMyPostings.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
      }

      async componentDidMount(){
        let featuresResponse = await get(Constants.manifest.extra.featuresEndpoint, this.props.screenProps.user.accessToken)
        if(featuresResponse.status == 200){
          let json = await featuresResponse.json();          
          this.setState({possibleFeatures: json.message.map(f => {return {...f, value: false}})})
        }else{
          let json = await featuresResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }   
      }

      navigateToMyPostings = () => {
        this.props.navigation.navigate('MyPostings');
      }

      handleInputChange = (event, property) => {
        let newState = { ...this.state};
        newState.formData[property] = event.nativeEvent.text;
        this.setState(newState);
      }

      handleNumberChange = (event, property) => {
        let newState = { ...this.state};
        newState.formData[property] = Number(event.nativeEvent.text);
        this.setState(newState);
      }

      setStartDate(newDate) {
        let newFormData = {...this.state.formData}
        //newFormData.start_date = newDate.getFullYear() + '-' + newDate.getMonth() + '-' + newDate.getDate()
        newFormData.start_date = moment(newDate).format('YYYY-MM-DD');
        this.setState({formData: newFormData});
        //this.setState({ startDate: newDate });
      }

      setEndDate(newDate) {
        let newFormData = {...this.state.formData}
        newFormData.end_date = moment(newDate).format('YYYY-MM-DD');
        //newFormData.end_date = newDate.getFullYear() + '-' + newDate.getMonth() + '-' + newDate.getDate()
        this.setState({formData: newFormData});
        //this.setState({ endDate: newDate });
      }
    
      onCountryChange(value) {
        let newState = { ...this.state};
        newState.formData.country = value;
        this.setState({
            newState
        });
      }

      toggleCheckbox(index) {
        let newState = { ...this.state};
        newState.possibleFeatures[index].value = !this.state.possibleFeatures[index].value;
        this.setState(newState);
      }

      createPosting = async() => {

        const features = this.state.possibleFeatures.filter(f => f.value).map(x=> x.id_feature).join(',');
        const data = {...this.state.formData, features: features}
        let response = await post(Constants.manifest.extra.postingEndpoint, data, this.props.screenProps.user.accessToken)
        if(response.status == 200){
          Alert.alert(
            "Posting Created Successfully",
            "",
            [              
              { text: "OK", onPress: () => this.navigateToMyPostings() }
            ],
            { cancelable: false }
          );
          this.props.navigation.navigate('MyPostings')
        }else{
          let json = await response.json();
          Alert.alert(json.message ?? 'Oops! Something went wrong.')
          //this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        } 
      }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Create Posting</Title>
          </Body>
        </Header>
        <Content>        
        <Form style={{marginBottom:20}}>
        <H3 style={{marginTop:20, marginLeft: 10}}>Provide Hosting Information:</H3>
            <Item>
              <Input placeholder="Hosting Name" onChange={ (e) => this.handleInputChange(e, 'name')}/>
            </Item>
            <Item>
              <Input placeholder="Description" onChange={ (e) => this.handleInputChange(e, 'content')}/>
            </Item>
            <Item>
              <CountryDropdown placeholder="Country" selected={this.state.formData.country} onValueChange={this.onCountryChange}/>
            </Item>
            <Item>
              <Input placeholder="City" onChange={ (e) => this.handleInputChange(e, 'city')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Location Latitude</H3>
            <Item>
              <Input label='Latitude' placeholder="Latitude" keyboardType='numeric' onChange={ (e) => this.handleNumberChange(e, 'latitude')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Location Longitude</H3>
            <Item>
              <Input label='Longitude' placeholder="Longitude" keyboardType='numeric' onChange={ (e) => this.handleNumberChange(e, 'longitude')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Maximum Number of Guests</H3>
            <Item>
              <Input label='Number Of Guests' placeholder="Number Of Guests" keyboardType='numeric' onChange={ (e) => this.handleNumberChange(e, 'max_number_guests')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Provide Price Per Day (ETH):</H3>
            <Item>
              <Input label='Price per day' placeholder="ETH" keyboardType='numeric' onChange={ (e) => this.handleNumberChange(e, 'price_day')}/>
            </Item> 
        <H3 style={{marginTop:20, marginLeft: 10}}>Posting validity period:</H3>
        <Content padder style={{ backgroundColor: "#fff" }}>
          <DatePicker
            defaultDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            minimumDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            maximumDate={new Date(this.state.currentDate.getFullYear() + 1, this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            locale={"en"}
            formatChosenDate={date => {return moment(date).format('YYYY-MM-DD');}}
            timeZoneOffsetInMinutes={undefined}
            modalTransparent={false}
            animationType={"fade"}
            androidMode={"default"}
            placeHolderText="Select Start Date"
            textStyle={{ color: "green" }}
            onDateChange={this.setStartDate}
          />
        </Content>
        <Content padder style={{ backgroundColor: "#fff" }}>
          <DatePicker
            defaultDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            minimumDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            maximumDate={new Date(this.state.currentDate.getFullYear() + 1, this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            locale={"en"}
            timeZoneOffsetInMinutes={undefined}
            formatChosenDate={date => {return moment(date).format('YYYY-MM-DD');}}
            modalTransparent={false}
            animationType={"fade"}
            androidMode={"default"}
            placeHolderText="Select End Date"
            textStyle={{ color: "green" }}
            onDateChange={this.setEndDate}
          />
        </Content>
        <Content>
        {this.state.possibleFeatures.length > 0 && <H3 style={{marginTop:20, marginLeft: 10}}>Select Features:</H3>}
        {this.state.possibleFeatures.length > 0 && this.state.possibleFeatures.map((f,index) => (<ListItem key={this.state.possibleFeatures[index].name} button onPress={() => this.toggleCheckbox(index)}>
            <CheckBox
              checked={this.state.possibleFeatures[index].value}
              onPress={() => this.toggleCheckbox(index)}
            />
            <Body>
                <Text>{f.name}</Text>
            </Body>
          </ListItem>))}          
        </Content>
          </Form>
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={this.createPosting}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Create Posting</Text>
            </View>
          </Button>
        </Content>
    </Container>;
  }
}
