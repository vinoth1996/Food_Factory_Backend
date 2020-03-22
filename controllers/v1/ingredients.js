const express = require('express');
const router = express.Router()
var config = require('../../config/dbConfig')
var pg = require('pg')

var client = new pg.Client(config.getPgSqlConnectionString())
client.connect();

/**
 * @swagger
 * /foodFactory/api/ingredients/createIngredient:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: Add ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ingredient
 *         description: add ingredient
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            availableQuantity:
 *              type: string
 *            thresholdQuantity:
 *              type: string 
 *            lotNumber:
 *              type: string
 *            price: 
 *               type: integer
 *            vendorName:
 *               type: string
 *            vendorEmail: 
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.post('/createIngredient', (req, res) => {
    const body = req.body;
    var jsonResp = {}
    req.models.Ingredients.exists({
        name: body.name        
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(!exists) {
            req.models.Ingredients.create([{
                name: body.name,
                availableQuantity: body.availableQuantity,
                thresholdQuantity: body.thresholdQuantity,
                price: body.price,
                vendorEmail: body.vendorEmail,
                vendorName: body.vendorName,
                lotNumber: body.lotNumber                  
            }], function (err, items) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                jsonResp.status = "success"
                jsonResp.message = "Ingredient created"
                req.models.Ingredients.get(items[0].id, function (err, ingredient) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    jsonResp.data = ingredient;
                    res.send(JSON.stringify(jsonResp));
                });
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Ingredient Already Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/ingredients/getAllIngredients:
 *   get:
 *     tags:
 *       - Ingredient
 *     description: get all ingredients which are present
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.get('/getAllIngredients', function(req, res) {
    var jsonResp = {}
    req.models.Ingredients.find({
        
    }, function(err, data) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(data.length != 0) {
            jsonResp.status = "success"
            jsonResp.message = "Ingredients found"
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            jsonResp.status = "success"
            jsonResp.message = "No Ingredients found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/ingredients/updateIngredient:
 *   put:
 *     tags:
 *       - Ingredient
 *     description: update ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ingredient
 *         description: update ingredient
 *         schema:
 *            type: object
 *         properties:
 *            lotNumber:
 *              type: string
 *            price:
 *              type: integer
 *            thresholdQuantity:
 *              type: integer
 *            availableQuantity:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error 
 */
router.put('/updateIngredient', (req, res) => {
    const body = req.body;
    var jsonResp = {}
    req.models.Ingredients.exists({
        lotNumber: body.lotNumber
    }, function(err, exists) { 
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(exists) {
            req.models.Ingredients.find({
                lotNumber: body.lotNumber
            }, function(err, data) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                data[0].save({
                    price: body.price,
                    availableQuantity: body.availableQuantity,
                    thresholdQuantity: body.thresholdQuantity
                }, function(err) {
                    if(err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    jsonResp.status = "success"
                    jsonResp.message = "Ingredient Updated!";
                    jsonResp.data = data[0]
                    res.send(JSON.stringify(jsonResp)); 
                }) 
            })
        } else {
            jsonResp.status = "failed"
            jsonResp.message = "Ingredient not found"
            res.status(500).send(JSON.stringify(jsonResp));            
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/ingredients/deleteIngredient:
 *   delete:
 *     tags:
 *       - Ingredient
 *     description: delete ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ingredient
 *         description: delete ingredient
 *         schema:
 *            type: object
 *         properties:
 *            lotNumber:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteIngredient', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    req.models.Ingredients.exists({
        lotNumber: body.lotNumber
    }, function (err, exists) {
        if (err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.Ingredients.find({
                lotNumber: body.lotNumber
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                data[0].remove(function (err) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    console.log("removed!");
                    jsonResp.status = "success";
                    jsonResp.message = "Ingredient Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Cannot delete a non existing ingredient!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

/**
 * @swagger
 * /foodFactory/api/ingredients/ingredientsByQuantity:
 *   get:
 *     tags:
 *       - Ingredient
 *     description: get all ingredients whose availableQuantity lesser than thresholdQuantity
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.get('/ingredientsByQuantity', function(req, res) {
    var jsonResp = {};
    req.models.Ingredients.find({
        
    }, function(err, data) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(data.length != 0) {
            var sql = 'select *from "ingredients" where "availableQuantity" < "thresholdQuantity"';
            client.query(sql, (err, ingredients) => {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.send(JSON.stringify(jsonResp));        
                } else {
                    jsonResp.status = "success"
                    jsonResp.message = "Ingredients found"
                    jsonResp.data = ingredients.rows
                    res.send(JSON.stringify(jsonResp));        
                }
            })    
        } else {
            jsonResp.status = "success"
            jsonResp.message = "No Ingredients found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

module.exports = router