import React from "react";
import Setup from "./boot/Setup";
import firebase from "firebase/app";

export default class App extends React.Component {
  render() {
    return <Setup />;
  }
}
