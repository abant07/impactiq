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
    if (!origin && !destination) return;

    mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: {top: 50, right: 50, bottom: 50, left: 50}
    })
  }, [origin, destination])

  return (
    <MapView
        style={tw`flex-1 bg-black`}
        initialRegion={{
          latitude: destination?.location.lat || 37.7825,
          longitude: destination?.location.lng || -122.4324,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}>
          {origin && destination && (
            <MapViewDirections
              origin={origin.description}
              destination={destination.description}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ""}
              strokeWidth={3}
              strokeColor='blue'
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
              identifier='Destination'
            />
          )}
    </MapView>
    
  )
}

export default Satellite
