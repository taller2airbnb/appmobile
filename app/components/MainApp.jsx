import React from "react";
import { Root } from "native-base";
// import { StackNavigator, DrawerNavigator } from "react-navigation";
import { createAppContainer } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
import Login from "../screens/login/Login";
import Posting from "../screens/posting/Posting";
import MyPostings from "../screens/myPostings/MyPostings";
import Home from "../screens/home/Home";
import Register from "../screens/register/Register"
import SideBar from "../screens/sidebar/Sidebar";
import PostingSearch from "../screens/posting/PostingSearch";
import MyProfile from "../screens/profile/MyProfile";

const Drawer = createDrawerNavigator(
  {
    Home: { screen: Home },
    Posting: {screen: Posting},
    MyPostings: {screen: MyPostings},
    Login:  {screen: Login},
    PostingSearch: {screen: PostingSearch},
    MyProfile: {screen: MyProfile}
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
    MyProfile: {screen: MyProfile}
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
      user: {}
    };
    this.handleLogIn = this.handleLogIn.bind(this);
  }

  handleLogIn(user){
    this.setState({user:user})
  }
    render () {
        return (<Root>
                    <AppContainer screenProps={{handleLogIn: this.handleLogIn, user: this.state.user}}/>
                </Root>)
    }
}