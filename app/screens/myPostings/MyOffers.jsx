import { Container, Header, Title, Content, Body, Spinner, CardItem, Card, Left, ListItem, Text, Button, View } from 'native-base';
import React from "react";
import {get, post} from '../../api/ApiHelper';
import Constants from 'expo-constants';
import { Image, Alert } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import moment from 'moment';

const postingImage = require("../../assets/degoas.png");

class MyOffers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                offers:[],
                fetching: true
        }
        this.rejectOffer = this.rejectOffer.bind(this)
        this.acceptOffer = this.acceptOffer.bind(this)
      }

      async getOffers(){
        let offersResponse = await get(Constants.manifest.extra.myOffersEndpoint, this.props.screenProps.user.accessToken)
        if(offersResponse.status == 200){
          let json = await offersResponse.json();          
          const postingsWithImagesResponse = await Promise.all(json.message.map(async (i) => {
            let imagesResponse = await get(Constants.manifest.extra.imagesEndpoint + i.id_posting, this.props.screenProps.user.accessToken)
            if(imagesResponse.status == 200){
            let jsonImg = await imagesResponse.json();
            if(Array.isArray(jsonImg.message) && jsonImg.message.length > 0){              
            return {...i, image: {uri: jsonImg.message.map(x => x.url)[0]}}
          }else{
            return {...i, image: postingImage} 
          }          
        }else{       
          return {...i, image: postingImage}   
        }
          }));
          this.setState({offers: postingsWithImagesResponse})          
          this.setState({fetching: false})
        }else{
          let json = await postingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve postings.'});
        }
      }

      async componentDidMount(){
        this.getOffers()
      }      

      componentDidUpdate(prevProps, prevState, snapshot){        
        if(prevProps.navigation !== this.props.navigation){
          if(this.props.navigation.getParam('refresh')){
            this.setState({fetching: true})
            this.getOffers();
            this.props.navigation.setParams({refresh: false})
          }          
        }  
        if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused) {          
          this.setState({fetching: true})
          this.getOffers();
        } 
      }

      async acceptOffer(transactionHash, index){
        const body = {transactionHash: transactionHash}        
        let response = await post(Constants.manifest.extra.acceptBookingEndpoint, body, this.props.screenProps.user.accessToken)
        if(response.status == 200){
            Alert.alert(
                "Offer Accepted Successfully.",
                "",
                [              
                  { text: "OK"}
                ],
                { cancelable: false }
              ); 
            let newOffers = this.state.offers.filter((_, i) => i !== index)
            this.setState({offers: newOffers})
              
        }else{
            let json = await response.json();
            Alert.alert(
                json.message ?? "Something went wrong. Please try again later.",
                "",
                [              
                  { text: "OK"}
                ]                
              ); 
        }
      }

      async rejectOffer(transactionHash, index){
        const body = {transactionHash: transactionHash}          
        let response = await post(Constants.manifest.extra.rejectBookingEndpoint, body, this.props.screenProps.user.accessToken)
        if(response.status == 200){
            Alert.alert(
                "Offer Rejected Successfully.",
                "",
                [              
                  { text: "OK"}
                ]
              ); 
            let newOffers = this.state.offers.filter((_, i) => i !== index)
            this.setState({offers: newOffers})
        }else{
            let json = await response.json();           
            Alert.alert(
                json.message ?? "Something went wrong. Please try again later.",
                "",
                [              
                  { text: "OK"}
                ]                
              ); 
        }
      }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>My Offers</Title>
          </Body>
        </Header>
        <Content>            
            { this.state.fetching && <Spinner color='blue' />}
            { !this.state.fetching && this.state.offers.map((offer,index) => (
             <ListItem key={'posting-' + offer.id_posting + '_' + index}>
            <Card style={{flex: 1}}>
            <CardItem style={{flex: 1}}>
              <Left>                
                <Body>
                  <Text>{offer.first_name_booker && offer.last_name_booker ? 'Offer from: ' + offer.first_name_booker + ' ' + offer.last_name_booker : ''}</Text>                  
                </Body>
              </Left>
            </CardItem>
            <CardItem>
              <Left>
                <Text>From: {moment.utc(Date.parse(offer.start_date)).format('YYYY-MM-DD')}</Text>
                <Text>To: {moment.utc(Date.parse(offer.end_date)).format('YYYY-MM-DD')}</Text>                
              </Left>
            </CardItem>
            <CardItem>
              <Body>
                <Image source={offer.image ?? postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />
                <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, marginTop:20,backgroundColor: "#00a000", borderRadius: 30 }} onPress={() => this.acceptOffer(offer.transaction_booking, index)}>
                    <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                        <Text style={{color:'white'}}>Accept</Text>
                    </View>
                </Button>
                <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, marginTop:10,backgroundColor: "#C83200", borderRadius: 30 }} onPress={() => this.rejectOffer(offer.transaction_booking, index)}>
                    <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                        <Text style={{color:'white'}}>Reject</Text>
                    </View>
                </Button>
              </Body>
            </CardItem>            
          </Card>
          </ListItem> ))}
        </Content>
    </Container>;
  }
}

export default withNavigationFocus(MyOffers)