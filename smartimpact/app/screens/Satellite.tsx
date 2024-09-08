import React, { useRef, useEffect, useState } from 'react'
import MapView, {AnimatedRegion, Marker} from 'react-native-maps'
import tw from 'tailwind-react-native-classnames'
import { useDispatch, useSelector } from 'react-redux'
import { selectDestination, selectOrigin, selectVehicle, setDistanceTravel, setTravelTimeInformation } from '@/slices/navSlice'
import MapViewDirections from "react-native-maps-directions"
import imagePath from '@/constants/imagePath'
import { setOrigin } from '@/slices/navSlice';
import { Platform, View, TouchableOpacity, Image } from 'react-native'
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
  const { coordinate } = state

  useEffect(() => {
    if (!origin) return
    setState({
      ...state,
        coordinate: new AnimatedRegion( {
          latitude: origin.location.lat,
          longitude: origin.location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
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
    setStartedRoute(false)
    // TODO:
    // execute crash logic
    // get actual car data
    // get private key once it expires? do we need it for streaming? How much data does streaming give. may need to call telemetry api and filter based on timestamp
    const eventSource = new EventSource(`http://10.0.0.44:3000/events?tokenId=${vehicleid}`);
    if ((!origin || !destination) && !startedRoute) return;

    if (origin && destination && !startedRoute) {
      eventSource.close();
    }
    else{
      eventSource.addEventListener('message', (event) => {
        const parsedData = JSON.parse(event.data);
        animate(parsedData.latitude, parsedData.longitude)
        dispatch(setOrigin({
          location: {lat: parsedData.latitude, lng: parsedData.longitude},
          description: `(${parsedData.latitude},${parsedData.longitude})`
        }))

        setState({
          ...state,
            coordinate: new AnimatedRegion( {
              latitude: parsedData.latitude,
              longitude: parsedData.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
          })
        })
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
      <View style={tw`h-3/5`}>
          <MapView
          ref={mapRef}
          style={tw`flex-1`}
          initialRegion={{
            latitude: destination?.location.lat || 37.7825,
            longitude: destination?.location.lng || -122.4324,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
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
        {destination && !startedRoute && (
            <TouchableOpacity style={{
              position: "absolute",
              bottom: 0,
              right: 0
            }}
            onPress={startRoute}
            >
            <Image source={imagePath.greenIndicator}/>
          </TouchableOpacity>
        )}

        {destination && startedRoute && (
            <TouchableOpacity style={{
              position: "absolute",
              bottom: 20,
              right: 20
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
