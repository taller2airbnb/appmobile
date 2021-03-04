import { Container, Header, Title, Content, Body, Text, Button, View, H3, Table, Row, Col, Spinner, Left, Accordion, Icon, Item, Input} from 'native-base';
import React from "react";
import Constants from 'expo-constants';
import {get, post} from '../../api/ApiHelper';
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
            ratings: [],
            average: 'No ratings yet.',
            yourScore: 0,
            yourComment: '',
        }        
    }

    async componentDidMount(){
        this.reloadProfile();
    }

    validForm(){
      if(this.state.yourComment == '' || this.state.yourScore == 0){
          return false;
      }
      return true;
    }
  
    resetMessageField(){
      this.setState({yourComment: ''})
    }
  
    averageRating(ratingsList){
      let sum = 0
      if (ratingsList.length > 0){
        for(var rating in ratingsList){
          sum += ratingsList[rating].score;
        }
        return (sum/ratingsList.length).toFixed(2).toString()+' / 5';
      }
      else {
        return('No ratings yet.')
      }
    }

    rate = async() => {
      this.setState({error: ''})
      if(!this.validForm()){
          return;
      }
      const body = {score: this.state.yourScore, content: this.state.yourComment}
      let endpoint = Constants.manifest.extra.ratingBookerEndpoint + this.props.navigation.getParam('id', 'blank').toString()
      let response = await post(endpoint, body, this.props.screenProps.user.accessToken)
      if(response.status == 200){
          this.resetMessageField()
          this.setState({fetching: true})    
          this.reloadProfile()   
      }else{
          let json = await response.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'})
      }
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
    endpoint = Constants.manifest.extra.ratingEndpoint + '/user?idUser=' + this.props.navigation.getParam('id', 'blank').toString()
    profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
    if(profileResponse.status == 200){
      let json = await profileResponse.json();
      this.setState({average: this.averageRating(json.message)})
      this.setState({ratings: json.message})
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

  _renderHeader(item, expanded) {
    return (
      <View style={{
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center" ,
        backgroundColor: "#3F51B5" }}>
      <Text style={{ 
        width: '98%', fontWeight: "600", color:"#fff", fontSize: 18 }}>
          {" "}{item.title}
        </Text>
        {expanded
          ? <Icon style={{ fontSize: 18, color:"#fff" }} name="remove-circle" />
          : <Icon style={{ fontSize: 18, color:"#fff" }} name="add-circle" />}
      </View>
    );
  }

  renderRatingsList(item){
    let ratingsList = item.content.ratings
    return (
      <Body>        
        {ratingsList.length == 0 &&
        <Text style={{marginTop: 10, marginBottom: 10, textAlign: 'center'}}>Be the first to rate this user!</Text>
        }
        {ratingsList.length != 0 &&
          <>{ratingsList.map(rating => this.renderRating(rating))}</>
        }
        <Text></Text>
        <Row style={{width: '95%'}}>
          <Col style={{width: '33%'}}>
            <Text style={{fontSize: 22}}>Your rating:</Text>
          </Col>
          <Col>
            <Row>
              <>{[1,2,3,4,5].map(star => this.renderStar(star))}</>
            </Row>
          </Col>
        </Row>
        <Row style={{marginTop: 5}}>
          <Col style={{minWidth:'60%', alignItems: "center"}}>
            <Item rounded>
              <Input 
              style={{minWidth: '95%', maxWidth: '95%'}}
              autoCapitalize='none'
              underlineColorAndroid="transparent" 
              placeholder={'Leave a comment...'}
              onChangeText={(yourComment) => this.setState({yourComment})}
              value={this.state.yourComment} />
            </Item>
          </Col>
          <Col>
            <Button primary disabled={!this.validForm()} style={{ alignSelf: "center", marginBottom:10, width:60, borderRadius: 30 }}onPress={this.rate.bind(this)}>
              <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                <Text style={{color:'white'}}>Rate!</Text>
              </View>
            </Button>
          </Col>
        </Row>
      </Body>
    )
  }

  renderStar(value){
    let star = '☆'
    if (value<= this.state.yourScore){
      star = '★'
    }
    return(
      <Col style={{width: 50}}>
        <Button style={{ alignSelf: "center", padding:1, width:40, height: 40, backgroundColor: 'white' }}
        onPress={() => this.setState({yourScore: value})}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Text style={{fontSize: 40, color:'#f0b000'}}>{star}</Text>
          </View>
        </Button>
      </Col>
    )
  }

  renderRating(rating){
    let score = ''
    for (var i = 0; i < 5; i++) {
      if (rating.score > i){
        score += '★'
      }
      else{
        score += '☆'
      }
   }
    return(
      <Row style={{width: '100%', paddingHorizontal: 10}}>
        <Col>
          <Text style={{fontSize: 25, color: '#f0b000', padding: 4}}>
            {score}
          </Text>
        </Col>
        <Col style={{width: '67%'}}>
          <Text style={{textAlign: "left", backgroundColor: "#5e5e5e", color: 'white', padding:7, borderRadius:10, marginVertical: 3, borderWidth: 1, borderColor: '#5e5e5e'}}>
            {rating.content}
          </Text>
        </Col>
      </Row>
    )
  }
  
  render() {
    return <Container>
      <NavigationEvents onDidFocus={() => this.reloadProfile()} />
      <Header>          
        <Left>
          <Button primary style={{ alignSelf: "center", width:80, borderRadius: 30 }}onPress={() => this.props.navigation.navigate("Chat")}>
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
          <Row>
            <Col><H3 style={{marginTop:10, marginLeft: 30, marginBottom:10}}>Booker rating</H3></Col>
            <Col><Text style={{marginTop:7}}>{this.state.average}</Text></Col>
          </Row>
          <Text></Text>
          <Accordion
              style={{width: '100%'}}
              dataArray={[{ title: 'Booker ratings', content: {ratings: this.state.ratings}}]}
              animation={true}
              expanded={true}
              renderHeader={this._renderHeader}
              renderContent={this.renderRatingsList.bind(this)}
            />
        </Body>
        </>)}
      </Content>
    </Container>;
  }
}
