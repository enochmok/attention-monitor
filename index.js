// Import package
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);

//routes
const authRoutes = require('./lib/auth/api');

//Create Express Service
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//setting up database connection MongoDB
mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {

    if (err) {
        console.log(err);
    } else {
        console.log("Connected to MongoDB");
    }

});


//Using authentication function from ./lib/auth
app.use('/api', authRoutes);

// Listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is live at ${PORT}`);
});