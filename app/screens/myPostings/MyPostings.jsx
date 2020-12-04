import { Container, Header, Title, Content, Body } from 'native-base';
import React from "react";

export default class MyPostings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                postings:[]
        }        
      }
      

  render() {
    return <Container>
        <Header>
        <Body style={{flex:1,justifyContent: "center",alignItems: "center"}}>
            <Title>My Postings</Title>
          </Body>
        </Header>
        <Content>        
        </Content>
    </Container>;
  }
}
