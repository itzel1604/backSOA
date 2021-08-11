const {Router} = require('express');
const serverless = require("serverless-http")
const cors = require("cors")
const bodyparser = require("body-parser")
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const router = Router();

var jsonParser = bodyparser.json();
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'})

//Post Animales
router.post("/createAnimal", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    let id = uuidv4();

    (async () => {
        try {
            let data = {
                "pk": "Animal",
                "sk": id,
                "nameA": req.body.nameA,
                "animal": req.body.animal,
                "descripcion": req.body.description,
                "urlImg": req.body.urlImg,
                "createdAt": date
            }

            var params = {
                Item: data,
                ReturnConsumedCapacity: "TOTAL",
                TableName: `animales`
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

//Metodo GET Animales
router.get("/getAll", function(req,res) {
    var params = {
        TableName: `animales`,
    };

    dynamodb.scan(params, function(err, response){
        if(err) res.status(500).send(err)
        else{
            res.status(200).send(response)
        }
    })
});

//Metodo Get por nombre
router.get("/getAnimal/:nameA", function(req, res){
    (async => {
        try{
            var params ={
                TableName: "animales",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "Animal",
                    ":nameA": req.params.nameA
                },
                ExpressionAttributeNames: {
                    "#nameA": "nameA"
                },
                FilterExpression: "#nameA = :nameA",
            }

            dynamodb.query(params, function(err, response){
                if(err) res.status(500).send(err)
                else{
                    res.status(200).send(response.Items);
                }
            })

        }catch (err){
            res.status(500).send(err)
        }
    })()
})

//Editar Animal
router.put("/updateAnimal/:sk", jsonParser, function(req, res){
    var params = {
        TableName: "animales",
        Key: {
            "pk": "Animal",
            "sk": req.params.sk
        },
        UpdateExpression: "set nameA = :n, animal = :a, description = :d",
        ExpressionAttributeValues: {
            ":n": req.body.nameA,
            ":a": req.body.animal,
            ":d": req.body.description
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

//Eliminar Animal
router.delete("/deleteAnimal/:sk", function(req, res){
    var params = {
        TableName: "animales",
        Key: {
            "pk": "Animal",
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