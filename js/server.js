const express = require("express");
const path = require("path");
const app = express();
const PORT = 80;
const LanguageModel = require("./languageModel");
const http = require('http');

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});
//
// app.use(express.static(path.join(__dirname, '../chatbot/build')));
//
app.get("/", (request, result) => {
    result.send('aboba')
    // result.sendFile(path.join(__dirname, '../chatbot/build/index.html'));
})
server.listen(PORT, function () {
    console.log(`server started at port ${PORT}`);
});
//
// io.on("connection", (socket) => {
//     console.log(`connect ${socket.id}`);
//
//     socket.on("disconnect", (reason) => {
//         console.log(`disconnect ${socket.id} due to ${reason}`);
//     });
//
//     const model = new LanguageModel();
//
//     socket.on("question", (data) => {
//         console.log("received question: "+data)
//         let answer;
//
//         try {
//             answer = model.getAnswer(data);
//         }
//         catch (e) {
//             answer = "An error occurred: " + e;
//         }
//         socket.emit("answer", answer);
//     });
//
// });
//
