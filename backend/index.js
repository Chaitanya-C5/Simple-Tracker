import express from "express";
import cors from "cors";
import { createServer } from 'http';
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('send-location', (data) => {
        io.emit('receive-location', { id: socket.id, ...data })
    })

    socket.on('disconnect', () => {
        io.emit('disconnect-user', {id: socket.id})
        console.log(`User disconnected: ${socket.id}`);
    })
})

server.listen(3000, () => {
    console.log("Server started");
})