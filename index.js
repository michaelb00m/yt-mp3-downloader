// very widely used server framework (expressjs.com)
const express = require('express');
// initalization of an express instance
const app = express();
// creation of the server with app as the handler function for inbound connections
const http = require('http').createServer(app);
// middleware for parsing http bodies
const bodyparser = require('body-parser');
// nodejs core module for path operations (filesystem)
const path = require('path');
// library for real time data transfer without having to reload
const io = require('socket.io')(http);

// the object that handles the downloads
const downloader = require('./downloader');

const debug = false;

// initialization of array for downloaded files and connected clients
let files = [];
let httpClients = [];
let sockets = [];

// handler function for freshly connecting client sockets
io.on('connection', socket => {
    // find the right entry in the httpClients array
    let index = httpClients.findIndex(el => el.address === socket.handshake.address)
    // set the socket of the right entry
    try {
        httpClients[index].socket = socket;
    } catch (e) {
	sockets.push(socket);
    }
});

// configuring middleware for body parsing
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// setting a handler function for the progress event emitted by the downloader
// (sub stands for subscribe)
downloader.subProgress((progress, id) => {
    // find the desired client from the list of connected clients and get its 
    // socket
    const socket = httpClients.find(el => el.id === id).socket;
    // send the percentage of the downloads progress to the client
    debug ? console.log(progress.percentage.toString()) : null;
    socket.emit('progress', progress.percentage.toString());
});

// setting a handler function for the finished event emitted by the downloader
downloader.subFinish((data, id) => {
    // find the desired client from the list of connected clients and get its 
    // socket
    const socket = httpClients.find(el => el.id == data.videoId).socket;
    // send the id of the finished audio to the client
    socket.emit('finished', id);
    // remove the client from the list of connected clients
    httpClients.splice(httpClients.indexOf(socket));
    // add the id and file path to the files array
    files.push({
        id,
        file: data.file
    })
})

// handler function for GET requests to '/'
app.get('/', (req, res) => {
    // sends index.html to the client and closes the connection
    res.sendFile(path.join(__dirname, './index.html'));
});

// handler function for POST requests to '/convert' (the requests which come
// from submitting the form)
app.post('/convert', (req, res) => {
    // get the url parameter from the parsed body
    const { url } = req.body;
    // find the id in the url
    const id = url.split('/')[3];
    // redirect the client to `convert/${id}`
    res.redirect(`/convert/${id}`);
});

// handler function for GET requests to '/convert/:id'
// '/convert/:id' stands for every url with /convert/ and something after it
// and tells express that everything after /convert/ is an argument with the
// name id
app.get('/convert/:id', (req, res) => {
    // getting the id parameter from the parsed url
    const { id } = req.params;
    // adding the new client to the list of clients (without the socket because
    // the connection is not yet established)
    if (sockets.find((socket) => socket.handshake.address === req.connection.remoteAddress)) {
	httpClients.push({
	    address: req.connection.remoteAddress,
	    id,
	    socket: sockets.find((socket) => socket.handshake.address === req.connection.remoteAddress)
	});
    } else {
        httpClients.push({
           address: req.connection.remoteAddress,
           id,
           socket: null
        })
    }
    // sends convert.html to the client and closes the connection
    res.sendFile(path.join(__dirname, 'convert.html'));
    // starts the download (and conversion) of the desired video
    debug ? console.log('download started') : null;
    downloader.download(id);
})

// handler function for GET requests to '/download/:id'
// this function just serves the files for download
app.get('/download/:id', (req, res) => {
    // getting the id parameter from the parsed url
    const { id } = req.params;
    // sending the desired MP3 to the client for download
    res.download(files.find(el => el.id === id).file);
})

// 'starting' the server (start listening for inbound connections) on port
// 3141 ;)
http.listen(3141, () => {
    console.log('Listening on localhost:3141');
});
