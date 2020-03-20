const express = require('express');
const router = express.Router()
const orm = require('orm');

router.post('/', function(req, res) {
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
                ingredients: body.ingredients, 
                lotNumber: body.lotNumber, 
                costOfProduction: body.costOfProduction, 
                sellingCost: body.sellingCost
            }], function (err, items) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                jsonResp.status = "success"
                jsonResp.message = "Food created"
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
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Food Already Exists!";
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
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(data.length != 0) {
            jsonResp.status = "success"
            jsonResp.message = "Foods found"
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            jsonResp.status = "success"
            jsonResp.message = "No Foods found"
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

router.get('/byCost', function(req, res) {
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.Food.find({
        costOfProduction: orm.gt(req.models.Food.find(sellingCost))
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
            jsonResp.data = data
            res.send(JSON.stringify(jsonResp));
        } else {
            console.log("foods:" + data)
            jsonResp.status = "success"
            jsonResp.message = "No Foods found"
            res.send(JSON.stringify(jsonResp));
        }
    })
});

module.exports = router