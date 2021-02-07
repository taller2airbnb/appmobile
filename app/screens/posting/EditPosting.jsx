import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Spinner, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3 } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import * as Google from 'expo-google-app-auth';
import Constants from 'expo-constants';
import {put, get} from '../../api/ApiHelper';
import moment from 'moment';
import CountryDropdown from '../../components/CountryDropdown';

export default class EditPosting extends React.Component {
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
                country:'AR',
                city: '',
                max_number_guests: 1
            },
          possibleFeatures: [],
          startDate: new Date(),
          endDate: new Date(),
          currentDate: new Date(),
          error: '',
          fetching: true
        }        
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
        this.updatePosting = this.updatePosting.bind(this);
        this.navigateToMyPostings = this.navigateToMyPostings.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
      }

      async componentDidMount(){
        this.getPosting();
        let featuresResponse = await get(Constants.manifest.extra.featuresEndpoint, this.props.screenProps.user.accessToken)
        if(featuresResponse.status == 200){
          let json = await featuresResponse.json();          
          this.setState({possibleFeatures: json.message.map(f => {return {...f, value: false}})})
        }else{
          let json = await featuresResponse.json();
          Alert.alert({error: json.message ?? 'Oops! Something went wrong.'})
        }
        this.updateFeatures();       
      }      

      async getPosting(){
        let postingResponse = await get(Constants.manifest.extra.postingEndpoint + '?idPosting=' + this.props.navigation.getParam('postingId'), this.props.screenProps.user.accessToken)
        if(postingResponse.status == 200){
          let json = await postingResponse.json();
          let {location, ...rest} = json.message[0];
          rest['latitude'] = location.x
          rest['longitude'] = location.y;          
          this.setState({formData: rest});
          this.setState({startDate: new Date(this.state.formData.start_date)})
          this.setState({endDate: new Date(this.state.formData.end_date)})
          this.setStartDate(this.state.startDate);
          this.setEndDate(this.state.endDate);
          this.setState({fetching: false})
        }else{
          let json = await postingResponse.json();          
          Alert.alert({error: json.message ?? 'Oops! Something went wrong.'})
        }
      }

      updateFeatures(){
        /* const selectedFeatureIds = this.state.formData.features.split(',');
        const updatedFeatures = this.state.possibleFeatures.map(x=> ({...x, value: selectedFeatureIds.includes(x.id_feature)}));
        this.setState({possibleFeatures: updatedFeatures}) */
      }

      componentDidUpdate(prevProps, prevState, snapshot){        
        if(prevProps.navigation.getParam('postingId') !== this.props.navigation.getParam('postingId')){          
          this.getPosting();
          this.updateFeatures();
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
        newFormData.start_date = moment(newDate).format('YYYY-MM-DD');
        this.setState({formData: newFormData});
        //this.setState({ startDate: newDate });
      }

      setEndDate(newDate) {
        let newFormData = {...this.state.formData}
        newFormData.end_date = moment(newDate).format('YYYY-MM-DD');        
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

      updatePosting = async() => {

        const features = this.state.possibleFeatures.filter(f => f.value).map(x=> x.id_feature).join(',');
        const data = {...this.state.formData, features: features}
        let response = await put(Constants.manifest.extra.postingEndpoint+ '/' +this.props.navigation.getParam('postingId'), data, this.props.screenProps.user.accessToken)
        if(response.status == 200){
          Alert.alert(
            "Posting Updated Successfully",
            "",
            [              
              { text: "OK", onPress: () => this.navigateToMyPostings() }
            ],
            { cancelable: false }
          );
          this.props.navigation.navigate('MyPostings', {refresh:true})
        }else{
          let json = await response.json();
          Alert.alert(json.message ?? 'Oops! Something went wrong.')          
        } 
      }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Edit Posting</Title>
          </Body>
        </Header>
        <Content>
        { this.state.fetching && <Spinner color='blue' />}
        { !this.state.fetching && 
        <><Form style={{marginBottom:20}}>
        <H3 style={{marginTop:20, marginLeft: 10}}>Provide Hosting Information:</H3>
            <Item>
              <Input placeholder="Hosting Name" value={this.state.formData.name} onChange={ (e) => this.handleInputChange(e, 'name')}/>
            </Item>
            <Item>
              <Input placeholder="Description" value={this.state.formData.content} onChange={ (e) => this.handleInputChange(e, 'content')}/>
            </Item>
            <Item>
              <CountryDropdown placeholder="Country" selected={this.state.formData.country} onValueChange={this.onCountryChange}/>
            </Item>
            <Item>
              <Input placeholder="City" value={this.state.formData.city} onChange={ (e) => this.handleInputChange(e, 'city')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Location Latitude</H3>
            <Item>
              <Input label='Latitude' placeholder="Latitude" keyboardType='numeric' value={this.state.formData.latitude.toString()} onChange={ (e) => this.handleNumberChange(e, 'latitude')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Location Longitude</H3>
            <Item>
              <Input label='Longitude' placeholder="Longitude" keyboardType='numeric' value={this.state.formData.longitude.toString()} onChange={ (e) => this.handleNumberChange(e, 'longitude')}/>
            </Item>
            <H3 style={{marginTop:20, marginLeft: 10}}>Maximum Number of Guests</H3>
            <Item>
              <Input label='Number Of Guests' placeholder="Number Of Guests" keyboardType='numeric' value={this.state.formData.max_number_guests.toString()} onChange={ (e) => this.handleNumberChange(e, 'max_number_guests')}/>
            </Item>
            {/* <H3 style={{marginTop:20, marginLeft: 10}}>Provide Price Per Day (ETH):</H3>
            <Item>
              <Input label='Price per day' placeholder="ETH" keyboardType='numeric' value={this.state.formData.price_day.toString()} onChange={ (e) => this.handleNumberChange(e, 'price_day')}/>
            </Item> */} 
        <H3 style={{marginTop:20, marginLeft: 10}}>Posting validity period:</H3>
        <Content padder style={{ backgroundColor: "#fff" }}>
          <DatePicker
            defaultDate={this.state.startDate}
            minimumDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            maximumDate={new Date(this.state.currentDate.getFullYear() + 1, this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            locale={"en"}
            formatChosenDate={date => {return moment(date).format('YYYY-MM-DD');}}
            timeZoneOffsetInMinutes={undefined}
            modalTransparent={false}
            animationType={"fade"}
            androidMode={"default"}
            //placeHolderText="Select Start Date"
            textStyle={{ color: "green" }}
            onDateChange={this.setStartDate}
          />
        </Content>
        <Content padder style={{ backgroundColor: "#fff" }}>
          <DatePicker
            defaultDate={this.state.endDate}
            minimumDate={new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            maximumDate={new Date(this.state.currentDate.getFullYear() + 1, this.state.currentDate.getMonth(), this.state.currentDate.getDate())}
            locale={"en"}
            timeZoneOffsetInMinutes={undefined}
            formatChosenDate={date => {return moment(date).format('YYYY-MM-DD');}}
            modalTransparent={false}
            animationType={"fade"}
            androidMode={"default"}
            //placeHolderText="Select End Date"
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
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }}onPress={this.updatePosting}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Update Posting</Text>
            </View>
          </Button></>
        }
        
        </Content>
    </Container>;
  }
}
