import React, { useRef, useEffect, useState } from 'react'
import MapView, {AnimatedRegion, Marker} from 'react-native-maps'
import tw from 'tailwind-react-native-classnames'
import { useDispatch, useSelector } from 'react-redux'
import { selectDestination, selectOrigin, selectVehicle, setDistanceTravel, setTravelTimeInformation } from '@/slices/navSlice'
import MapViewDirections from "react-native-maps-directions"
import imagePath from '@/constants/imagePath'
import { setOrigin } from '@/slices/navSlice';
import { Platform, View, TouchableOpacity, Image, Modal, Text } from 'react-native'
import EventSource from 'react-native-sse';

const Satellite = () => {
  const origin = useSelector(selectOrigin)
  const markerRef = useRef(null)
  const destination = useSelector(selectDestination)
  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const vehicleid = useSelector(selectVehicle)
  const [startedRoute, setStartedRoute] = useState(false)
  const [state, setState] = useState({
    coordinate: new AnimatedRegion( {
      latitude: origin?.location.lat,
      longitude: origin?.location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    })
  })
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const { coordinate } = state

  useEffect(() => {
    setStartedRoute(false)
  }, [vehicleid])

  useEffect(() => {
    if (!origin) return
    setState({
      ...state,
        coordinate: new AnimatedRegion( {
          latitude: origin.location.lat,
          longitude: origin.location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
      })
    })
    mapRef.current.animateToRegion({
      latitude: origin.location.lat,
      longitude: origin.location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    })

    if (!origin || !destination) return;

    if (!startedRoute) {
      mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
        edgePadding: {right: 50, bottom: 50, left: 50, top: 50}
      })
    }

  }, [origin, destination])

  useEffect(() => {
    if ((!origin || !destination) && !startedRoute) return;
    //const eventSource = new EventSource(`http://10.0.0.44:3000/events?tokenId=${vehicleid}`);
    const eventSource = new EventSource(`http://10.0.0.44:3000/test`);
    if (origin && destination && !startedRoute) {
      eventSource.close();
    }
    else{
      eventSource.addEventListener('message', (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.crash) {
          setStartedRoute(false)
          setShowEmergencyAlert(true);
        }
        /*
        const telemetryData = parsedData.telemetry
        animate(parsedData.currentLocationLatitude, telemetryData.currentLocationLongitude)
        dispatch(setOrigin({
          location: {lat: telemetryData.currentLocationLatitude, lng: telemetryData.currentLocationLongitude},
          description: `(${telemetryData.currentLocationLatitude},${telemetryData.currentLocationLongitude})`
        }))

        setState({
          ...state,
            coordinate: new AnimatedRegion( {
              latitude: telemetryData.currentLocationLatitude,
              longitude: telemetryData.currentLocationLongitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
          })
        })
        */
      });

      return () => {
          eventSource.close();
      };
    }
  }, [startedRoute])

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude}
    if (Platform.OS == "android") {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000)
      }
    }
    else {
      coordinate.timing(newCoordinate).start()
    }
  }

  const startRoute = () => {
    setStartedRoute(true)
    mapRef.current.animateToRegion({
      latitude: origin.location.lat,
      longitude: origin.location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    })
  }

  const endRoute = () => {
    setStartedRoute(false)
    mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: {right: 50, bottom: 50, left: 50, top: 50}
    })
  }

  return (
      <View style={[tw`h-4/6 p-4`, {backgroundColor: "#1E2132"}]}>
        <View style={[tw`flex-1`, { borderRadius: 20, overflow: 'hidden' }]}>
            <MapView
            ref={mapRef}
            style={tw`flex-1 rounded-lg`}
            initialRegion={{
              latitude: destination?.location.lat || 37.7825,
              longitude: destination?.location.lng || -122.4324,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
              {origin && destination && (
                <MapViewDirections
                  origin={{
                    latitude: origin.location.lat,
                    longitude: origin.location.lng
                  }}
                  
                  destination={{
                    latitude: destination.location.lat,
                    longitude: destination.location.lng
                  }}
                  onReady={result => {
                    dispatch(setTravelTimeInformation(result.duration))
                    dispatch(setDistanceTravel(result.distance))
                  }}
                  apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ""}
                  strokeWidth={4}
                  strokeColor='red'
                  optimizeWaypoints={true}
                />
              )}

              {destination?.location && (
                <Marker
                  coordinate={{
                    latitude: destination.location.lat,
                    longitude: destination.location.lng
                  }}
                  image={imagePath.greenMarker}
                  title="Destination"
                  description={destination.description}
                  identifier='destination'
                />
              )}

              {origin?.location && (
                <Marker.Animated
                  ref={markerRef}
                  coordinate={coordinate}
                  image={imagePath.curLocation}
                  title="Your Location"
                  description={origin.description}
                  identifier='origin'
                />
              )}
          </MapView>
        </View>
        <Modal
          visible={showEmergencyAlert}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEmergencyAlert(false)} // Handles back button on Android
        >
          <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold text-center mb-4`}>We think you got into a crash.</Text>
              
              <View style={tw`flex-row justify-between mt-4`}>
                <TouchableOpacity
                  style={[tw`py-2 px-4 rounded`, { backgroundColor: "red" }]}
                  onPress={() => {
                    // Handle Call 911 action
                    setShowEmergencyAlert(false);
                  }}
                >
                  <Text style={tw`text-white font-bold`}>Call 911</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[tw`py-2 px-4 rounded border`, { backgroundColor: "white", borderColor: "black" }]}
                  onPress={() => {
                    setShowEmergencyAlert(false)
                    setStartedRoute(true)
                  }}
                >
                  <Text style={tw`text-black font-bold`}>I'm Okay!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {destination && !startedRoute && (
            <TouchableOpacity style={{
              position: "absolute",
              bottom: 10,
              right: 10
            }}
            onPress={startRoute}
            >
            <Image source={imagePath.greenIndicator}/>
          </TouchableOpacity>
        )}

        {destination && startedRoute && (
            <TouchableOpacity style={{
              position: "absolute",
              bottom: 30,
              right: 30
            }}
            onPress={endRoute}
            >
            <Image source={imagePath.cancel}/>
          </TouchableOpacity>
        )}
      </View>
  )
}

export default Satellite
