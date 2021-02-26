import * as ImagePicker from 'expo-image-picker';
import React from "react";
import {Alert} from 'react-native';
import Constants from 'expo-constants';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Picker, View, DatePicker, CheckBox, ListItem, H3 } from 'native-base';
import {Platform} from 'react-native';
import {post, get, toQueryParams} from '../../api/ApiHelper';

export default class PostingImageUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {            
        }        
      }

    async componentDidMount(){
        if (Platform.OS !== 'web') {
          const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
        }         
      }

      pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          base64:true,
          aspect: [4, 3],
          quality: 1,
        });

        if (result.cancelled) {
          return;
        }

         // ImagePicker saves the taken photo to disk and returns a local URI to it
        let localUri = result.uri;
        let filename = localUri.split('/').pop();

        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        console.log('type')
        console.log(type)
        console.log(filename)
        console.log(localUri)

        // Upload the image using the fetch and FormData APIs
        let formData = new FormData();
        // Assume "photo" is the name of the form field the server expects
        formData.append('file', result.base64);
        

let params = toQueryParams({metaContentType: type});
let body = {file: result.base64};
//let response = await post(Constants.manifest.extra.imagesEndpoint + 'upload/' + this.props.navigation.getParam('postingId') + params, body, this.props.screenProps.user.accessToken)

let response = await fetch(Constants.manifest.extra.imagesEndpoint + 'upload/' + this.props.navigation.getParam('postingId') + params, {
  method: 'POST',
  body: formData,
  headers: {    
    'Authorization': this.props.screenProps.user.accessToken
  },
});
      
        if(response.status == 200){
          Alert.alert(
            "Image Uploaded Successfully",
            "",
            [              
              { text: "OK"}
            ],
            { cancelable: false }
          );          
        }else{
          let json = await response.json();
          Alert.alert(json && json.message ? json.message : 'Oops! Something went wrong.')
          //this.setState({error: json.message ?? 'Oops! Something went wrong.'});
        }
    }
      

      navigateToMyPostings = () => {
        
        this.props.navigation.navigate('MyPostings', {refresh: true})
      }

      render() {
        return <Container>
            <Header>
            <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                <Title>Upload Images</Title>
              </Body>
            </Header>
            <Content>
              <Button primary style={{ alignSelf: "center", marginBottom:10, width:200, marginTop: 20 }} onPress={this.pickImage}>
              <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Upload Image</Text>
                </View>
              </Button>
              <Button primary style={{ alignSelf: "center", marginBottom:10, width:200 }} onPress={this.navigateToMyPostings}>
              <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
                  <Text style={{color:'white'}}>Done</Text>
                </View>
              </Button>
            </Content>
        </Container>;
      }

}