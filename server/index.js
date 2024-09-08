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
    
    const streamId = `streams.dimo.eth/vehicle/${tokenId}`;
    
    client.subscribe(streamId, (message) => {
        console.log(message.data)
        // write the crash logic
        let crashed = detectCrash(message.data)
        res.write(JSON.stringify({crash: crashed, data: message.data}));
    })

    req.on('close', () => {
        client.unsubscribe();
        res.end();
    });
})

app.post("/terminate", () => {
    client.unsubscribe();
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function detectCrash(data) {
    return true;
}