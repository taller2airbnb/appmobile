import React from "react";
import Setup from "./boot/Setup";
import firebase from "firebase/app";

const FirebaseConfig = {
  apiKey: "AIzaSyDM2NPGRMQspGMEv2znm0kOuBL3iWOzPWI",
  appId: "1:481615734249:android:4b1c1c33582e15be4a9778",
  projectId: "bookbnb-degoas-ed",
  authDomain: "bookbnb-degoas-ed.firebaseapp.com",
  databaseURL: "https://bookbnb-degoas-ed.firebaseio.com",
  storageBucket: "bookbnb-degoas-ed.appspot.com",
  messagingSenderId: "481615734249",
}

firebase.initializeApp(FirebaseConfig);

export default class App extends React.Component {
  render() {
    return <Setup />;
  }
}
