const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Router = require('express').Router;
const router = Router();
const server = require('http').createServer(app);


//import controller routes
const apiRoutes = require('./controllers/route');

//preprocessor
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

// routes
app.use('/',apiRoutes);

//start server
server.listen(3000, () => {
    console.log(`Api listening on port 3000`);
});