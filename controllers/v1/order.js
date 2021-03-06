const express = require('express');
const router = express.Router()
var config = require('../../config/dbConfig')
var verifyToken = require('../../verifyToken');
var pg = require('pg')

var client = new pg.Client(config.getPgSqlConnectionString())
client.connect();

/**
 * @swagger
 * /foodFactory/api/order/createOrder:
 *   post:
 *     tags:
 *       - Order
 *     description: User to create order
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: user to create order
 *         schema:
 *            type: object
 *         properties:
 *            lotNumber:
 *              type: string
 *            quantity:
 *              type: integer
 *            email:
 *              type: string
 *            modeOfTransport:
 *              type: string 
 *            dateOfDelivery:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.post('/createOrder', verifyToken, function(req, res) {
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
            }, function(err, food) {
                // console.log('......' + food)
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));                    
                } else {
                    req.models.User.exists({
                        email: body.email
                    }, function(err, userExists) {
                        if(err) {
                            console.log(err);
                            jsonResp.status = "failed"
                            jsonResp.message = "Internal server error"
                            res.status(500).send(JSON.stringify(jsonResp));                    
                        } 
                        if(userExists) {
                            req.models.Order.create([{
                                quantity: body.quantity,
                                email: body.email,
                                costPrice: food[0].sellingCost,
                                sellingPrice: food[0].sellingCost + 10,
                                status: 'new order',
                                orderDate: new Date(),
                                dateOfDelivery: body.dateOfDelivery,
                                modeOfTransport: body.modeOfTransport
                            }], function(err, data) {
                                if(err) {
                                    console.log(err);
                                    jsonResp.status = "failed"
                                    jsonResp.message = "Internal server error"
                                    res.status(500).send(JSON.stringify(jsonResp));                                        
                                } else {
                                    jsonResp.data = data[0]
                                    req.models.OrderRel.create([{
                                        orderNum: data[0].id,
                                        foodLotNum: body.lotNumber,
                                        quantity: body.quantity,
                                        amount: (data[0].sellingPrice) * (body.quantity)
                                    }], function(err, items) {
                                        if(err) {
                                            console.log(err);
                                            jsonResp.status = "failed"
                                            jsonResp.message = "Internal server error"
                                            res.status(500).send(JSON.stringify(jsonResp));                                                
                                        } else {
                                            jsonResp.status = "success"
                                            jsonResp.message1 = "Order created"
                                            jsonResp.message2 = "Values inserted in orderRel"
                                            res.send(JSON.stringify(jsonResp));
                                        }
                                    })        
                                }
                            })        
                        } else {
                            jsonResp.status = "failed"
                            jsonResp.message = "User not found"
                            res.send(JSON.stringify(jsonResp));        
                        }
                    })        
                }
            })
        } else {
            jsonResp.status = "failed"
            jsonResp.message = "Food not found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/order/getAllOrders:
 *   get:
 *     tags:
 *       - Order
 *     description: User to get all orders
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: user to get all orders
 *         schema:
 *            type: object
 *         properties:
 *            email:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.get('/getAllOrders', verifyToken, function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.User.find({
        email: body.email
    }, function(err, data) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));                    
        } 
        if(data.length != 0) {
            var sql = `Select * from "order" join "orderRel" on "id" = "orderNum" where "order".email = '${body.email}'`
            client.query(sql, (err, orders) => {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.send(JSON.stringify(jsonResp));        
                } else {
                    jsonResp.status = "success"
                    jsonResp.message = "Orders found"
                    jsonResp.data = orders.rows
                    res.send(JSON.stringify(jsonResp));        
                }
            })
        } else {
            jsonResp.status = "failed"
            jsonResp.message = "User not found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

/**
 * @swagger
 * /foodFactory/api/order/updateOrder:
 *   put:
 *     tags:
 *       - Order
 *     description: update order
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: update order
 *         schema:
 *            type: object
 *         properties:
 *            dateOfDelivery:
 *              type: string
 *            id:
 *              type: integer
 *            status:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.put('/updateOrder', verifyToken, function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.Order.exists({
        id: body.id
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));                    
        } 
        if(exists) {
            req.models.Order.find({
                id: body.id
            }, function(err, data) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));                            
                }
                data[0].save({
                    status: body.status,
                    dateOfDelivery: body.dateOfDelivery
                }, function(err) {
                    if(err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));                                
                    }
                    jsonResp.status = "success";
                    jsonResp.message = "Order Updated!";
                    res.send(JSON.stringify(jsonResp));
                }) 
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Order not found";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

module.exports = router


