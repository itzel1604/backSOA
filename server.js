const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyparser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid");

var dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

var jsonParser = bodyparser.json(); 
const app = express();
app.use(cors());

app.get('/', function(req, res){
    res.send({"stage": "dev"});
});


app.use(require('./services/animals'));

app.use(require('./services/users'));

app.use(require('./services/products'));

var server = app.listen(4000, function(){
    console.log("Corriendo en localhost:4000");
})


module.exports.handler = serverless(app);