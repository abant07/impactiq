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
    
    const streamId = 'streams.dimo.eth/firehose/weather';
    
    client.subscribe(streamId, (message) => {
        console.log(message.data.ambientTemp)
        res.write(`data: ${message.data.ambientTemp}\n\n`);
    })

    // Close connection
    req.on('close', () => {
        client.unsubscribe();
        res.end();
    });
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
