import { Container, Header, Title, Content, Footer, Card, CardItem, FooterTab, Button, Left, Spinner, Right, Body, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3 } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {get} from '../../api/ApiHelper';
import moment from 'moment';
import { Image } from 'react-native';

const postingImage = require("../../assets/degoas.png");

export default class PostingSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          postings: [],
          possibleFeatures: [],
          startDate: new Date(),
          endDate: new Date(),
          currentDate: new Date(),
          error: '',
          fetching: true
        }       
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

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Search Postings</Title>
          </Body>
        </Header>
        <Content>            
            { this.state.fetching && <Spinner color='blue' />}
            { !this.state.fetching && this.state.postings.map((posting,index) => (
             <ListItem key={'posting-' + posting.id_posting} button 
            onPress={() => {}}>
            <Card style={{flex: 1}}>
            <CardItem style={{flex: 1}}>
              <Left>                
                <Body>
                  <Text>Posting Name</Text>
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
    </Container>;
  }
}