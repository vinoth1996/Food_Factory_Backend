const express = require('express');
const knex = require('knex');
const bcrypt = require('bcrypt');
var randomString = require('randomstring');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const db = knex({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'vinoth',
      database: 'food_factory'
    }
});

db.select('*').from('Food').then(data => {
    console.log(data);
})

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Food Factory',
            description : 'Food Factory API',
            contact: {
                name: 'developer'
            },
            servers: ['http://localhost:3000']
        }
    },
    apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/testing', (req, res) => {
    res.status(200).send("endpoint testing");
});

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
 *            lastLoginAt:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/signUp', (req, res) => {
  var jsonResp = {}
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db('User').insert({
    name: name,
    email: email,
    password: hash,
    status: 'active',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    updatedAt: new Date()
  })
  .returning('*')
  .then(user => {
    jsonResp.status = "success"
    jsonResp.info = "user created"
    jsonResp.email = user[0].email
    jsonResp.name = user[0].name
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "user not created"
    res.status(400).send(jsonResp);
  }) 
});

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - User
 *     description: User login
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: user to login
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */

app.post('/login', (req, res) => {
    var jsonResp = {}
    db.select('email', 'password').from('User')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].password)
      if(isValid) {
        return db.select('email', 'name')
        .from('User')
        .where('email', '=', req.body.email)
        .then(user => {
          jsonResp.status = "success"
          jsonResp.info = "login successful"
          jsonResp.data = user[0]
          res.status(200).send(jsonResp)  
        })
        .catch(err => {
          console.log(err)
          jsonResp.status = "failed"
          jsonResp.info = "login invalid"
          res.status(400).send(jsonResp)  
        })
      } else {
        jsonResp.status = "failed"
        jsonResp.info = "login invalid"
        res.status(403).send(jsonResp)  
      }
    })
    .catch(err => {
      console.log(err)
      jsonResp.status = "failed"
      jsonResp.info = "login invalid"
      res.status(400).send(jsonResp)  
    })
});

