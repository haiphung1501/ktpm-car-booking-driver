import {
  SafeAreaView,
  ScrollView,
  PermissionsAndroid,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {useRef, useState, useEffect, useContext} from 'react';
import Images from '../../utils/sources';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import Geolocation from 'react-native-geolocation-service';
import {AuthContext} from '../../context/AuthContext';

import {BASE_URL} from '../../config';

import io from 'socket.io-client';
import {useGlobalStore} from '../../store/globalStore';
import {apiPut} from '../../apis/api';

const HomeScreen = ({navigation}) => {
  const [location, setLocation] = useState();
  const [loadingText, setLoadingText] = useState('Loading');
  const [isLoading, setIsLoading] = useState(true);

  const {userInfo} = useContext(AuthContext);

  const subscribeSocket = useGlobalStore.use.subscribeSocket();
  // const disconnect = useGlobalStore.use.disconnect();
  const orders = useGlobalStore.use.orders();
  const emitAcceptBookingEvent = useGlobalStore.use.emitAcceptBookingEvent();
  const bookingDetail = useGlobalStore.use.bookingDetail();
  const isBooking = useGlobalStore.use.isBooking();

  const [hasFetchedCurrentLocation, setHasFetchedCurrentLocation] =
    useState(false);

  console.log('re-render');

  useEffect(() => {
    let textAnimationInterval = null;
    let loadingTimeout = null;

    requestAccessPermission();

    if (!hasFetchedCurrentLocation) {
      getCurrentLocation();
      setHasFetchedCurrentLocation(true);
    }

    setIsLoading(true);
    textAnimationInterval = setInterval(() => {
      setLoadingText(prevText => {
        return prevText.length >= 13 ? 'Loading' : `${prevText}.`;
      });
    }, 500);

    subscribeSocket(userInfo);

    loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(textAnimationInterval);
    }, 5000);
    if (isBooking === 1) {
      // Navigate to MapScreen and pass bookingDetail as a prop
      navigation.navigate('Map', {booking: bookingDetail});
    }
    return () => {
      clearInterval(textAnimationInterval);
      clearTimeout(loadingTimeout);
      // disconnect();
    };
  }, [isBooking]);

  const requestAccessPermission = () => {
    if (Platform.OS === 'ios') {
      // Request location permission for iOS
      Geolocation.requestAuthorization('whenInUse');
    } else if (Platform.OS === 'android') {
      // Request location permission for Android
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Using the location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      )
        .then(granted => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the location');
          } else {
            console.log('Location permission denied');
          }
        })
        .catch(err => {
          console.warn(err);
        });
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        let location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(location);
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const acceptBooking = bookingId => {
    emitAcceptBookingEvent(bookingId);

    apiPut(`${BASE_URL}/booking/driver/accept/${bookingId}`, {
      driverLocation: {
        // lat: location.latitude,
        // lng: location.longitude,
        lat: 10.771928429159146,
        lng: 106.6510009088608,
      },
    })
      .then(res => {
        let bookingInfo = res.data.booking;
        // console.log(location.latitude, location.longitude);
        navigation.navigate('Map', {booking: bookingInfo});
      })
      .catch(e => {
        console.log(`Booking error ${e}`);
      });
  };

  return (
    <SafeAreaView className="flex bg-slate-200 h-full">
      <ScrollView className="flex bg-slate-200">
        <View className="h-[200px] bg-transparent">
          <Image
            source={Images.BgImg}
            className="w-full h-[200px] opacity-80 -mt-2.5"
          />
        </View>
        <View className="w-full flex justify-center items-center">
          <Text className="w-11/12 text-start font-bold text-black text-xl">
            Chuyến đi đang chờ:
          </Text>
        </View>
        {isLoading ? (
          <Text
            style={{
              marginTop: 10,
              fontSize: 16,
              fontWeight: 'bold',
              color: 'black',
              alignSelf: 'center',
            }}>
            {loadingText}
          </Text>
        ) : (
          <View className="pt-1 space-y-3 w-full flex justify-center items-center">
            {orders && orders.length > 0 ? (
              orders.map((order, index) => {
                const avatarURL = order.userId.avatar.url;

                return (
                  <View
                    key={index}
                    className="flex flex-row items-center w-11/12 px-3 py-2 bg-white rounded-2xl">
                    <View className="w-1/4">
                      {avatarURL ? (
                        <Image
                          source={{uri: avatarURL}}
                          className="w-20 h-20 rounded-full"
                        />
                      ) : (
                        <View className="w-20 h-20 bg-slate-500 rounded-full" />
                      )}
                      <Text className="text-gray-400 text-center font-medium mt-1">
                        {order.userId.displayName}
                      </Text>
                    </View>
                    <View className="flex flex-col items-end justify-end w-3/4">
                      <Text className="text-xl text-black font-medium">
                        {order.destinationAddress.name}
                      </Text>
                      <Text className="text-teal-600 text-lg font-bold">
                        {' '}
                        {order.price}VND
                      </Text>
                      <Text className="text-gray-400 font-medium mb-2">
                        {(order.distance / 1000).toFixed(1)}km -{' '}
                        {(order.duration / 60).toFixed(0)}p
                      </Text>
                      <View className="flex flex-row items-center ml-1 ">
                        <CustomButton
                          wrapperClass="py-2 px-3 m-0 mr-2 rounded-lg bg-white border-2 border-teal-600 flex flex-row items-center justify-center"
                          textClass="text-teal-600 font-bold text-xs"
                          label="Chấp nhận"
                          onPress={() => acceptBooking(order._id)}
                        />
                        <CustomButton
                          wrapperClass="p-2 m-0 rounded-lg bg-teal-600 border-2 border-transparent flex flex-row items-center justify-center"
                          textClass="text-white font-bold text-xs"
                          label="Huỷ"
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text>Không có đơn hàng.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
