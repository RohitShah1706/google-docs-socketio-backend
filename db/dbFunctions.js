const mongoose = require("mongoose")
const Document = require("../model/Document");

const defaultValue = "";

const connectDB = async (MONGO_URI) => {
    await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("MongoDB Connected")
        })
        .catch(err => {
            console.log(err)
        })
}

const findOrCreateDocument = async (id) => {
    if(id == null) {
        return
    }
    const document = await Document.findById(id);
    if(document) return document;
    return await Document.create({_id: id, data: defaultValue})
}

module.exports = {
    connectDB,
    findOrCreateDocument
}