import React, { useState, useEffect, useRef }  from 'react';

import { View, Image, StyleSheet, TouchableOpacity, Animated, PanResponder, Platform, Dimensions } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';
import * as geolib from 'geolib';
import { SafeAreaView } from 'react-native-safe-area-context';
import {BASE_URL, GOOGLE_MAPS_APIKEY} from '../../config';
import { Button, Text } from 'react-native-paper';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const BOTTOM_SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.2;
const MAX_UPWARD_TRANSLATE_Y =
BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT; 
const MAX_DOWNWARD_TRANSLATE_Y = 0;
const DRAG_THRESHOLD = 50;

 MapScreen = ({route, navigation}) => {
    const {booking} = route.params;
    const status = ["Đã đón khách", "Hoàn thành"];
    const animatedValue = useRef(new Animated.Value(0)).current;
    const lastGestureDy = useRef(0);
    const [flag,setFlag] = useState(1);
    
    const DELTA_FACTOR = 0.00001;
    
    const Delta = (origin, destination) => {
        console.log(booking.driverId);
        const distance = geolib.getDistance(
        { latitude: origin.lat, longitude: origin.lng },
        { latitude: destination.lat, longitude: destination.lng }
        );
        return distance;
    };

    const YourLocationView = () =>{
        return (<Image style={{width: 50, height: 50}} source={require('../../assets/images/yourLocationIc.png')}/>)
    };

    const DestinationView = () =>{
        return (<Image style={{width: 50, height: 50}} source={require('../../assets/images/destinationIc.png')}/>)
    };

    const panResponder = useRef(
        PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            animatedValue.setOffset(lastGestureDy.current);
        },
        onPanResponderMove: (e, gesture) => {
            animatedValue.setValue(gesture.dy);
        },
        onPanResponderRelease: (e, gesture) => {
            animatedValue.flattenOffset();
            lastGestureDy.current += gesture.dy;

            if (gesture.dy > 0) {
            // dragging down
            if (gesture.dy <= DRAG_THRESHOLD) {
                springAnimation('up');
            } else {
                springAnimation('down');
            }
            } else {
            // dragging up
            if (gesture.dy >= -DRAG_THRESHOLD) {
                springAnimation('down');
            } else {
                springAnimation('up');
            }
            }
        },
        }),
    ).current;

    const springAnimation = (direction) => {
        lastGestureDy.current =
        direction === 'down' ? MAX_DOWNWARD_TRANSLATE_Y : MAX_UPWARD_TRANSLATE_Y;
        Animated.spring(animatedValue, {
        toValue: lastGestureDy.current,
        useNativeDriver: true,
        }).start();
    };

    const bottomSheetAnimation = {
        transform: [
        {
            translateY: animatedValue.interpolate({
            inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
            outputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
            extrapolate: 'clamp',
            }),
        },
        ],
    };

    const progressBooking = (bookingId) =>{
        setFlag(2);
        const dataInput = {
          driverLocation: {
            // lat: location.latitude,
            // lng: location.longitude,
            lat: 10.771928429159146,
            lng: 106.6510009088608,
          },
        }
        axios
          .put(`${BASE_URL}/booking/driver/progress/${bookingId}`, dataInput)
          .then(res => {
            let bookingInfo = res.data.booking;
            console.log(bookingInfo);
          })
          .catch(e => {
            console.log(`Booking error ${e}`);
          });
      };

      const completeBooking = (bookingId) =>{
        const dataInput = {
          driverLocation: {
            // lat: location.latitude,
            // lng: location.longitude,
            lat: 10.771928429159146,
            lng: 106.6510009088608,
          },
        }
        axios
          .put(`${BASE_URL}/booking/driver/completed/${bookingId}`, dataInput)
          .then(res => {
            let bookingInfo = res.data.booking;
            console.log(bookingInfo);
            navigation.navigate('Home');
          })
          .catch(e => {
            console.log(`Booking error ${e}`);
          });
      };

    return (
    <SafeAreaView className="flex-1 bg-green-100">
        
        {booking !== undefined ? 
        (<View style = {styles.container}>
            <MapView
                style={styles.map}
                region={{
                latitude: flag === 1 ? (booking.driverLocation.lat + booking.pickupLocation.lat)/2 : (booking.driverLocation.lat + booking.destination.lat)/2,
                longitude: flag === 1 ? (booking.driverLocation.lng + booking.pickupLocation.lng)/2 : (booking.driverLocation.lng + booking.destination.lng)/2,
                latitudeDelta: flag === 1 ? Delta(booking.driverLocation, booking.pickupLocation) * DELTA_FACTOR : Delta(booking.driverLocation, booking.destination) * DELTA_FACTOR,
                longitudeDelta:flag === 1 ? Delta(booking.driverLocation, booking.pickupLocation) * DELTA_FACTOR : Delta(booking.driverLocation, booking.destination) * DELTA_FACTOR,
                }}
                >

                <Marker coordinate={{latitude: booking.driverLocation.lat, longitude: booking.driverLocation.lng}}><YourLocationView/></Marker>
                <Marker coordinate={flag === 1 ? {latitude: booking.pickupLocation.lat, longitude: booking.pickupLocation.lng} : {latitude: booking.destination.lat, longitude: booking.destination.lng}}><DestinationView/></Marker>
                <MapViewDirections
                    origin={{latitude: booking.driverLocation.lat, longitude: booking.driverLocation.lng}}
                    destination={flag === 1 ? {latitude: booking.pickupLocation.lat, longitude: booking.pickupLocation.lng}:{latitude: booking.destination.lat, longitude: booking.destination.lng}}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={5}
                    strokeColor="#0F5AF2"
                />
            </MapView>

            <Animated.View style={[styles.bottomSheet, bottomSheetAnimation]}>
                <View className="mt-3 ml-6 flex flex-row items-center">

                </View>
                <View className="bg-white mt-3 h-full">
                    <View style={styles.draggableArea} {...panResponder.panHandlers}>
                        <View style={styles.dragHandle} />
                    </View>
                    <View className="bg-white border border-slate-400 rounded-lg p-3 mx-3  flex flex-row justify-between items-center">
                        <View>
                            <Text className="text-lg text-black">Đặt bởi</Text>
                            <Text className="text-lg font-bold text-black">{booking.userId.displayName}</Text>
                        </View>
                        <View className="w-8 h-8 rounded-full bg-green-600 items-center justify-center">
                            <TouchableOpacity>
                            <MaterialIcons name="chat" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="p-3">
                        <View className="bg-white border border-slate-400 rounded-lg p-3 mt-2">
                            <View className="relative">
                                <View className="mt-2 border-l-2 absolute top-6 h-20 w-1 border-gray-200 left-2.5" />
                                <View className="flex flex-row gap-3 items-start">
                                    <MaterialIcons name="gps-fixed" size={24} color="#2F9E44" />
                                    <View className="mr-6">
                                        <Text className="font-bold text-black text-lg">{booking.pickupAddress.name}</Text>
                                        <Text className="text-gray-500 text-base">{booking.pickupAddress.fullAddress}</Text>
                                    </View>
                                </View>
                                <Text className="font-medium text-gray-500 ml-9 mt-4 text-base">{(booking.distance/1000).toFixed(1)}km - {(booking.duration/60).toFixed(0)} phút</Text>
                                <View className="flex flex-row gap-3 items-start mt-2">
                                    <MaterialIcons name="location-on" size={24} color="#E03131" />
                                    <View className="mr-6">
                                        <Text className="font-bold text-black text-lg">{booking.destinationAddress.name}</Text>
                                        <Text className="text-gray-500 text-base">{booking.destinationAddress.fullAddress}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="bg-white border border-slate-400 rounded-lg p-3 mt-4">
                            <View className="flex flex-row justify-between items-center mb-2">
                              <Text className="text-lg font-bold">Tổng tiền</Text>
                              <Text className="text-green-600 text-right font-bold text-xl">
                              {booking.price.toLocaleString('en-US')}
                              </Text>
                            </View>
                            <View className="flex flex-row justify-between items-center">
                              <Text className="text-lg font-bold">
                              Phương thức thanh toán: </Text>
                              <Text className="text-lg text-black">Tiền mặt</Text>
                            </View>
                        </View>
                    </View>

                    {flag === 1 ? (<TouchableOpacity className='flex items-center align-middle' onPress={() => progressBooking(booking._id)}>
                        <Button
                            className = 'mt-6 mb-1 p-1 rounded-lg bg-green-600 w-3/5 h-14'
                        > <Text className = 'text-white font-bold text-lg'>{status[0]}</Text></Button>
                    </TouchableOpacity>) : (<TouchableOpacity className='flex items-center align-middle' onPress={() => completeBooking(booking._id)}>
                        <Button
                            className = 'mt-6 mb-1 p-1 rounded-lg bg-green-600 w-3/5 h-14'
                        ><Text className = 'text-white font-bold text-lg'>{status[1]}</Text></Button>
                    </TouchableOpacity>)}
                </View>
            </Animated.View>     
        </View>) : (<Text>Chưa có đơn</Text>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    height: BOTTOM_SHEET_MAX_HEIGHT,
    bottom: BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: '#a8bed2',
        shadowOpacity: 1,
        shadowRadius: 6,
        shadowOffset: {
          width: 2,
          height: 2,
        },
      },
    }),
    backgroundColor: '#16A34A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  draggableArea: {
    width: 132,
    height: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 100,
    height: 6,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
  },
  loader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapScreen