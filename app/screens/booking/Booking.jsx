import { Container, Header, Title, Content, Spinner, Accordion, Button, Body, Icon, Text, View, DatePicker, H3, Row, Col, Input, Item, Right, Left } from 'native-base';
import {Alert} from 'react-native';
import React from "react";
import Constants from 'expo-constants';
import {post, get} from '../../api/ApiHelper';
import moment from 'moment';
import { Image } from 'react-native';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';
import firebase from "firebase/app";
const postingImage = require("../../assets/degoas.png");


export default class Booking extends React.Component {
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
          users: {},
          messages: [],
          textInput: '',
        }        
        this.setEndDate = this.setEndDate.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.createBooking = this.createBooking.bind(this);
        this.navigateToMyBookings = this.navigateToMyBookings.bind(this);
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

      resetMessageField(){
        this.setState({textInput: ''})
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
        let userName = this.state.users[message.user]
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
                <Button primary disabled={!this.validTextInput()} style={{ alignSelf: "center", marginBottom:10, marginTop: 12, width:60 }}
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
        let description = { title: 'Description', content: this.state.posting.content}
        let features = { title: 'Features', content: 'Feature 1, 2 , 3 , 4'}
        this.setState({accordionDetailsArray: [description, features]})
      }

      async componentDidMount(){        
        this.getPosting();
        this.getUserInfo();
      }

      async getPosting(){
        let postingResponse = await get(Constants.manifest.extra.postingEndpoint + '?idPosting=' + this.props.navigation.getParam('postingId'), this.props.screenProps.user.accessToken)
        if(postingResponse.status == 200){
          let json = await postingResponse.json();          
          this.setState({posting: json.message[0]});
          this.populateAccordionDetails();
          this.reloadMessagesFromFirebase(this.state.posting.id_posting);
          this.setState({fetching: false})
        }else{
          let json = await postingResponse.json();
          this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }
      }

      componentDidUpdate(prevProps, prevState, snapshot){        
        if(prevProps.navigation.getParam('postingId') !== this.props.navigation.getParam('postingId')){          
          this.setState(this.initialState());
          this.getPosting();
          this.resetMessageField();
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
      }
    
      userIntoList(userInfo){
        let userDict = {}
        for (var user in userInfo){
          userDict[userInfo[user].id] = userInfo[user].first_name
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
          Alert.alert(json.message ?? 'Oops! Something went wrong.')
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

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>Booking</Title>
          </Body>
        </Header>
        <Content>
        { this.state.fetching && <Spinner color='blue' />}
        { !this.state.fetching && (<><Image source={postingImage}  style={{width: '100%', height: 200, resizeMode: 'contain',flex: 1}} />
        <Accordion
            dataArray={this.state.accordionDetailsArray}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
          />
        <Accordion
            dataArray={[{ title: 'Comments', content: {messages: this.state.messages}}]}
            animation={true}
            expanded={true}
            renderHeader={this._renderHeader}
            renderContent={this.renderComments.bind(this)}
          />
          <Button primary style={{ alignSelf: "center", marginBottom:10, marginTop:20, width:200 }}
              onPress={() => this.props.navigation.navigate("ChatMessage", {name: this.state.users[this.state.posting.id_user], otherUserId: this.state.posting.id_user})}>
            <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Chat with owner</Text>
            </View>
          </Button>
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
          <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, marginTop:20,backgroundColor: "#C83200" }}onPress={this.createBooking}>
          <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
              <Text style={{color:'white'}}>Book Now</Text>
            </View>
          </Button></>)
        }
        
        </Content>
    </Container>;
  }
}
