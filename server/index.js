const express = require('express');
const cors = require('cors');
const Streamr = require("@streamr/sdk")

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
    
    const telemetry = ""
    const data = telemetry.split(", ")
    let index = 0
    const sendWords = () => {
        if(index < data.length) {
            res.write(`data: ${data[index]}\n\n`)
            index++
        }
        else {
            clearInterval(interval)
        }
    }

    const interval = setInterval(sendWords, 500)

    req.on("close", () => {
        clearInterval(interval)
        res.end()
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function detectCrash(data) {
    return true;
}