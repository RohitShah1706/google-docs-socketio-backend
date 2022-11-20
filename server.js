const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require("cors");
const {connectDB, findOrCreateDocument} = require("./db/dbFunctions")
const Document = require("./model/Document");
require("dotenv").config();

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const app = express();
const server = http.createServer(app);
// ! middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
}));
const io = socketio(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});


io.on("connection", socket => {
    console.log(`User connected: ${socket.id}`)

    // ! create or get document
    socket.on("get-document", async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        // ! client will listen for this event and update the document or create a new one 
        socket.emit("load-document", document.data);

        // ! user can either send or receive changes
        // ! one user will send changes to the server & server broadcast that change to all other users
        socket.on("send-changes", delta => {
            console.log(delta)
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        })

        // ! user can save the document
        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentId, {data});
        })
    })
})

const startServer = async () => {
    await connectDB(MONGO_URI)
        .then(() => {
            server.listen(PORT, () => {
                console.log(`Server listening on port ${PORT}`);
            })
        })
        .catch(err => {
            console.log(err)
        })
}
startServer();