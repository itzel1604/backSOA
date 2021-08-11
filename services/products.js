const {Router} = require('express');
const serverless = require("serverless-http")
const cors = require("cors")
const bodyparser = require("body-parser")
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const router = Router();

var jsonParser = bodyparser.json();
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'})

//Metodo GET Productos
router.get("/getAllProducts", function(req,res) {
    var params = {
        TableName: `products`,
    };

    dynamodb.scan(params, function(err, response){
        if(err) res.status(500).send(err)
        else{
            res.status(200).send(response)
        }
    })
});

//Metodo Get por nombre
router.get("/getProduct/:producto", function(req, res){
    (async => {
        try{
            var params ={
                TableName: "products",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "Product",
                    ":producto": req.params.producto
                },
                ExpressionAttributeNames: {
                    "#producto": "producto"
                },
                FilterExpression: "#producto = :producto",
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

//Crear Productos
router.post("/createProduct", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    let id = uuidv4();

    (async () => {
        try {
            let data = {
                "pk": "Product",
                "sk": id,
                "producto": req.body.producto,
                "category": req.body.category,
                "description": req.body.description,
                "urlImg": req.body.urlImg,
                "price": req.body.price,
                "createdAt": date
            }

            var params = {
                Item: data,
                ReturnConsumedCapacity: "TOTAL",
                TableName: `products`
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

//editar producto
router.put("/updateProduct/:sk", jsonParser, function(req, res){
    var params = {
        TableName: "products",
        Key: {
            "pk": "Product",
            "sk": req.params.sk
        },
        UpdateExpression: "set producto = :n, category = :c, description = :d, price = :p",
        ExpressionAttributeValues: {
            ":n": req.body.producto,
            ":c": req.body.category,
            ":d": req.body.description,
            ":p": req.body.price
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

//Eliminar Producto
router.delete("/deleteProduct/:sk", function(req, res){
    var params = {
        TableName: "products",
        Key: {
            "pk": "Product",
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