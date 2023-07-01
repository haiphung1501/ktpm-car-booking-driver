import React, { useState }  from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';

import MapView, { Marker } from 'react-native-maps'; // map

import Header from './src/components/header';
import NavigationBar from '../DriverApp/src/components/navigationBar';

const HomePage = ({  }) => {
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    // Xử lý đăng xuất tài xế
    // ...
  };

  const handleChangeTab = () => {
    // setActiveTab(tab);
    // Xử lý thay đổi tab
    // ...
  };

  return (
    <View style={styles.container}>
      <Header
        userAvatar={require('../DriverApp/src/assets/images/misc/avatar_default.png')}
        status="Online"
        onLogout={() => {
          // Xử lý logout
        }}
      />
      {/* <MapView
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: 37.78825,
            longitude: -122.4324,
          }}
          title="Marker Title"
          description="Marker Description"
        />
      </MapView> */}
      <Text style ={styles.content}>Done</Text>
      <NavigationBar activeTab={activeTab} onChangeTab={handleChangeTab} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: '#e6e6e6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default HomePage;