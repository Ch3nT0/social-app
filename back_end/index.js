const express = require("express");
require("dotenv").config();
const database = require("./config/database");
const routeApiClient = require("./routers/client/index.route");
// const routeApiAdmin = require("./routes/admin/index.route");
const bodyParser = require('body-parser');
const http = require('http'); // Import module http
const { Server } = require('socket.io'); // Import Socket.IO Server
const cors = require('cors');

database.connect();
const app = express();
const port = process.env.PORT || 5000; 
app.use(cors()); 
app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

global.io = io; 
global.activeUsers = new Map(); 

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('addUser', (userId) => {
        global.activeUsers.set(userId, socket.id);
        console.log(`User ${userId} joined, active users: ${global.activeUsers.size}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        global.activeUsers.forEach((value, key) => {
            if (value === socket.id) {
                global.activeUsers.delete(key);
            }
        });
    });

    socket.on('joinPostRoom', (postId) => {
        socket.join(postId); 
        console.log(`Socket ${socket.id} joined room: ${postId}`);
    });
    socket.on('leavePostRoom', (postId) => {
        socket.leave(postId);
        console.log(`Socket ${socket.id} left room: ${postId}`);
    });
});


routeApiClient(app);
// routeApiAdmin(app);


server.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
});