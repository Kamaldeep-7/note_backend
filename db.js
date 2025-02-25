const mongoose = require("mongoose");
const uri = "mongodb+srv://kamal70kr:vSMDEaRrPhviV0EB@noteapp.ozwbu.mongodb.net/?retryWrites=true&w=majority&appName=noteapp";

const connectToMongo = async()=>{
    
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

    }).then(()=>{
        console.log("Database connected successfully")
    }).catch(()=>{
        console.log("Connection problem in database")
    })
}

module.exports = connectToMongo;