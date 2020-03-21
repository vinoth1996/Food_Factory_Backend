const express = require('express');
const router = express.Router()

router.post('/createOrder', function(req, res) {
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

module.exports = router


