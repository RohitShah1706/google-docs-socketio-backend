const {connectDB, findOrCreateDocument} = require("./db/dbFunctions")
const Document = require("./model/Document");
require("dotenv").config();

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const io = require("socket.io")(PORT, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
})

const startServer = async () => {
    await connectDB(MONGO_URI)
        .then(() => {
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

        })
        .catch(err => {
            console.log(err)
        })
}

startServer();