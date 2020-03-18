const express = require('express');
const router = express.Router()

router.post('/', function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.User.exists({
        email: body.email
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(exists) {
            req.models.Order.create([{
                food: body.food,
                quantity: body.quantity,
                email: body.email,
                orderNum: body.orderNum,
                dateOfDelivery: body.dateOfDelivery,
                modeOfTransport: body.modeOfTransport,
                status: 'new order',
                orderDate: new Date()
            }], function (err, items) {
                if(err) {       
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                jsonResp.status = "success"
                jsonResp.message = "Food ordered successfully"
                req.models.Order.get(items[0].id, function (err, order) {
                    if (err) {            
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    jsonResp.data = order;
                    res.send(JSON.stringify(jsonResp));
                });
            })            
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "User not Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })

});

module.exports = router