/**
 * @swagger
 * /resetPassword:
 *   post:
 *     tags:
 *       - User
 *     description: reset password
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: reset password
 *         schema:
 *            type: object
 *         properties:
 *            email:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/resetPassword', (req, res) => {
  var jsonResp = {}
  var { email } = req.body
  db.select('*')
  .from('User')
  .where('email', '=', email)
  .then(data => {
    if(data.length == 0) {
      jsonResp.status = "failed"
      jsonResp.info = "User not found"
      res.status(200).send(jsonResp);
    } else {
      // jsonResp.status = "success"
      // jsonResp.info = "User found"
      // jsonResp.email = data[0].email
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
        to: data[0].email,
        subject: 'Food Factory - Temporary Password',
        html: `<html><body>
        <h3>Temporary Password : ${randomCode}</h3>
        <h3> -- <br/>
        Food Factory Team</h3>`
      }

      transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
          console.log(err);
          jsonResp.status = "failed";
          jsonResp.info = "Error in sending Email!";
          res.status(400).send(jsonResp);
        } else {
          db.update({
            password: bcrypt.hashSync(randomCode, 10),
            updatedAt: new Date()
          })
          .where('email', '=', data[0].email)
          .into('User')
          .then(data => {
            jsonResp.status = "success"
            jsonResp.info1 = "Email sent"
            jsonResp.info2 ="password updated"
            res.status(200).send(jsonResp);
          })
          .catch(err => {
            console.log(err)
            jsonResp.status = "failed"
            jsonResp.info = "error while updating the password"
            res.status(400).send(jsonResp);
          })
        }
      })
    }
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "cannot reset the password"
    res.status(400).send(jsonResp);
  })
});

/**
 * @swagger
 * /updateUser:
 *   post:
 *     tags:
 *       - User
 *     description: update user
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: update user
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            status:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/updateUser', (req, res) => {
    var jsonResp = {}
    var { status, name } = req.body
    db.update({
        name: name,
        status: status,
        updatedAt: new Date()
      })
      .where('email', '=', email)
      .into('User')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "user updated"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "user not updated"
        res.status(400).send(jsonResp);
    })

});

/**
 * @swagger
 * /updateUserStatus:
 *   post:
 *     tags:
 *       - User
 *     description: update user status
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: update user status
 *         schema:
 *            type: object
 *         properties:
 *            email:
 *              type: string
 *            status:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/updateUserStatus', (req, res) => {
    var jsonResp = {}
    var { email, status } = req.body
    db.update({
        status: status,
        updatedAt: new Date()
      })
      .where('email', '=', email)
      .into('User')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "status updated"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "status not updated"
        res.status(400).send(jsonResp);
    })

});

/**
 * @swagger
 * /addFood:
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
 *              type: string 
 *            lotNumber:
 *              type: string
 *            costOfProduction: 
 *               type: integer
 *            sellingCost:
 *               type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/addFood', (req, res) => {
    var jsonResp = {}
    const { name, cuisine, ingredients, lotNumber, costOfProduction, sellingCost } = req.body;
    db('Food').insert({
        name: name,
        createdAt: new Date(), 
        cuisine: cuisine, 
        ingredients: ingredients, 
        lotNumber: lotNumber, 
        costOfProduction: costOfProduction, 
        sellingCost: sellingCost
    })
  .returning('*')
  .then(Food => {
    jsonResp.status = "success"
    jsonResp.info = "food added"
    jsonResp.data = Food[0]
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "food not added"
    res.status(400).send(jsonResp);
  })
});

/**
 * @swagger
 * /allFood:
 *   get:
 *     tags:
 *       - Food
 *     description: get all foods which are present
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
app.get('/allFood', (req, res) => {
    var jsonResp = {}
    db.select()
    .from('Food')
    .then(data => {
      if(data.length == 0) {
        jsonResp.status = "success"
        jsonResp.info = "no food found"
        res.status(200).send(jsonResp);  
      } else {
        jsonResp.status = "success"
        jsonResp.info = "food found"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      }
    })
    .catch(err => {
      console.log(err);
      jsonResp.status = "failed"
      jsonResp.info = "no food found"
      res.status(400).send(jsonResp);
    })  
});

/**
 * @swagger
 * /foodByCost:
 *   post:
 *     tags:
 *       - Food
 *     description: get all foods whose costOfProduction higher than selling cost
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
app.post('/foodByCost', (req, res) => {
  var jsonResp ={}
  db('Food')
  .select('*')
  .where('costOfProduction', '>', db.ref('sellingCost'))
  .then(data => {
    console.log('data'+ data[0])
    if(data.length == 0) {
      jsonResp.status = "success"
      jsonResp.info = "no foods found"
      res.status(200).send(jsonResp);  
    } else {
      jsonResp.status = "success"
      jsonResp.info = "food found"
      jsonResp.data = data[0]
      res.status(200).send(jsonResp);  
    }
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "no foods found"
    res.status(400).send(jsonResp);
  })
});

/**
 * @swagger
 * /updateFood:
 *   post:
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
 *            lotnumber:
 *              type: string
 *            costOfProduction:
 *              type: integer
 *            sellingCost:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/updateFood', (req, res) => {
    var jsonResp = {};
    const { costOfProduction, sellingCost, lotNumber } = req.body;
    db.update({
        costOfProduction: costOfProduction,
        sellingCost: sellingCost
      })
      .where('lotNumber', '=', lotNumber)
      .into('Food')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "food updated"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "food not updated"
        res.status(400).send(jsonResp);
    })
});

/**
 * @swagger
 * /deleteFood:
 *   post:
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
 *            lotnumber:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/deleteFood', (req, res) => {
    var jsonResp = {}
    const { lotNumber } = req.body;
    db.delete()
      .where('lotNumber', '=', lotNumber)
      .into('Food')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "food deleted"
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "food not deleted"
        res.status(400).send(jsonResp);
    })

});

/**
 * @swagger
 * /addIngredient:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: Add ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: food
 *         description: add ingredient
 *         schema:
 *            type: object
 *         properties:
 *            name:
 *              type: string
 *            availableQuantity:
 *              type: string
 *            thresholdQuantity:
 *              type: string 
 *            lotnumber:
 *              type: string
 *            price: 
 *               type: integer
 *            vendorName:
 *               type: string
 *            vendorEmail: 
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/addIngredient', (req, res) => {
    var jsonResp = {}
    const { name, availableQuantity, thresholdQuantity, price, vendorName, vendorEmail, lotnumber } = req.body;
    db('Ingredients').insert({
        name: name,
        availableQuantity: availableQuantity,
        thresholdQuantity: thresholdQuantity,
        price: price,
        vendorEmail: vendorEmail,
        vendorName: vendorName,
        lotnumber: lotnumber
    })
  .returning('*')
  .then(Ingredients => {
    jsonResp.status = "success"
    jsonResp.info = "ingredients added"
    jsonResp.data = Ingredients[0]
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "ingredients not added"
    res.status(400).send(jsonResp);
  })
});

/**
 * @swagger
 * /allIngredient:
 *   get:
 *     tags:
 *       - Ingredient
 *     description: get all ingredients which are present
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
app.get('/allIngredient', (req, res) => {
    var jsonResp = {}
    db.select()
    .from('Ingredients')
    .then(data => {
      if(data.length == 0) {
        jsonResp.status = "success"
        jsonResp.info = "no ingredient found"
        res.status(200).send(jsonResp);  
      } else {
        jsonResp.status = "success"
        jsonResp.info = "ingredient found"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      }
    })
    .catch(err => {
      console.log(err);
      jsonResp.status = "failed"
      jsonResp.info = "no ingredient found"
      res.status(400).send(jsonResp);
    })  
});

/**
 * @swagger
 * /updateIngredient:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: update ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ingredient
 *         description: update ingredient
 *         schema:
 *            type: object
 *         properties:
 *            lotnumber:
 *              type: string
 *            price:
 *              type: integer
 *            thresholdQuantity:
 *              type: integer
 *            availableQuantity:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/updateIngredient', (req, res) => {
    var jsonResp = {};
    const { availableQuantity, thresholdQuantity, price, lotnumber } = req.body;
    db.update({
        availableQuantity: availableQuantity,
        thresholdQuantity: thresholdQuantity,
        price: price
      })
      .where('lotnumber', '=', lotnumber)
      .into('Ingredients')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "ingredient updated"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "ingredient not updated"
        res.status(400).send(jsonResp);
    })
});

/**
 * @swagger
 * /deleteIngredient:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: delete ingredient
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ingredient
 *         description: delete ingredient
 *         schema:
 *            type: object
 *         properties:
 *            lotnumber:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/deleteIngredient', (req, res) => {
    var jsonResp = {}
    const { lotnumber } = req.body;
    db.delete()
      .where('lotnumber', '=', lotnumber)
      .into('Ingredients')
      .returning('*')
      .then(data => {
        jsonResp.status = "success"
        jsonResp.info = "ingredient deleted"
        res.status(200).send(jsonResp);  
      })
      .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "ingredient not deleted"
        res.status(400).send(jsonResp);
    })
});

/**
 * @swagger
 * /ingredientByVendor:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: get all ingredients provided by same vendor
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: food
 *         description: get ingredient by vendor
 *         schema:
 *            type: object
 *         properties:
 *            vendorName:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/ingredientByVendor', (req, res) => {
    var jsonResp = {};
    const { vendorName } = req.body;
    db.select()
      .from('Ingredients')
      .where('vendorName', '=', vendorName)
      .then(data => {
        if(data.length == 0) {
          jsonResp.status = "success"
          jsonResp.info = "no ingredient found"
          res.status(200).send(jsonResp);  
        } else {
          jsonResp.status = "success"
          jsonResp.info = "ingredient found"
          jsonResp.data = data
          res.status(200).send(jsonResp);  
        }
    })
    .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "no ingredient found"
        res.status(400).send(jsonResp);
    })

});

/**
 * @swagger
 * /ingredientByQuantity:
 *   post:
 *     tags:
 *       - Ingredient
 *     description: get all ingredients whose available quantity is less than the threshold quantity
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
app.post('/ingredientByQuantity', (req, res) => {
    var jsonResp = {};
    db('Ingredients')
      .select('*')
      .where('availableQuantity', '<', db.ref('thresholdQuantity'))
      .then(data => {
        console.log('data'+ data[0])
        if(data.length == 0) {
          jsonResp.status = "success"
          jsonResp.info = "no ingredient found"
          res.status(200).send(jsonResp);  
        } else {
          jsonResp.status = "success"
          jsonResp.info = "ingredient found"
          jsonResp.data = data[0]
          res.status(200).send(jsonResp);  
        }
    })
    .catch(err => {
        console.log(err);
        jsonResp.status = "failed"
        jsonResp.info = "no ingredient found"
        res.status(400).send(jsonResp);
    })
});

/**
 * @swagger
 * /createOrder:
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
 *            food:
 *              type: string
 *            Quantity:
 *              type: integer
 *            email:
 *              type: string
 *            modeOfTransport:
 *              type: string 
 *            dateOfdelivery:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/createOrder', (req, res) => {
    var jsonResp = {}
    const { food, quantity, email, dateOfdelivery, modeOfTransport } = req.body;
    db('Order').insert({
        food: food,
        quantity: quantity,
        email: email,
        status: 'new order',
        orderDate: new Date(),
        dateOfdelivery: dateOfdelivery,
        modeOfTransport: modeOfTransport
    })
    .returning('*')
    .then(order => {
        jsonResp.status = "success"
        jsonResp.info = "Order created"
        jsonResp.data = order[0]
        res.status(200).send(jsonResp);
    })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "order not created"
    res.status(400).send(jsonResp);
  })
});

/**
 * @swagger
 * /updateOrder:
 *   post:
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
 *            email:
 *              type: string
 *            orderNum:
 *              type: integer
 *            status:
 *              type: string
 *            quantity:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/updateOrder', (req, res) => {
  var jsonResp = {}
  var { email, orderNum, status, quantity } = req.body
  db.update({
    status:status,
    quantity: quantity
  })
  .where('email', '=', email)
  .where('orderNum', '=', orderNum)
  .into('Order')
  .then(data => {
    jsonResp.status = "success"
    jsonResp.info = "Order updated"
    jsonResp.data = data[0]
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    jsonResp.status = "failed"
    jsonResp.info = "Cannot update the order"
    res.status(400).status(jsonResp);
  })
});

/**
 * @swagger
 * /deleteOrder:
 *   post:
 *     tags:
 *       - Order
 *     description: delete order
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: delete order
 *         schema:
 *            type: object
 *         properties:
 *            email:
 *              type: string
 *            orderNum:
 *              type: integer
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/deleteOrder', (req, res) => {
  var jsonResp = {}
  var { orderNum, email } = req.body
  db.delete()
  .where('email', '=', email)
  .where('orderNum', '=', orderNum)
  .into('Order')
  .then(data => {
    jsonResp.status = "success"
    jsonResp.info = "Order Deleted"
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    jsonResp.status = "failed"
    jsonResp.info = "order not deleted"
    res.status(400).send(jsonResp);
  }) 
});

/**
 * @swagger
 * /getOrderByUser:
 *   post:
 *     tags:
 *       - Order
 *     description: get order by user
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: get order by user
 *         schema:
 *            type: object
 *         properties:
 *            email:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */

app.post('/getOrderByUser', (req, res) => {
    var jsonResp = {}
    var { email } = req.body
    db.select()
    .from('Order')
    .where('email', '=', email)
    .then(data => {
      if(data.length == 0) {
        jsonResp.status = "success"
        jsonResp.info = "no order found"
        res.status(200).send(jsonResp);  
      } else {
        jsonResp.status = "success"
        jsonResp.info = "order found"
        jsonResp.data = data
        res.status(200).send(jsonResp);  
      }
  })
  .catch(err => {
      console.log(err);
      jsonResp.status = "failed"
      jsonResp.info = "no order found"
      res.status(400).send(jsonResp);
  })
});


app.listen(port, () => {
    console.log(`Server started on port`);
});