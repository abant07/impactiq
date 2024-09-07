import React, { useRef, useEffect, useState } from 'react'
import MapView, {AnimatedRegion, Marker} from 'react-native-maps'
import tw from 'tailwind-react-native-classnames'
import { useDispatch, useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from '@/slices/navSlice'
import MapViewDirections from "react-native-maps-directions"
import imagePath from '@/constants/imagePath'
import { getLiveLocation } from '@/components/apis'
import { setOrigin } from '@/slices/navSlice';
import { Platform, View, TouchableOpacity, Image } from 'react-native'

const Satellite = () => {
  const origin = useSelector(selectOrigin)
  const markerRef = useRef(null)
  const destination = useSelector(selectDestination)
  const mapRef = useRef(null)
  const dispatch = useDispatch()
  const [startedRoute, setStartedRoute] = useState(false)
  const [state, setState] = useState({
    coordinate: new AnimatedRegion( {
      latitude: origin?.location.lat,
      longitude: origin?.location.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
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

    if (!origin || !destination) return;

    if (!startedRoute) {
      mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
        edgePadding: {right: 50, bottom: 50, left: 50, top: 50}
      })
    }

  }, [origin])

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    if (!origin || !destination) return;

    const{ lat, lng} = await getLiveLocation(origin.location.lat, origin.location.lng)
    animate(lat, lng)
    dispatch(setOrigin({
      location: {lat: lat, lng: lng},
      description: `(${lat},${lng})`
    }))

    setState({
      ...state,
        coordinate: new AnimatedRegion( {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
      })
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentLocation()
    }, 4000)
    return () => clearInterval(interval)
  })

  const animate = (latitude, longitude) =>{
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

  const onCenter = () => {
    setStartedRoute(true)
    mapRef.current.animateToRegion({
      latitude: origin.location.lat,
      longitude: origin.location.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
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
        {destination && (
            <TouchableOpacity style={{
              position: "absolute",
              bottom: 0,
              right: 0
            }}
            onPress={onCenter}
            >
            <Image source={imagePath.greenIndicator}/>
          </TouchableOpacity>
        )}
      </View>
  )
}

export default Satellite
