const express = require('express');
const knex = require('knex');
const bcrypt = require('bcrypt');
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
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /testing:
 * get:
 *   description: testing api
 *   responses: 
 *     '200':
 *        description: success response 
 */
app.get('/testing', (req, res) => {
    res.status(200).send("endpoint testing");
});

app.post('/signUp', (req, res) => {
    var jsonResp = {}
    const { name, email, password, status, lastLoginAt } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db('User').insert({
        name: name,
        email: email,
        password: hash,
        status: status,
        createdAt: new Date(),
        lastLoginAt: lastLoginAt
    })
  .returning('*')
  .then(user => {
    jsonResp.status = "success"
    jsonResp.info = "user created"
    jsonResp.data = user[0]
    res.status(200).send(jsonResp);
  })
  .catch(err => {
    console.log(err);
    jsonResp.status = "failed"
    jsonResp.info = "user not created"
    res.status(400).send(jsonResp);
  }) 
});

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
          res.status(401).send(jsonResp)  
        })
      } else {
        jsonResp.status = "failed"
        jsonResp.info = "login invalid"
        res.status(401).send(jsonResp)  
      }
    })
    .catch(err => {
      console.log(err)
      jsonResp.status = "failed"
      jsonResp.info = "login invalid"
      res.status(401).send(jsonResp)  
    })
});

app.post('/updatePassword', (req, res) => {
    var jsonResp = {}
    
});

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

app.post('/ingredientByQuantity', (req, res) => {
    var jsonResp = {};
    db.select()
      .from('Ingredients')
      .where('availableQuantity', '<', 'thresholdQuantity')
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

app.post('/createOrder', (req, res) => {
    var jsonResp = {}
    const { food, quantity, email, status, orderDate, dateOfdelivery, modeOfTransport } = req.body;
    db('Order').insert({
        food: food,
        quantity: quantity,
        email: email,
        status: status,
        orderDate: orderDate,
        dateOfdelivery: dateOfdelivery,
        modeOfTransport: modeOfTransport
    })
    .returning('*')
    .then(order => {
        jsonResp.status = "success"
        jsonResp.info = "order created"
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