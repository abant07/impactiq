const express = require('express');
const cors = require('cors');
const Streamr = require("@streamr/sdk")
const fs = require('fs');
const readline = require('readline');

const client = new Streamr({
    auth: {
        privateKey: process.env.DIMO_PRIVATE_KEY,
    },
});

const app = express()
const port = 3000

app.use(cors())

app.get("/events", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { tokenId } = req.query;

    const streamId = `streams.dimo.eth/vehicle/$${tokenId}`;
    
    client.subscribe(streamId, (message) => {
        console.log(message.data)
        let crashed = detectCrash(message.data)
        res.write(`data: ${JSON.stringify({crash: crashed, telemetry: {latitude: message.data.currentLocationLatitude, longitude: message.data.currentLocationLongitude}})}\n\n`);
    })

    req.on('close', () => {
        client.unsubscribe(streamId);
        res.end();
    });
})

app.get("/test", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const fileStream = fs.createReadStream('crash.txt');
    const rl = readline.createInterface({
        input: fileStream,
        output: process.stdout,
        terminal: false
    });
    const lines = []

    rl.on('line', (line) => {
        lines.push(line)
    });

    let index = 0
    const sendLine = () => {
        if (index < lines.length) {
            try {
                const jsonObject = JSON.parse(lines[index].replace(/'/g, '"')); // Convert to JSON
                let crashed = detectCrash(jsonObject)
                res.write(`data: ${JSON.stringify({crash: crashed, telemetry: jsonObject})}\n\n`);
                index++
            } catch (error) {
                console.error("Failed to parse line to JSON", error);
            }
        }
        else {
            clearInterval(invervalId)
        }
    };

    const invervalId = setInterval(sendLine, 1000) 

    // Handle the request being closed
    req.on('close', () => {
        clearInterval(invervalId);
        res.end();
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


let prevStreamData = null;

function detectCrash(data) {
    // Set default values for any missing data in the current stream
    const currentSpeed = Number(data.speed) || 0;
    const currentBaro = Number(data.obdBarometricPressure) || 0;
    const currentAlt = Number(data.currentLocationAltitude) || 0;
    const currentECT = Number(data.powertrainCombustionEngineECT) || 0;
    const currentLat = Number(data.currentLocationLatitude);
    const currentLng = Number(data.currentLocationLongitude);
    
    const frontLeftPressure = Number(data.chassisAxleRow1WheelLeftTirePressure) || 0;
    const frontRightPressure = Number(data.chassisAxleRow1WheelRightTirePressure) || 0;
    const rearLeftPressure = Number(data.chassisAxleRow2WheelLeftTirePressure) || 0;
    const rearRightPressure = Number(data.chassisAxleRow2WheelRightTirePressure) || 0;

    // Initialize previous stream data if it's null
    if (prevStreamData == null) {
        prevStreamData = data;
        return false;
    }

    // Set default values for any missing data in the previous stream
    const prevSpeed = Number(prevStreamData.speed) || 0;
    const prevBaro = Number(prevStreamData.obdBarometricPressure) || 0;
    const prevAlt = Number(prevStreamData.currentLocationAltitude) || 0;
    const prevLat = Number(prevStreamData.currentLocationLatitude);
    const prevLng = Number(prevStreamData.currentLocationLongitude);

    // Calculate time difference
    let deltaTime = (new Date(data.Timestamp).getTime() - new Date(prevStreamData.Timestamp).getTime()) / 1000;
    
    console.log(data.Timestamp)
    console.log(new Date(data.Timestamp))
    // Calculate speed change (deltaSpeed)
    let deltaSpeed = Math.abs(currentSpeed - prevSpeed);
    let acceleration = deltaSpeed / deltaTime;

    // Calculate distance using Haversine formula
    const R = 6371; // Radius of the Earth in km
    let latDiff = (currentLat - prevLat) * Math.PI / 180;
    let lngDiff = (currentLng - prevLng) * Math.PI / 180;

    const a = 
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(prevLat * Math.PI / 180) * Math.cos(currentLat * Math.PI / 180) * 
        Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const deltaDistance = R * c; // Distance in km

    // Crash Detection Logic
    const crashThreshold = 28.8; // Threshold for acceleration in km/h per second
    if (acceleration >= crashThreshold && deltaDistance < 0.05) {
        console.log("Potential crash detected!");

        // Altitude and Barometric Pressure Differences
        let difBaro = Math.abs(currentBaro - prevBaro);
        let difAlt = Math.abs(currentAlt - prevAlt);

        // Thresholds for altitude and barometric pressure
        const altitudeThreshold = 10; // 10 meters
        const baroThreshold = 1; // 1 kPa

        if (difBaro >= baroThreshold || difAlt >= altitudeThreshold) {
            prevStreamData = data
            return true;
        } else {
            // Final check for tire pressure and engine coolant temperature
            const coolantThreshold = 220; // Fahrenheit
            const lowTirePressureThreshold = 20; // psi

            if (currentECT >= coolantThreshold || 
                frontLeftPressure < lowTirePressureThreshold || 
                frontRightPressure < lowTirePressureThreshold || 
                rearLeftPressure < lowTirePressureThreshold || 
                rearRightPressure < lowTirePressureThreshold) {
                    prevStreamData = data
                    return true;
            } else {
                prevStreamData = data
                return false;
            }
        }
    } else {
        prevStreamData = data
        console.log("no crash at all")
        return false;
    }
}
