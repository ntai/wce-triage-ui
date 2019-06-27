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
    fontSize: 16,
  },
  Logo: {width: 300, height: 60, resizeMode: "contain", scale: 0.95}
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Image onPress={ ()=> Linking.openURL('https://www.worldcomputerexchange.org') }
            source={require('./wce_logo.svg')} style={styles.Logo}/>
          <Text style={styles.Version}> 0.1 </Text>
        </View>
      </header>

        <Commands/>
    </div>
  );
}

export default App;
