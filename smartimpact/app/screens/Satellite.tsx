import React, { useRef, useEffect } from 'react'
import MapView, {Marker} from 'react-native-maps'
import tw from 'tailwind-react-native-classnames'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from '@/slices/navSlice'
import MapViewDirections from "react-native-maps-directions"

const Satellite = () => {
  const origin = useSelector(selectOrigin)
  const destination = useSelector(selectDestination)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!origin || !destination) return;

    mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: {top: 50, right: 50, bottom: 50, left: 50}
    })
  }, [origin, destination])

  return (
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
                latitude: origin?.location.lat || 37.7825,
                longitude: origin?.location.lng || 37.7825
              }}
              destination={{
                latitude: destination?.location.lat || 37.7825,
                longitude: destination?.location.lng || 37.7825
              }}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ""}
              strokeWidth={4}
              strokeColor='red'
            />
          )}
          {destination?.location && (
            <Marker
              coordinate={{
                latitude: destination.location.lat,
                longitude: destination.location.lng
              }}
              title="Destination"
              description={destination.description}
              identifier='destination'
            />
          )}
          {origin?.location && (
            <Marker
              coordinate={{
                latitude: origin.location.lat,
                longitude: origin.location.lng
              }}
              title="Your Location"
              description={origin.description}
              identifier='origin'
            />
          )}
    </MapView>
    
  )
}

export default Satellite
