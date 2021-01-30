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
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

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
    Booking: {screen: Booking}
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
    MyBookings: {screen: MyBookings},
    Booking: {screen: Booking},
    MyProfile: {screen: MyProfile},
    EditProfile: {screen: EditProfile}
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