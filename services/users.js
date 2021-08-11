const {Router} = require('express');
const serverless = require("serverless-http")
const cors = require("cors")
const bodyparser = require("body-parser")
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const router = Router();

var jsonParser = bodyparser.json();
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'})

//Metodo GET Usuarios
router.get("/getAllUsers", function(req,res) {
    var params = {
        TableName: `usuarios`,
    };

    dynamodb.scan(params, function(err, response){
        if(err) res.status(500).send(err)
        else{
            res.status(200).send(response)
        }
    })
});

//Metodo Post Usuarios
router.post("/createUser", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    let id = uuidv4();

    (async () => {
        try {
            let data = {
                "pk": "User",
                "sk": id,
                "nameU": req.body.nameU,
                "lastname": req.body.lastname,
                "email": req.body.email,
                "password": req.body.password,
                "createdAt": date
            }

            var params = {
                Item: data,
                ReturnConsumedCapacity: "TOTAL",
                TableName: `usuarios`
            }

            dynamodb.put(params, function(err, response) {
                if(err) res.status(500).send(error);
                else{
                    res.status(200).send(data);
                }
            })

        }catch (error)
        {
            return res.status(500).send(error)
        }
    })()

});

//editar Usuario
router.put("/updateUser/:sk", jsonParser, function(req, res){
    var params = {
        TableName: "usuarios",
        Key: {
            "pk": "User",
            "sk": req.params.sk
        },
        UpdateExpression: "set nameU = :n, lastname = :l, email = :e, password = :p",
        ExpressionAttributeValues: {
            ":n": req.body.nameU,
            ":l": req.body.lastname,
            ":e": req.body.email,
            ":p": req.body.password
        },
        ReturnValues: "UPDATED_NEW"
    };
    dynamodb.update(params, function(err, response){
        if(err) res.status(500).send(err)
        else { 
            res.status(200).send(response)
        }
    })
})

//Eliminar Usuario
router.delete("/deleteUser/:sk", function(req, res){
    var params = {
        TableName: "usuarios",
        Key: {
            "pk": "User",
            "sk": req.params.sk
        } 
    };

    dynamodb.delete(params, function(err, response){
        if(err) res.status(500).send(err)
        else{
            res.status(200).send(response)
        }
    })
})


module.exports = router;