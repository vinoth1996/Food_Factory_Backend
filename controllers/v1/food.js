const express = require('express');
const router = express.Router()
var config = require('../../config/dbConfig')
var pg = require('pg')

var client = new pg.Client(config.getPgSqlConnectionString())
client.connect();

/**
 * @swagger
 * /foodFactory/api/food/createFood:
 *   post:
 *     tags:
 *       - Food
 *     description: Add Food
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: food
 *         description: add food
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            cuisine:
 *              type: string
 *            ingredients:
 *              type: array 
 *            lotNumber:
 *              type: string
 *            costOfProduction: 
 *               type: integer
 *            sellingCost:
 *               type: integer
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.post('/createFood', function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.Food.exists({
        name: body.name
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(!exists) {
            req.models.Food.create([{
                name: body.name,
                createdAt: new Date(), 
                cuisine: body.cuisine,  
                lotNumber: body.lotNumber, 
                costOfProduction: body.costOfProduction, 
                sellingCost: body.sellingCost
            }], function (err, items) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                } else {
                    body.ingredients.forEach(item => {
                        req.models.Ingredients.exists({
                           lotNumber:  item
                        }, function(err, ingredientExists) {
                            if(err) {
                                console.log(err);
                                jsonResp.status = "failed"
                                jsonResp.message = "Internal server error"
                                res.status(500).send(JSON.stringify(jsonResp));                                        
                            }
                            if(ingredientExists) {
                                req.models.FoodRel.exists({
                                    foodLotNum: body.lotNumber,
                                    ingredientsLotNum: item
                                }, function(err, dataExist) {
                                    if(err) {
                                    console.log(err);
                                    jsonResp.status = "failed"
                                    jsonResp.message = "Internal server error"
                                    res.status(500).send(JSON.stringify(jsonResp));                                        
                                    }  
                                    if(!dataExist){
                                        req.models.FoodRel.create([{
                                            ingredientsLotNum: item, 
                                            foodLotNum: body.lotNumber
                                        }], function (err, items) {
                                            if(err) {
                                                console.log(err);
                                                jsonResp.status = "failed"
                                                jsonResp.message = "Internal server error"
                                                res.status(500).send(JSON.stringify(jsonResp));                                                    
                                            } else {
                                                jsonResp.message1 = "Values added in foodRel";                      
                                            }
                                        });    
                                    }
                                })            
                            }
                            if(!ingredientExists) {
                                jsonResp.status = "failed"
                                jsonResp.message = "Ingredient not exists"                                                    
                            }      
                        })
                    })
                    jsonResp.status = "success"
                    jsonResp.message2 = "Food created"
                    req.models.Food.get(items[0].id, function (err, food) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    jsonResp.data = food;
                    res.send(JSON.stringify(jsonResp));
                    });
                }
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Food Already Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/food/getAllFoods:
 *   get:
 *     tags:
 *       - Food
 *     description: get all foods which are present
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.get('/getAllFoods', function(req, res) {
    var jsonResp = {}
    req.models.Food.find({
        
    }, function(err, data) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(data.length != 0) {
            jsonResp.status = "success"
            jsonResp.message = "Foods found"
            // for(i=0; i < data.length; i++) {
            //     data[i].ingredients  =''
            // }
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            jsonResp.status = "success"
            jsonResp.message = "No Foods found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/food/updateFood:
 *   put:
 *     tags:
 *       - Food
 *     description: update food
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: food
 *         description: update food
 *         schema:
 *            type: object
 *         properties:
 *            lotNumber:
 *              type: string
 *            costOfProduction:
 *              type: integer
 *            sellingCost:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error 
 */
router.put('/updateFood', function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.Food.exists({
        lotNumber: body.lotNumber
    }, function(err, exists) { 
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(exists) {
            req.models.Food.find({
                lotNumber: body.lotNumber
            }, function(err, data) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                data[0].save({
                    costOfProduction: body.costOfProduction,
                    sellingCost: body.sellingCost
                }, function(err) {
                    if(err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    jsonResp.status = "success"
                    jsonResp.message = "Food Updated!";
                    jsonResp.data = data[0]
                    res.send(JSON.stringify(jsonResp)); 
                }) 
            })
        } else {
            jsonResp.status = "failed"
            jsonResp.message = "Food not found"
            res.status(500).send(JSON.stringify(jsonResp));            
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/food/deleteAllFoods:
 *   delete:
 *     tags:
 *       - Food
 *     description: delete food
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: food
 *         description: delete food
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
router.delete('/deleteAllFoods', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Food.exists({
        lotNumber: body.lotNumber
    }, function (err, exists) {
        if (err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.Food.find({
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
                    jsonResp.message = "Food Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Cannot delete a non existing food!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

/**
 * @swagger
 * /foodFactory/api/food/foodByCost:
 *   get:
 *     tags:
 *       - Food
 *     description: get all foods whose costOfProduction higher than selling cost
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.get('/foodByCost', function(req, res) {
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Food.find({
        // costOfProduction: orm.gt(req.models.Food.find(sellingCost))
    }, function(err, data) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(data.length != 0) {
            var sql = 'select *from "food" where "costOfProduction" > "sellingCost"';
            client.query(sql, (err, foods)=> {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.send(JSON.stringify(jsonResp));        
                } else {
                    jsonResp.status = "success"
                    jsonResp.message = "Foods found"
                    jsonResp.data = foods.rows
                    res.send(JSON.stringify(jsonResp));        
                }
            })
        } else {
            console.log("foods:" + data)
            jsonResp.status = "success"
            jsonResp.message = "No Foods found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

module.exports = router