import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    access: null,
    vehicle: null,
    origin: null,
    destination: null,
    travelTimeInformation: null 
}


export const navSlice = createSlice({
    name: "nav",
    initialState,
    reducers: {
        setAccess: (state, action) => {
            state.access = action.payload
        },
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
        }
    }
})

export const { setOrigin, setDestination, setTravelTimeInformation, setAccess, setVehicle } = navSlice.actions


// selectors
export const selectOrigin = (state) => state.nav.origin
export const selectDestination = (state) => state.nav.destination
export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation
export const selectAccess = (state) => state.nav.access
export const selectVehicle = (state) => state.nav.vehicle

export default navSlice.reducer
