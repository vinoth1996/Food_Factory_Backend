const express = require('express');
const router = express.Router()
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')
var randomString = require('randomstring')
var jwt = require('jsonwebtoken');
var verifyToken = require('../../verifyToken');
var key = require('../../config/secretKey');
/**
 * @swagger
 * /signUp:
 *   post:
 *     tags:
 *       - User
 *     description: User to create
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: user to create
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            password:
 *              type: string 
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
*/
router.post('/', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    req.models.User.exists({
        email: body.email
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if(!exists) {
            var hash = bcrypt.hashSync(body.password, 10);
            req.models.User.create([{
                name: body.name,
                email: body.email,
                password: hash,
                status: 'active',
                createdAt: new Date(),
                lastLoginAt: new Date(),
                updatedAt: new Date()                
            }], function (err, items) {
                if(err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                jsonResp.status = "success"
                jsonResp.message = "user created"
                req.models.User.get(items[0].id, function (err, user) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    //clearing password field while send response
                    user.password = '';
                    jsonResp.data = user;
                    res.send(JSON.stringify(jsonResp));
                });
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "User Already Exists!";
            res.send(JSON.stringify(jsonResp));
        }
    })
});

router.post('/auth', function (req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    console.log(body.email);
    req.models.User.exists({
        email: body.email
    }, function (err, exists) {
        if (err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, user) {
                if (err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                var tempUser = user[0];
                console.log(tempUser.password + " == " + body.password);
                //if(tempUser.password == body.password){
                if (bcrypt.compareSync(body.password, tempUser.password)) {
                    jsonResp.status = "success";
                    jsonResp.message = "Login Success";
                    tempUser.password = '';
                    jsonResp.data = tempUser;
                    var token = jwt.sign({
                        email: tempUser.email
                    }, key.secret, {
                        expiresIn: 31536000 // 1 year ; 604800 // 7 days/ 86400 expires in 24 hours
                    });
                    jsonResp.token = token;
                    res.send(JSON.stringify(jsonResp));
                } else {
                    jsonResp.status = "failed";
                    jsonResp.message = "Wrong Password";
                    res.send(JSON.stringify(jsonResp));
                }
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "User not Found!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

router.put('/', verifyToken, function (req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.User.exists({
        email: body.email
    }, function (err, exists) {
        if (err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                var hashedPassword = bcrypt.hashSync(body.password, 10);
                data[0].save({
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                    updatedAt: new Date()
                }, function (err) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    console.log("updated!");
                    jsonResp.status = "success";
                    jsonResp.message = "User Updated!";
                    data[0].password = '';
                    jsonResp.data = data[0];
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Cannot edit a non existing record!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

router.put('/status', verifyToken, function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.User.exists({
        email: body.email
    }, function(err, exists) {
        if(err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                data[0].save({
                    status: body.status,
                    updatedAt: new Date()
                }, function (err) {
                    if (err) {
                        console.log(err);
                        jsonResp.status = "failed"
                        jsonResp.message = "Internal server error"
                        res.status(500).send(JSON.stringify(jsonResp));            
                    }
                    console.log("updated!");
                    jsonResp.status = "success";
                    jsonResp.message = "Status Updated!";
                    data[0].password = '';
                    jsonResp.data = data[0];
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Cannot edit a non existing record!";
            res.send(JSON.stringify(jsonResp));
        }    
    })
});

router.delete('/', verifyToken, function (req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.User.exists({
        email: body.email
    }, function (err, exists) {
        if (err) {
            console.log(err);
            jsonResp.status = "failed"
            jsonResp.message = "Internal server error"
            res.status(500).send(JSON.stringify(jsonResp));
        }
        if (exists) {
            req.models.User.find({
                email: body.email
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
                    jsonResp.message = "User Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "Cannot delete a non existing record!";
            res.send(JSON.stringify(jsonResp));
        }
    });
});

router.post('/resetPassword', function(req, res) {
    const body = req.body;
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
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
            req.models.User.find({
                email: body.email
            }, 1, function (err, userData) {
                if (err) {
                    console.log(err);
                    jsonResp.status = "failed"
                    jsonResp.message = "Internal server error"
                    res.status(500).send(JSON.stringify(jsonResp));        
                }
                jsonResp.status = "success";
                jsonResp.message1 = "User Found!";
                var randomCode = randomString.generate();
      
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'vinoth00658@gmail.com',
                        pass: ''
                    }        
                })

                var mailOptions = {
                    from: 'vinoth00658@gmail.com',
                    to: userData[0].email,
                    subject: 'Food Factory - Temporary Password',
                    html: `<html><body>
                    <h3>Temporary Password : ${randomCode}</h3>
                    <h3> -- <br/>
                    Food Factory Team</h3>`
                }

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        jsonResp.status = "failed";
                        jsonResp.message = "Error in sending Email!";
                        res.send(JSON.stringify(jsonResp));
                    } else {
                        userData[0].save({
                            password: bcrypt.hashSync(randomCode, 10)
                        }, function (err) {
                            if (err) {
                                console.log(err);
                                jsonResp.status = "failed"
                                jsonResp.message = "Internal server error"
                                res.status(500).send(JSON.stringify(jsonResp));                    
                            }
                        });
                        console.log('Email sent: ' + info.response);
                    }
                })
                jsonResp.status = "success"
                jsonResp.message2 = "Email sent"
                jsonResp.message3 ="Password updated"
                res.send(JSON.stringify(jsonResp));    
            })    
        } else {
            jsonResp.status = "failed";
            jsonResp.message = "User not Found!";
            res.send(JSON.stringify(jsonResp));
        }
    })    
});


module.exports  = router