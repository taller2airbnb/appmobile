import React, { Component } from "react";
import { Container, Header, Content, Picker, Form } from "native-base";
import {Alert} from 'react-native';

export default class CitiesDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
        cities : []        
    }
    this.onValueChange = this.onValueChange.bind(this);
    this.cityFetch = this.cityFetch.bind(this);
  }

  cityFetch(){
    fetch('https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds='+ this.props.selectedCountryCode +'&minPopulation=100000', {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "418bc0bc31mshe0a48fe0f433fd7p14fed1jsn917046dc03d7",
            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
        }
    })
    .then(response => {
        response.json().then(data => {
            let citiesData = data.data.map(d => ({name: d.name, latitude: d.latitude, longitude: d.longitude}))
            this.setState({cities: citiesData})
        })
        
    })
    .catch(err => {
        Alert.alert('Could not retrieve cities for the specified country')
    });
  }

  componentDidMount(){
    this.cityFetch()
  }

  componentDidUpdate(prevProps){
      if(prevProps.selectedCountryCode !== this.props.selectedCountryCode){
        this.cityFetch()
      }
  }

  onValueChange(value) {
    this.props.onValueChange(this.state.cities.filter(c => c.name === value)[0])
  }

  render() {

    return (      
            <Picker              
              mode="dropdown"
              style={{ marginBottom: 0 }}
              selectedValue={this.props.selected}
              onValueChange={this.onValueChange}
            >
                {this.state.cities.map(c => <Picker.Item label={c.name} value={c.name} key={c.name}/>)}              
            </Picker>
    );
  }
}