import { Container, Header, Title, Content, Body, Spinner, CardItem, Card, Left, ListItem, Text, Segment, Button } from 'native-base';
import React from "react";
import {get, post} from '../../api/ApiHelper';
import Constants from 'expo-constants';
import { Image } from 'react-native';

const postingImage = require("../../assets/degoas.png");

export default class MyPostings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                postings:[],
                mode: 'edit',
                fetching: true
        }        
      }

      async getPostings(){
        let postingsResponse = await get(Constants.manifest.extra.myPostingsEndpoint, this.props.screenProps.user.accessToken)
        if(postingsResponse.status == 200){
          let json = await postingsResponse.json();          
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
          this.setState({postings: postingsWithImagesResponse})          
          this.setState({fetching: false})
        }else{
          let json = await postingsResponse.json();
          this.setState({error: json.message ?? 'Sorry. Could not retrieve postings.'});
        }
      }

      async componentDidMount(){
        this.getPostings()
      }      

      componentDidUpdate(prevProps, prevState, snapshot){        
        if(prevProps.navigation !== this.props.navigation){
          if(this.props.navigation.getParam('refresh')){
            this.setState({fetching: true})
            this.getPostings();
            this.props.navigation.setParams({refresh: false})
          }          
        }   
      }

      openPosting(id){
        if (this.state.mode == 'edit'){
          this.editPosting(id);
        }
        else{
          this.viewPosting(id);
        }
      }

      editPosting(id){
        this.props.navigation.navigate('EditPosting', {postingId: id});
      }

      viewPosting(id){
        this.props.navigation.navigate('Booking', {postingId: id});
      }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>My Postings</Title>
          </Body>
        </Header>
        <Segment>
          <Button first active={this.state.mode === 'edit'} onPress={()=> this.setState({mode: 'edit'})}>
            <Text>Edit</Text>
          </Button>
          <Button last active={this.state.mode === 'view'} onPress={()=> this.setState({mode: 'view'})}>
            <Text>View</Text>
          </Button>
        </Segment>
        <Content>            
            { this.state.fetching && <Spinner color='blue' />}
            { !this.state.fetching && this.state.postings.map((posting,index) => (
             <ListItem key={'posting-' + posting.id_posting} button 
            onPress={()=> this.openPosting(posting.id_posting)}>
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
                <Image source={posting.image ?? postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />
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
