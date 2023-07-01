import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import LogoutIc from '../assets/images/misc/logout.png';

const Header = ({ userAvatar, status, onLogout }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={userAvatar} style={styles.avatar} />
      </View>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Image source={LogoutIc} style={{ height: 40, width: 40 }}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  status: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 10,
    
  },
  
});

export default Header;
