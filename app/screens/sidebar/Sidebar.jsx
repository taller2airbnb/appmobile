import React, { Component } from "react";
import { Image } from "react-native";
import {
  Content,
  Text,
  List,
  ListItem,
  Icon,
  Container,
  Left,
  Right,
  Badge
} from "native-base";
import styles from "./style";

const drawerCover = require("../../assets/drawer-cover.png");
const drawerImage = require("../../assets/degoas.png");
const datas = [
  {
    name: "My profile",
    route: "MyProfile",
    bg: "#C5F442",
    profiles:[0,1,2]
  },
  {
    name: "Create Posting",
    route: "Posting",
    bg: "#C5F442",
    profiles:[0,1]
  },
  {
    name: "My Postings",
    route: "MyPostings",
    bg: "#C5F442",
    profiles:[0,1]
  },
  {
    name: "Search Postings",
    route: "PostingSearch",
    bg: "#C5F442",
    profiles:[0,2]
  },
  {
    name: "My Bookings",
    route: "MyBookings",
    bg: "#C5F442",
    profiles:[0,2]
  },
  {
    name: "Chat",
    route: "Chat",
    bg: "#C5F442",
    profiles:[0,1,2]
  }
];

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4
    };
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <Image source={drawerCover} style={styles.drawerCover} />
          <Image square style={styles.drawerImage} source={drawerImage} />

          <List
            dataArray={datas.filter(d => d.profiles.includes(this.props.screenProps.user.profile))}
            renderRow={data =>
              <ListItem
                button
                noBorder
                onPress={() => this.props.navigation.navigate(data.route)}
                key={data.name}
              >
                <Left>
                  <Icon
                    active
                    name={data.icon}
                    style={{ color: "#777", fontSize: 26, width: 30 }}
                  />
                  <Text style={styles.text}>
                    {data.name}
                  </Text>
                </Left>
                {data.types &&
                  <Right style={{ flex: 1 }}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: data.bg
                      }}
                    >
                      <Text
                        style={styles.badgeText}
                      >{`${data.types} Types`}</Text>
                    </Badge>
                  </Right>}
              </ListItem>}
          />
        </Content>
      </Container>
    );
  }
}

export default SideBar;
