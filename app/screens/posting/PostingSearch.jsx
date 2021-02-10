import { Container, Header, Title, Content, Footer, Card, CardItem, FooterTab, Button, Left, Spinner, Right, Body, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3, Segment } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {get, toQueryParams} from '../../api/ApiHelper';
import moment from 'moment';
import { Image } from 'react-native';
import * as Location from 'expo-location';
import  * as Permissions from 'expo-permissions';
import CountryDropdown from '../../components/CountryDropdown';
import CitiesDropdown from '../../components/CitiesDropdown';

const postingImage = require("../../assets/degoas.png");

export default class PostingSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          postings: [],
          possibleFeatures: [],
          currentDate: new Date(),
          error: '',
          fetching: true,
          activeTab: 'filters',
          covidWarn: undefined,
          filtersForm: {
            priceMin: null,
            priceMax: null,
            startDate: null,
            endDate: null,
            feature:'',            
            max_number_guests: 2,
            latitude: null,
            longitude: null
          },
          dropdowns: {
            country:'AR',
            city: ''
          }         
        } 
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
        this.applyFilters = this.applyFilters.bind(this);    
        this.getNearbyPostings = this.getNearbyPostings.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);      
        this.onCityChange = this.onCityChange.bind(this); 
        this.handleNumberChange = this.handleNumberChange.bind(this);
      }

      async componentDidMount(){
        let featuresResponse = await get(Constants.manifest.extra.featuresEndpoint, this.props.screenProps.user.accessToken)
        if(featuresResponse.status == 200){
          let json = await featuresResponse.json();
          this.setState({possibleFeatures: json.message.map(f => {return {...f, value: false}})})
        }else{
          let json = await featuresResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve features.'});
        }

        let postingsResponse = await get(Constants.manifest.extra.postingEndpoint, this.props.screenProps.user.accessToken)
        if(postingsResponse.status == 200){
          let json = await postingsResponse.json();
          this.setState({postings: json.message})
          this.setState({fetching: false})
        }else{
          let json = await postingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve postings.'});
        }        
      }

      async requestLocationPermissions(){
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {          
          return false;
        }        
        return true;
      }      

      async getNearbyPostings(){
        let perms = await this.requestLocationPermissions();
        if(perms){
          let location = await Location.getCurrentPositionAsync().catch(function() {
            Alert.alert('Could not retrieve Location');
          });
          if(location){            
            this.setState({fetching: true})
            this.setState({activeTab: 'results'});
            let params = toQueryParams({MyLatitude: location.coords.latitude, MyLongitude: location.coords.longitude, numberPostings: 10});            
            let postingsResponse = await get(Constants.manifest.extra.postingEndpoint + '/nearbyHotels' + params, this.props.screenProps.user.accessToken)
        if(postingsResponse.status == 200){
          let json = await postingsResponse.json();
          this.setState({postings: json.message})
          this.setState({fetching: false})
        }else{
          let json = await postingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve postings.'});
        }
          }else{
            Alert.alert('Could not retrieve Location');
          }
        }
      }

      goToBooking(id){
        this.props.navigation.navigate('Booking', {postingId: id});
      }

      toggleCheckbox(index) {
        let newState = { ...this.state};
        newState.possibleFeatures[index].value = !this.state.possibleFeatures[index].value;
        this.setState(newState);
      }

      handlePriceChange = (event, attribute) => {
        let newState = { ...this.state};
        newState.filtersForm[attribute] = event.nativeEvent.text ? Number(event.nativeEvent.text) : null;
        this.setState(newState);
      }

      async applyFilters() {
        this.setState({fetching: true})
        this.setState({activeTab: 'results'})
        const features = this.state.possibleFeatures.filter(f => f.value).map(x=> x.id_feature).join(',');
        const data = {...this.state.filtersForm, feature: features}
        let params = toQueryParams(data);
        
        let postingsResponse = await get(Constants.manifest.extra.postingEndpoint + '/search' + params, this.props.screenProps.user.accessToken)
        if(postingsResponse.status == 200){
          let json = await postingsResponse.json();
          this.setState({postings: json.message})
          this.setState({fetching: false})
        }else{
          let json = await postingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve postings.'});
        }
      }

      setStartDate(newDate) {
        let newFormData = {...this.state.filtersForm}        
        newFormData.startDate = moment(newDate).format('YYYY-MM-DD');
        this.setState({filtersForm: newFormData});
        
      }

      setEndDate(newDate) {
        let newFormData = {...this.state.filtersForm}        
        newFormData.endDate = moment(newDate).format('YYYY-MM-DD');
        this.setState({filtersForm: newFormData});        
      }

      getCovidWarning = async () => {
        let covidResponse = await get(Constants.manifest.extra.covidWarnEndpoint + encodeURIComponent(this.state.dropdowns.country))
        if(covidResponse.status == 200){
          let json = await covidResponse.json();
          this.setState({covidWarn: json})
        }
      }

      onCountryChange(value) {
        let newState = { ...this.state};
        newState.dropdowns.country = value;
        newState.covidWarn = undefined;
        this.setState({
            newState
        });
        this.getCovidWarning()
      }

      onCityChange(value) {
        let newState = { ...this.state};
        newState.filtersForm.latitude = value ? value.latitude : 0;
        newState.filtersForm.longitude = value ? value.longitude : 0;
        newState.dropdowns.city = value ? value.name : ''
        this.setState({
            newState
        });
      }

      handleNumberChange = (event, property) => {
        let newState = { ...this.state};
        newState.filtersForm[property] = Number(event.nativeEvent.text);
        this.setState(newState);
      }

  render() {
    return <Container>
        <Header hasSegment>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Search Postings</Title>
          </Body>
        </Header>
        <Segment>
          <Button first active={this.state.activeTab === 'filters'} onPress={()=> this.setState({activeTab: 'filters'})}>
            <Text>Filter</Text>
          </Button>
          <Button last active={this.state.activeTab === 'results'} onPress={()=> this.setState({activeTab: 'results'})}>
            <Text>Results</Text>
          </Button>
        </Segment>
        {this.state.activeTab === 'filters' && (
          <Content>
        <Content style={{borderWidth: 4, borderColor: "#3F51B5", margin: 5, borderRadius: 6}}>
        <H3 style={{marginTop:20, marginLeft: 10}}>Select Country:</H3>
        <Item>
              <CountryDropdown placeholder="Country" selected={this.state.dropdowns.country} onValueChange={this.onCountryChange}/>
        </Item>
        <Item>
          <CitiesDropdown placeholder="City" selected={this.state.dropdowns.city} selectedCountryCode={this.state.dropdowns.country} onValueChange={this.onCityChange}/>
        </Item>        
        <Content padder style={{ backgroundColor: "#fff"}}>
        <Text>Check In</Text>
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
            placeHolderText="Select Check In Date"
            textStyle={{ color: "green" }}
            onDateChange={this.setStartDate}
          />
        </Content>
        <Content padder style={{ backgroundColor: "#fff", display:'flex' }}>
          <Text>Check Out</Text>
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
            placeHolderText="Select Check Out Date"
            textStyle={{ color: "green" }}
            onDateChange={this.setEndDate}
          />
        </Content>
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
        <H3 style={{marginTop:20, marginLeft: 10}}>Select Number of Guests:</H3>
        <Item>
          <Input label='Number Of Guests' placeholder="Number Of Guests" keyboardType='numeric' value={this.state.filtersForm.max_number_guests.toString()} onChange={ (e) => this.handleNumberChange(e, 'max_number_guests')}/>
        </Item>        
        <H3 style={{marginTop:20, marginLeft: 10}}>Filter By Price:</H3>
        <Item>
              <Input label='Min Price per day' placeholder="Min Price (ETH)" keyboardType='numeric' onChange={ (e) => this.handlePriceChange(e, 'priceMin')}/>
        </Item>
        <Item>
              <Input label='Max Price per day' placeholder="Max Price (ETH)" keyboardType='numeric' onChange={ (e) => this.handlePriceChange(e, 'priceMax')}/>
        </Item>
        
        <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:10, width:200 }}onPress={this.applyFilters}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Apply Filters</Text>
            </View>
          </Button>

          <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:10, width:200 }}onPress={this.getNearbyPostings}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Hosts Near Me</Text>
            </View>
          </Button>
          </Content>
        )}
        {this.state.activeTab === 'results' && (
          <Content>            
            { this.state.fetching && <Spinner color='blue' />}
            { this.state.covidWarn && 
            <Content style={{borderWidth: 4, 
            borderColor: this.state.covidWarn.Color == "Yellow" ? "#ffff00" : 
            this.state.covidWarn.Color == "Green" ? "#008000" :
            this.state.covidWarn.Color == "Orange" ? "#ffa500" : "#ff0000", margin: 10, padding: 10, borderRadius: 6}}>
              <Text style={{fontWeight: 'bold'}}>Covid Status: {this.state.covidWarn.Message}</Text>
            </Content>}
            { !this.state.fetching && this.state.postings.map((posting,index) => (
             <ListItem key={'posting-' + posting.id_posting} button 
            onPress={()=> this.goToBooking(posting.id_posting)}>
            <Card style={{flex: 1}}>
            <CardItem style={{flex: 1}}>
              <Left>                
                <Body>
                  <Text>{posting.name}</Text>
                  <Text note>Available up to {posting.end_date}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Body>
                <Image source={postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />
                <Text>
                  {posting.content}
                </Text>
              </Body>
            </CardItem>
            <CardItem>
              <Left>                  
                <Text style={{color: 'red'}}>ETH {posting.price_day} per day</Text>                
              </Left>
            </CardItem>
          </Card>
          </ListItem> ))}
        </Content>
        )}
        
    </Container>;
  }
}