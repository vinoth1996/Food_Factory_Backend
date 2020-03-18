const express = require('express');
const router = express.Router()

router.post('/', (req, res) => {
    const body = req.body;
    var jsonResp = {}
    req.models.Ingredients.exists({
        name: body.name        
    }, function(err, exists) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
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
                    res.sendStatus(500);
                }
                jsonResp.status = "success"
                jsonResp.info = "Ingredient created"
                req.models.Ingredients.get(items[0].id, function (err, ingredient) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    jsonResp.data = ingredient;
                    res.send(JSON.stringify(jsonResp));
                });
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Ingredient Already Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

router.get('/', function(req, res) {
    var jsonResp = {}
    req.models.Ingredients.find({
        
    }, function(err, data) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
        }
        if(data.length != 0) {
            jsonResp.status = "success"
            jsonResp.info = "Ingredients found"
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            jsonResp.status = "success"
            jsonResp.info = "No Ingredients found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

router.delete('/', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Ingredients.exists({
        lotNumber: body.lotNumber
    }, function (err, exists) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        if (exists) {
            req.models.Ingredients.find({
                lotNumber: body.lotNumber
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                data[0].remove(function (err) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    console.log("removed!");
                    jsonResp.status = "success";
                    jsonResp.info = "Ingredient Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Cannot delete a non existing ingredient!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

module.exports = router