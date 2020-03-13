const express = require('express');
const knex = require('knex')
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

app.delete('/deleteFood', (req, res) => {
    var jsonResp = {}
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

app.delete('/deleteIngredient', (req, res) => {
    var jsonResp = {}
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

app.listen(port, () => {
    console.log(`Server started on port`);
});