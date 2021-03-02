import { Container, Header, Title, Content, Footer, Card, CardItem, FooterTab, Button, Left, Spinner, Right, Body, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3, Segment } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {get, toQueryParams} from '../../api/ApiHelper';
import moment from 'moment';
import { Image } from 'react-native';

const postingImage = require("../../assets/degoas.png");

export default class MyBookings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          confirmedBookings: [],
          pendingBookings: [],
          error: '',
          fetching: true,
          activeTab: 'confirmed'
        }
      }

      async componentDidMount(){
        let pendingBookingsResponse = await get(Constants.manifest.extra.myBookingIntentsEndpoint, this.props.screenProps.user.accessToken)
        if(pendingBookingsResponse.status == 200){
          let json = await pendingBookingsResponse.json();          
          this.setState({pendingBookings: json.message})
        }else{
          let json = await pendingBookingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve pending bookings.'});
        }

        let confirmedBookingsResponse = await get(Constants.manifest.extra.myBookingsEndpoint, this.props.screenProps.user.accessToken)
        if(confirmedBookingsResponse.status == 200){
          let json = await confirmedBookingsResponse.json();          
          this.setState({confirmedBookings: json.message});          
        }else{
          let json = await confirmedBookingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve confirmed bookings.'});
        }

        if(confirmedBookingsResponse.status == 200 && pendingBookingsResponse.status == 200){
          const asyncconfirmedBookingsResponse = await Promise.all(this.state.confirmedBookings.map(async (i) => {
            let imagesResponse = await get(Constants.manifest.extra.imagesEndpoint + i.id_posting, this.props.screenProps.user.accessToken)
            if(imagesResponse.status == 200){
            let json = await imagesResponse.json();
            if(Array.isArray(json.message) && json.message.length > 0){              
            return {...i, image: {uri: json.message.map(x => x.url)[0]}}
          }else{
            return {...i, image: postingImage} 
          }          
        }else{       
          return {...i, image: postingImage}   
        }
          }));
          this.setState({confirmedBookings: asyncconfirmedBookingsResponse});

          const asyncpendingBookingsResponse = await Promise.all(this.state.pendingBookings.map(async (i) => {
            let imagesResponse = await get(Constants.manifest.extra.imagesEndpoint + i.id_posting, this.props.screenProps.user.accessToken)
            if(imagesResponse.status == 200){
            let json = await imagesResponse.json();
            if(Array.isArray(json.message) && json.message.length > 0){              
            return {...i, image: {uri:json.message.map(x => x.url)[0]}}
          }else{
            return {...i, image: postingImage} 
          }          
        }else{       
          return {...i, image: postingImage}   
        }
          }));
          this.setState({pendingBookings: asyncpendingBookingsResponse});
          this.setState({fetching: false})
        }
        
      }      

      goToBooking(id){
        this.props.navigation.navigate('Booking', {postingId: id});
      }      

  render() {
    return <Container>
        <Header hasSegment>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>My Bookings</Title>
          </Body>
        </Header>
        <Segment>
          <Button first active={this.state.activeTab === 'confirmed'} onPress={()=> this.setState({activeTab: 'confirmed'})}>
            <Text>Confirmed</Text>
          </Button>
          <Button last active={this.state.activeTab === 'pending'} onPress={()=> this.setState({activeTab: 'pending'})}>
            <Text>Pending</Text>
          </Button>
        </Segment>
        {this.state.activeTab === 'confirmed' && (
          <Content>
            { this.state.fetching && <Spinner color='blue' />}
            { !this.state.fetching && this.state.confirmedBookings.map((booking,index) => (
             <ListItem key={'posting-' + booking.id_posting + '_' +index} button 
            onPress={()=> this.goToBooking(booking.id_posting)}>
            <Card style={{flex: 1}}>
            <CardItem style={{flex: 1}}>
              <Left>                
                <Body>
                  <Text style={{fontSize:22}}>{booking.name}</Text>                  
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Body>
                <Image source={booking.image ?? postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />                
              </Body>
            </CardItem>
            <CardItem>
              <Left>
                <Text>From: {moment.utc(Date.parse(booking.start_date)).format('YYYY-MM-DD')}</Text>
                <Text>To: {moment.utc(Date.parse(booking.end_date)).format('YYYY-MM-DD')}</Text>                
              </Left>
            </CardItem>
          </Card>
          </ListItem> ))}
            {!this.state.fetching && this.state.confirmedBookings.length === 0 && 
            <Content>
            <View style={{flex:1,justifyContent: "center",alignItems: "center", marginTop:20}}>
                <Text style={{fontSize:22}}> No confirmed bookings found.</Text>
            </View>
            <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:20, width:200 }}onPress={()=> this.setState({activeTab: 'pending'})}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                <Text style={{color:'white'}}>Go To Pending</Text>
              </View>
            </Button>
            </Content>
            }
          </Content>
        )}
        {this.state.activeTab === 'pending' && (
          <Content>            
            { this.state.fetching && <Spinner color='blue' />}
            { !this.state.fetching && this.state.pendingBookings.map((booking,index) => (
             <ListItem key={'posting-' + booking.id_posting + '_' + index} button 
            onPress={()=> this.goToBooking(booking.id_posting)}>
            <Card style={{flex: 1}}>
            <CardItem style={{flex: 1}}>
              <Left>                
                <Body>
                  <Text style={{fontSize:22}}>{booking.name}</Text>
                  <Text note style={{color: 'red', fontSize:17}}>Reservation Pending</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Body>
                <Image source={booking.image ?? postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />                
              </Body>
            </CardItem>
            <CardItem>
              <Left>
                <Text style={{fontSize:17}}>From: {moment.utc(Date.parse(booking.start_date)).format('YYYY-MM-DD')}</Text>
                <Text style={{fontSize:17}}>To: {moment.utc(Date.parse(booking.end_date)).format('YYYY-MM-DD')}</Text>                
              </Left>
            </CardItem>
          </Card>
          </ListItem> ))}
          {!this.state.fetching && this.state.pendingBookings.length === 0 && 
            <Content>
            <View style={{flex:1,justifyContent: "center",alignItems: "center", marginTop:20}}>
                <Text style={{fontSize:22}}>No pending bookings found.</Text>
            </View>
            <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:20, width:200 }}onPress={()=> this.setState({activeTab: 'confirmed'})}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                <Text style={{color:'white'}}>Go To Confirmed</Text>
              </View>
            </Button>
            </Content>
            }
        </Content>
        )}
        
    </Container>;
  }
}