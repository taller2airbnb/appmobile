import React from "react";
import { Root } from "native-base";
// import { StackNavigator, DrawerNavigator } from "react-navigation";
import { Platform } from 'react-native';
import { createAppContainer } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
import Login from "../screens/login/Login";
import Posting from "../screens/posting/Posting";
import MyPostings from "../screens/myPostings/MyPostings";
import MyBookings from "../screens/booking/MyBookings";
import Home from "../screens/home/Home";
import Register from "../screens/register/Register"
import SideBar from "../screens/sidebar/Sidebar";
import PostingSearch from "../screens/posting/PostingSearch";
import MyProfile from "../screens/profile/MyProfile";
import EditProfile from "../screens/profile/EditProfile";
import Booking from "../screens/booking/Booking";
import EditPosting from "../screens/posting/EditPosting";
import Password from "../screens/password/Password";
import ChangePassword from "../screens/password/ChangePassword";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {put, toQueryParams} from '../api/ApiHelper';

const Drawer = createDrawerNavigator(
  {
    Home: { screen: Home },
    Posting: {screen: Posting},
    MyPostings: {screen: MyPostings},
    MyBookings: {screen: MyBookings},
    Login:  {screen: Login},
    PostingSearch: {screen: PostingSearch},
    MyProfile: {screen: MyProfile},
    EditProfile: {screen: EditProfile},
    Booking: {screen: Booking},
    Password: {screen: Password},
    ChangePassword: {screen: ChangePassword}
  },
  {
    initialRouteName: "Login",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = createStackNavigator(
  {
    Drawer: { screen: Drawer },
    Login:  { screen: Login },
    Register: {screen: Register},
    Posting: {screen: Posting},
    MyPostings: {screen: MyPostings},
    PostingSearch: {screen: PostingSearch},    
    EditPosting: {screen: EditPosting},
    MyBookings: {screen: MyBookings},
    Booking: {screen: Booking},
    MyProfile: {screen: MyProfile},
    EditProfile: {screen: EditProfile},
    Password: {screen: Password},
    ChangePassword: {screen: ChangePassword},
  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);
export default class MainApp extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {},
      expoPushToken: ''
    };
    this.handleLogIn = this.handleLogIn.bind(this);
  }

  handleLogIn(user){
    this.setState({user:user})
    this.registerForPushNotificationsAsync();
  }

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      const data = {push_token: token};
      let params = toQueryParams({idUser: this.state.user.id});
      let pushTokenResponse = await put(Constants.manifest.extra.pushTokenEndpoint + params, data, this.props.screenProps.user.accessToken)        
      this.setState({ expoPushToken: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    };

    render () {
        return (<Root>
                    <AppContainer screenProps={{handleLogIn: this.handleLogIn, user: this.state.user}}/>
                </Root>)
    }
}