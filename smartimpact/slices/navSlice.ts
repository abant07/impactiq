import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    vehicle: null,
    origin: null,
    destination: null,
    travelTimeInformation: null,
    distance: null
}


export const navSlice = createSlice({
    name: "nav",
    initialState,
    reducers: {
        setVehicle: (state, action) => {
            state.vehicle = action.payload
        },
        setOrigin: (state, action) => {
            state.origin = action.payload
        },
        setDestination: (state, action) => {
            state.destination = action.payload
        },
        setTravelTimeInformation: (state, action) => {
            state.travelTimeInformation = action.payload
        },
        setDistanceTravel: (state, action) => {
            state.distance = action.payload
        }
    }
})

export const { setOrigin, setDestination, setTravelTimeInformation, setVehicle, setDistanceTravel } = navSlice.actions


// selectors
export const selectOrigin = (state) => state.nav.origin
export const selectDestination = (state) => state.nav.destination
export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation
export const selectVehicle = (state) => state.nav.vehicle
export const selectDistance = (state) => state.nav.distance

export default navSlice.reducer
