require('dotenv').config();
const express = require('express');
const connectToDB = require('./database/db');
const authRoutes = require('./routes/auth-routes');
const homeRoutes= require('./routes/home-routes');
const adminRoutes= require('./routes/admin-routes');
const uploadImageRoutes = require('./routes/image-routes');
connectToDB(); // mongoDB connection successful

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json()); // it will parse our json request body.

app.use('/api/auth',authRoutes);
app.use('/api/home',homeRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/image',uploadImageRoutes);

app.listen(PORT,()=>{
console.log(`server is now listening to PORT ${PORT}`);
}) 