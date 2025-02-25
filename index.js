const connectToMongo = require('./db');

const express = require('express'); 

var cors = require('cors')

const app = express(); 

const port = 1024;
app.use(cors());
app.use(express.json());
// available routes
app.use('/api/auth' , require('./routes/auth'))
app.use('/api/notes' , require('./routes/notes'))

app.get("/" , (req , res)=>{
    res.send("Hello world_got working"); 
})

app.listen(port , ()=>{
    console.log(`Notebook is running successfully on ${port}`); 
})

connectToMongo(); 