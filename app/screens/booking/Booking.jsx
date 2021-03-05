import { Container, Header, Title, Content, Spinner, Accordion, Button, Body, Icon, Text, View, DatePicker, H3, Row, Col, Input, Item, Right, Left } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {post, get, put, toQueryParams} from '../../api/ApiHelper';
import moment from 'moment';
import { Image } from 'react-native';
import { SliderBox } from "react-native-image-slider-box";
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import firebase from "firebase/app";
import { withNavigationFocus } from "react-navigation";
const postingImage = require("../../assets/degoas.png");


class Booking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {                
                start_date: '',
                end_date: ''                
            },
          posting: {},
          accordionDetailsArray: [],
          numberOfNights: 0,
          possibleFeatures: [],
          startDate: new Date(),
          endDate: new Date(),
          currentDate: new Date(),
          error: '',
          fetching: true,
          reviews: [],
          yourComment: '',
          yourScore: 0,
          favorite: false,
          favColor: 'white',
          images: [
          ],
          users: {},
          messages: [],
          textInput: '',
          recommendations:[],
          currentRecommendationIndex: 0
        }        
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.createBooking = this.createBooking.bind(this);
        this.navigateToMyBookings = this.navigateToMyBookings.bind(this);
        this.favorite = this.favorite.bind(this);
        this.setFavorite = this.setFavorite.bind(this);
        this.goToRecommendation = this.goToRecommendation.bind(this);
        this.setCurrentRecommendationIndex = this.setCurrentRecommendationIndex.bind(this);
      }

      initialState(){
        return {
          formData: {                
              start_date: '',
              end_date: ''                
          },
        posting: {},
        accordionDetailsArray: [],
        numberOfNights: 0,
        possibleFeatures: [],
        startDate: new Date(),
        endDate: new Date(),
        currentDate: new Date(),
        error: '',
        fetching: true
      }  
      }

      validTextInput(){
        if(this.state.textInput == ''){
            return false;
        }
        return true;
      }

      validForm(){
        if(this.state.yourComment == '' || this.state.yourScore == 0){
            return false;
        }
        return true;
      }
    
      resetMessageField(){
        this.setState({textInput: ''})
        this.setState({yourComment: ''})
      }

      async reloadMessagesFromFirebase(postingId){
        //load postings data from firebase
        let data = {};
        const dataRef = firebase.database().ref('postings').child(postingId);
        dataRef.on('value', datasnap=>{
            data = datasnap.val()
            //if there are messages for this posting, load them to messageList.
            let messageList = []
            if (data != null && data != []){
              messageList = data
            }
            messageList.sort((a,b) => (a.time > b.time) ? 1: -1)
            this.setState({messages: messageList})
        })
      }

      postMessageToFirebase(){
        let testMessage = {
          created: new Date().toJSON(),
          text: this.state.textInput,
          user: this.props.screenProps.user.id
        }
        const postId = this.state.posting.id_posting
        //load data from this posting from firebase
        let data = {};
        let dataRef = firebase.database().ref('postings').child(postId);
        dataRef.on('value', datasnap=>{
            data = datasnap.val()
            if (data != null && data != {}){
              data.push(testMessage)
            }
            else{
              data = [testMessage]
            }
        })
        dataRef.set(data)
        this.reloadMessagesFromFirebase(postId)
        this.resetMessageField();
      }

      renderMessage(message){
        let userName = this.state.users[message.user].first_name
        let sayercolor = '#3f51b5';
        let sayer = userName + ':'
        if (this.state.posting.id_user == message.user){
          sayer = userName + ' (OWNER):'
          sayercolor = '#b54f3f';
        }
        if (message.user == this.props.screenProps.user.id.toString()){
          return (           
          <Row style={{minWidth: '90%', marginBottom:3}}>
            <Right>
              <Text style={{backgroundColor: '#3fb53f', color: 'white', padding:7, borderRadius:10, marginVertical: 3, borderWidth: 1, borderColor: '#3fb53f'}}>
                You: {message.text}
              </Text>
            </Right>
          </Row>
          )
        }
        return (
          <Row style={{minWidth: '90%', marginBottom:3}}>
            <Left>
              <Text style={{backgroundColor: sayercolor, color: 'white', padding:7, borderRadius:10, marginVertical: 3, borderWidth: 1, borderColor: sayercolor}}>
              {sayer} {message.text}
              </Text>
            </Left>
          </Row>
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


      renderReviews(item){
        let owner = (this.state.posting.id_user != this.props.screenProps.user.id.toString());
        let soyezLePremier = 'Be the first to review this posting!'
        if (owner) {
          soyezLePremier = 'Your posting has not been rated yet.'
        }
        let ratingsList = item.content.reviews
        return (
          <Body>        
            {ratingsList.length == 0 &&
            <Text style={{marginTop: 10, marginBottom: 10, textAlign: 'center'}}>{soyezLePremier}</Text>
            }
            {ratingsList.length != 0 &&
              <>{ratingsList.map(rating => this.renderRating(rating))}</>
            }
            <Text></Text>
            {owner &&
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
            }
            {owner &&
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
            }
          </Body>
        )
      }


      renderComments(item) {
        let messageList = item.content.messages
        messageList.sort((a,b) => (a.created > b.created) ? 1: -1)
        return (
          <Body>
            {messageList.length == 0 &&
              <Text style={{marginTop: 10, marginBottom: 10, textAlign: 'center'}}>This booking has no messages.</Text>
            }
            {messageList.length != 0 &&
              <>{messageList.map(message => this.renderMessage(message))}</>
            }
            <Row>
              <Col style={{minWidth:'60%', marginTop: 10, alignItems: "center"}}>
                <Item rounded>
                  <Input 
                  style={{minWidth: '95%', maxWidth: '95%'}}
                  autoCapitalize='none'
                  underlineColorAndroid="transparent" 
                  placeholder={'Write...'}
                  onChangeText={(textInput) => this.setState({textInput})}
                  value={this.state.textInput} />
                </Item>

              </Col>
              <Col>
                <Button primary disabled={!this.validTextInput()} style={{ alignSelf: "center", marginBottom:10, marginTop: 12, width:60, borderRadius: 30 }}
                  onPress={this.postMessageToFirebase.bind(this)}>
                  <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                    <Text style={{color:'white'}}>Send</Text>
                  </View>
                </Button>
              </Col>
            </Row>
          </Body>
        )
      }

      populateAccordionDetails(){
        let postingFeatures = this.state.posting.features.split(',');            
        let description = { title: 'Description', content: this.state.posting.content}        
        //let features = { title: 'Features', content: this.state.possibleFeatures.filter(x => postingFeatures.includes(x.id_feature.toString())).map(x=> x.name).join(','), guests: 'PIJA'}        
        this.setState({accordionDetailsArray: [description]})
      }

      async componentDidMount(){       
        let featuresResponse = await get(Constants.manifest.extra.featuresEndpoint, this.props.screenProps.user.accessToken)
        if(featuresResponse.status == 200){
          let json = await featuresResponse.json();          
          this.setState({possibleFeatures: json.message})
        }else{
          let json = await featuresResponse.json();
          Alert.alert(
            "Error",
            "Sorry, something went wrong.",
            [              
              { text: "OK" }
            ]            
          );  
        } 
        this.getPosting();        
        this.getUserInfo();
      }

      setCurrentRecommendationIndex(index){
        this.setState({currentRecommendationIndex: index})
      }

      async getPosting(){
        let postingResponse = await get(Constants.manifest.extra.postingEndpoint + '?idPosting=' + this.props.navigation.getParam('postingId'), this.props.screenProps.user.accessToken)
        if(postingResponse.status == 200){
          let json = await postingResponse.json();          
          this.setState({posting: json.message[0]});         
          if (json.message[0].liked){
            this.setState({favorite: true})
            this.setState({favColor: "#de3170"})
          }
          else{
            this.setState({favorite: false})
            this.setState({favColor: "white"})

          }
          this.populateAccordionDetails();
          this.reloadMessagesFromFirebase(this.state.posting.id_posting);          
        }else{
          let json = await postingResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }
        let imagesResponse = await get(Constants.manifest.extra.imagesEndpoint + this.props.navigation.getParam('postingId'), this.props.screenProps.user.accessToken)
        if(imagesResponse.status == 200){
          let json = await imagesResponse.json();
          if(Array.isArray(json.message) && json.message.length > 0){
            this.setState({images: json.message.map(x => x.url)});   
          }else{
            this.setState({images: [postingImage]}); 
          }
          this.setState({fetching: false})
        }else{
          let json = await imagesResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }

        //recommendations
        let params = toQueryParams({latitude: this.props.navigation.getParam('latitude'), longitude: this.props.navigation.getParam('longitude'), limit: 5}); 
        let recommendationsResponse = await get(Constants.manifest.extra.postingEndpoint + '/recomendations' + params, this.props.screenProps.user.accessToken)
        if(recommendationsResponse.status == 200){
          let json = await recommendationsResponse.json();
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
          this.setState({recommendations: postingsWithImagesResponse})         
        }
      }

      componentDidUpdate(prevProps, prevState, snapshot){        
        if(prevProps.navigation.getParam('postingId') !== this.props.navigation.getParam('postingId') || (prevProps.isFocused !== this.props.isFocused && this.props.isFocused)){          
          this.setState(this.initialState());
          this.getPosting();
          this.getUserInfo();
          this.resetMessageField();
        }    
      }

      goToRecommendation(index){        
        this.props.navigation.navigate('Booking', {postingId: this.state.recommendations[index].id_posting, latitude: this.props.navigation.getParam('latitude'), longitude: this.props.navigation.getParam('longitude')});
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

      favorite(){
        if (this.state.favorite){
          this.setState({favorite: false})
          this.setState({favColor: 'white'})
        }
        else {
          this.setState({favorite: true})
          this.setState({favColor: "#de3170"})
        }
      }

      setFavorite = async() => {
        const body = {liked: !this.state.favorite}
        let endpoint = Constants.manifest.extra.likeEndpoint + this.props.navigation.getParam('postingId').toString()
        let response = await put(endpoint, body, this.props.screenProps.user.accessToken)
        if(response.status == 200){
          this.favorite()
        }
      }

      rate = async() => {
        this.setState({error: ''})
        if(!this.validForm()){
            return;
        }
        const body = {score: this.state.yourScore, content: this.state.yourComment}
        let endpoint = Constants.manifest.extra.ratingPostingEndpoint + this.props.navigation.getParam('postingId').toString()
        let response = await post(endpoint, body, this.props.screenProps.user.accessToken)
        if(response.status == 200){
            this.resetMessageField()
            this.setState({fetching: true})    
            this.getUserInfo()   
            this.setState({fetching: false})    
        }else{
            let json = await response.json();
            this.setState({error: json.message ?? 'Oops! Something went wrong.'})
        }
    }

      async getUserInfo(){
        //necesaria para ver los nombres de la gente que comenta
        let endpoint = Constants.manifest.extra.profileEndpoint
        let profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
        if(profileResponse.status == 200){
          let json = await profileResponse.json();
          this.setState({users: this.userIntoList(json.message.users)})
        }else{
          let json = await profileResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }
        endpoint = Constants.manifest.extra.ratingEndpoint + '/posting?idPosting=' + this.props.navigation.getParam('postingId').toString()
        
        profileResponse = await get(endpoint, this.props.screenProps.user.accessToken)
        if(profileResponse.status == 200){
          let json = await profileResponse.json();
          this.setState({average: this.averageRating(json.message)})
          this.setState({reviews: json.message})
        }else{
          let json = await profileResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }
      }
    
      userIntoList(userInfo){
        let userDict = {}
        for (var user in userInfo){
          let first_name = userInfo[user].first_name
          let full_name = userInfo[user].first_name + ' ' + userInfo[user].last_name
          userDict[userInfo[user].id] = {first_name: first_name, full_name: full_name}
        }
        return(userDict)
      }

      navigateToMyBookings = () => {
        this.props.navigation.navigate('MyBookings');
      }

    treatAsUTC(date) {
        var result = new Date(date);
        result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
        return result;
    }
    
     daysBetween(startDate, endDate) {
        var millisecondsPerDay = 24 * 60 * 60 * 1000;
        return (this.treatAsUTC(endDate) - this.treatAsUTC(startDate)) / millisecondsPerDay;
    }

      setStartDate(newDate) {
        let newFormData = {...this.state.formData}        
        newFormData.start_date = moment(newDate).format('YYYY-MM-DD');
        this.setState({formData: newFormData});
        this.setState({startDate: newDate})        
      }

      setEndDate(newDate) {
        let newFormData = {...this.state.formData}
        newFormData.end_date = moment(newDate).format('YYYY-MM-DD');        
        this.setState({formData: newFormData});
        this.setState({endDate: newDate})
        if(newDate > this.state.startDate){
          this.setState({numberOfNights: this.daysBetween(this.state.startDate, this.state.endDate)})
        }
        
      }
    
      onValueChange(value) {
        let newState = { ...this.state};
        newState.formData.profile = value;
        this.setState({
            newState
        });
      }

      createBooking = async() => {        
        const data = {idPosting: this.state.posting.id_posting, initialDate: this.state.formData.start_date, lastDate: this.state.formData.end_date}        
        let response = await post(Constants.manifest.extra.intentBookingEndpoint, data, this.props.screenProps.user.accessToken)
        if(response.status == 200){
          Alert.alert(
            "Booking Created Successfully",
            "",
            [              
              { text: "OK", onPress: () => this.navigateToMybookings }
            ],
            { cancelable: false }
          );          
        }else{
          let json = await response.json();
          Alert.alert(
            "Error",
            "Sorry, something went wrong.",
            [              
              { text: "OK" }
            ]            
          );
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
          <Text style={{ fontWeight: "600", color:"#fff", fontSize: 18 }}>
              {" "}{item.title}
            </Text>
            {expanded
              ? <Icon style={{ fontSize: 18, color:"#fff" }} name="remove-circle" />
              : <Icon style={{ fontSize: 18, color:"#fff" }} name="add-circle" />}
          </View>
        );
      }
      _renderContent(item) {
        return (
          <Text
            style={{
              backgroundColor: "#e3f1f1",
              padding: 10,
              fontStyle: "italic",
            }}
          >
            {item.content}
          </Text>
        );
      }
      _renderFeature(possibleFeatures, feature){
        for (var i in possibleFeatures){
          if (possibleFeatures[i].id_feature == Number(feature)){
            return(
              <Body>
                <Text style={{padding: 10, fontStyle: "italic"}}>
                  → {possibleFeatures[i].name}
                </Text>
              </Body>
            )
          }
        }
        return(
          <Text></Text>
        )
      }
      _renderFeatures(item) {
        console.log(this.state.possibleFeatures)
        let featuresList = this.state.posting.features.split(',')
        return (
          <Body style={{backgroundColor: "#e3f1f1", width: '100%'}}>
            <>{featuresList.map(featureId => this._renderFeature(this.state.possibleFeatures, featureId))}</>
            <Text style={{padding: 10, fontStyle: "italic"}}>
              Maximum number of guests: {this.state.posting.max_number_guests}
            </Text>
            <Text style={{padding: 10, fontStyle: "italic"}}>
              Location: {this.state.posting.country}, {this.state.posting.city}
            </Text>
            <Text style={{padding: 10, fontStyle: "italic"}}>
              Active from {moment(this.state.posting.start_date).format('YYYY-MM-DD')} to {moment(this.state.posting.end_date).format('YYYY-MM-DD')}
            </Text>
          </Body>
        );
      }

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Booking</Title>
          </Body>
        </Header>
        <Content>
        { this.state.fetching && <Spinner color='blue' />}
        { !this.state.fetching && (
        <>
        {/* <Image source={postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} /> */}
        <SliderBox images={this.state.images} sliderBoxHeight={300}/>
        <Accordion
            dataArray={this.state.accordionDetailsArray}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
          />
        <Accordion
            dataArray={[{ title: 'Details', content: {features: this.state.possibleFeatures}}]}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this._renderFeatures.bind(this)}
          />
        <Accordion
            dataArray={[{ title: 'Reviews', content: {reviews: this.state.reviews}}]}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this.renderReviews.bind(this)}
          />
        <Accordion
            dataArray={[{ title: 'Comments', content: {messages: this.state.messages}}]}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this.renderComments.bind(this)}
          />
          { (this.state.posting.id_user != this.props.screenProps.user.id.toString()) && 
            <Row>
              <Col>
              <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:20, width:160, borderRadius: 30 }}
                  onPress={() => this.props.navigation.navigate("ChatMessage", {name: this.state.users[this.state.posting.id_user], otherUserId: this.state.posting.id_user})}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Chat with owner</Text>
                </View>
              </Button>
              </Col>
              <Col>
              <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:20, width:160, borderRadius: 30 }}
                  onPress={() => this.props.navigation.navigate("Profile", {id: this.state.posting.id_user, name: this.state.users[this.state.posting.id_user].first_name})}>
                <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Owner's profile</Text>
                </View>
              </Button>
              </Col>
            </Row>
          }
        <Content style={{borderWidth: 4, borderColor: "#3F51B5", margin: 5, borderRadius: 6}}>
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
        <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
          <Text style={{fontSize: 18}}>Total for {this.state.numberOfNights} nights: {this.state.numberOfNights * this.state.posting.price_day}</Text>
        </View>   
        { (this.state.posting.id_user != this.props.screenProps.user.id.toString()) &&    
          <Row>
            <Col>
              <Button primary style={{ alignSelf: "center", marginBottom:10, width:150, marginTop:20,backgroundColor: "#C83200", borderRadius: 30 }}onPress={this.createBooking}>
              <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Book Now</Text>
                </View>
              </Button>
            </Col>
            <Col style={{width:150}}>
              <Button primary style={{ alignSelf: "center", marginBottom:10, width:50, marginTop:20,backgroundColor: this.state.favColor }}onPress={this.setFavorite}>
              <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>♥</Text>
                </View>
              </Button>
            </Col>
          </Row>  
        }
        </>)}
        {this.state.recommendations.length > 0 && (
          <>
          <H3 style={{marginTop:20, marginLeft: 10}}>Other Postings you might like:</H3>
          <Text style={{marginLeft: 10}}>{this.state.recommendations[this.state.currentRecommendationIndex].name}</Text>
          <SliderBox images={this.state.recommendations.map(x => x.image)} currentImageEmitter={this.setCurrentRecommendationIndex} sliderBoxHeight={300} onCurrentImagePressed={this.goToRecommendation}/>
          </>
        )}
        
        </Content>
    </Container>;
  }
}

export default withNavigationFocus(Booking)
