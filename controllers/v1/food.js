const express = require('express');
const router = express.Router()

router.post('/', function(req, res) {
    const body = req.body;
    var jsonResp = {}
    req.models.Food.exists({
        name: body.name
    }, function(err, exists) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
        }
        if(!exists) {
            req.models.Food.create([{
                name: body.name,
                createdAt: new Date(), 
                cuisine: body.cuisine, 
                ingredients: body.ingredients, 
                lotNumber: body.lotNumber, 
                costOfProduction: body.costOfProduction, 
                sellingCost: body.sellingCost
            }], function (err, items) {
                if(err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                jsonResp.status = "success"
                jsonResp.info = "Food created"
                req.models.Food.get(items[0].id, function (err, food) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    jsonResp.data = food;
                    res.send(JSON.stringify(jsonResp));
                });
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Food Already Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

router.get('/', function(req, res) {
    var jsonResp = {}
    req.models.Food.find({
        
    }, function(err, data) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
        }
        if(data.length != 0) {
            jsonResp.status = "success"
            jsonResp.info = "Foods found"
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            jsonResp.status = "success"
            jsonResp.info = "No Foods found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

router.put('/', function(req, res) {
    
});

router.delete('/', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Food.exists({
        lotNumber: body.lotNumber
    }, function (err, exists) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        if (exists) {
            req.models.Food.find({
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
                    jsonResp.info = "Food Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Cannot delete a non existing food!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

module.exports = router