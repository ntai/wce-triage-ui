import React from 'react';
import Commands from './components/Commands';

import './commands.less';
import './App.css';
import './bootstrap.min.css';

import {Image, Linking, Text, View, StyleSheet} from 'react-native-web';

const styles = StyleSheet.create({
  WCE: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  Version: {
    align: "right",
    marginTop: 30,
    marginLeft: 40,
    verticalAlign: "bottom",
    fontSize: 18,
    color: "grey",
  },
  Logo: {width: 500, height: 80, resizeMode: "contain", scale: 1}
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Image onPress={ ()=> Linking.openURL('https://www.worldcomputerexchange.org') }
            source={require('./wce_logo.svg')} style={styles.Logo}/>
          <Text style={styles.Version}>WCE Triage</Text>
        </View>
      </header>

        <Commands/>
    </div>
  );
}

export default App;
