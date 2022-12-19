const express = require('express');
require('dotenv').config();

//Crating express app
const app = express();

//importing Translate Router
const translateRouter = require('./routes/router');


//middleware for the api
app.use('/api', translateRouter);

//listening on port 5000
app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
})