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
            res.sendStatus(500);
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
                    res.sendStatus(500);
                }
                jsonResp.status = "success"
                jsonResp.info = "user created"
                req.models.User.get(items[0].id, function (err, user) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    //clearing password field while send response
                    user.password = '';
                    jsonResp.data = user;
                    res.send(JSON.stringify(jsonResp));
                });
            })
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "User Already Exists!";
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
            res.sendStatus(500);
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, user) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                var tempUser = user[0];
                console.log(tempUser.password + " == " + body.password);
                //if(tempUser.password == body.password){
                if (bcrypt.compareSync(body.password, tempUser.password)) {
                    jsonResp.status = "success";
                    jsonResp.info = "Login Success";
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
                    jsonResp.info = "Wrong Password";
                    res.send(JSON.stringify(jsonResp));
                }
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "User not Found!";
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
            res.sendStatus(500);
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
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
                        res.sendStatus(500);
                    }
                    console.log("updated!");
                    jsonResp.status = "success";
                    jsonResp.info = "User Updated!";
                    data[0].password = '';
                    jsonResp.data = data[0];
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Cannot edit a non existing record!";
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
            res.sendStatus(500);
        }
        if (exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, data) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                data[0].save({
                    status: body.status,
                    updatedAt: new Date()
                }, function (err) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    console.log("updated!");
                    jsonResp.status = "success";
                    jsonResp.info = "Status Updated!";
                    data[0].password = '';
                    jsonResp.data = data[0];
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Cannot edit a non existing record!";
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
            res.sendStatus(500);
        }
        if (exists) {
            req.models.User.find({
                email: body.email
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
                    jsonResp.info = "User Deleted!";
                    res.send(JSON.stringify(jsonResp));
                });
            });
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "Cannot delete a non existing record!";
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
            res.sendStatus(500);
        } 
        if(exists) {
            req.models.User.find({
                email: body.email
            }, 1, function (err, userData) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                jsonResp.status = "success";
                jsonResp.info1 = "User Found!";
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
                        jsonResp.info = "Error in sending Email!";
                        res.send(JSON.stringify(jsonResp));
                    } else {
                        userData[0].save({
                            password: bcrypt.hashSync(randomCode, 10)
                        }, function (err) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            }
                        });
                        console.log('Email sent: ' + info.response);
                    }
                })
                jsonResp.status = "success"
                jsonResp.info2 = "Email sent"
                jsonResp.info3 ="Password updated"
                res.send(JSON.stringify(jsonResp));    
            })    
        } else {
            jsonResp.status = "failed";
            jsonResp.info = "User not Found!";
            res.send(JSON.stringify(jsonResp));
        }
    })    
});


module.exports  = router