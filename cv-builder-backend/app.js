const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { config } = require('dotenv');
const cors = require('cors'); // Import the cors middleware

config();

const app = express();

const Mongodb_Url = process.env.Mongodb_Url;

// Enable CORS for all origins
app.use(cors());

// Alternatively, you can specify the origin to only allow your frontend:
// app.use(cors({
//     origin: 'http://localhost:5173',  // Your frontend's URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
// }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const authRoutes = require('./Routes/auth');
const controllerRoutes = require('./Routes/controllerRoutes');
const submitFormData = require('./Routes/formData.Routes')

// Use routes
app.use('/api', authRoutes);
app.use("/api", controllerRoutes);
app.use("/api", submitFormData);

// Connect to MongoDB and start server
mongoose.connect(Mongodb_Url)
    .then(() => {
        app.listen(3000, () => console.log("Running on http://localhost:3000"));
    })
    .catch(err => {
        console.log(err);
    });
