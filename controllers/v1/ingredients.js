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

router.get('/', function(req, res) {
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

router.delete('/', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
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

router.get('/byQuantity', function(req, res) {
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Ingredients.find({
        availableQuantity: orm.lt(thresholdQuantity)
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

module.exports = router