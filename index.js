const express = require('express');
const orm = require('orm');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
var config = require('./config/dbConfig')
var swaggerSpec = require('./config/swagger')
const app = express();
var pg = require('pg')

var client = new pg.Client(config.getPgSqlConnectionString())
client.connect()

// const db = knex({
//     client: 'pg',
//     connection: {
//       host: '127.0.0.1',
//       user: 'postgres',
//       password: 'vinoth',
//       database: 'food_factory'
//     }
// });

client.query('SELECT * FROM public."User"', (err, res)=>{
  console.log(res)
  client.end()
})

// db.select('*').from('Food').then(data => {
//     console.log(data);
// })

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// const swaggerOptions = {
//     swaggerDefinition: {
//         info: {
//             title: 'Food Factory',
//             description : 'Food Factory API',
//             contact: {
//                 name: 'developer'
//             },
//             servers: ['http://localhost:3000']
//         }
//     },
//     apis: ["index.js"]
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/testing', (req, res) => {
  res.status(200).send("endpoint testing");
});

app.use(orm.express(config.getPgSqlConnectionString(), {
  define: function (db, models) {
    models.User = db.define("user", {
      name: String,
      email: String,
      password: String,
      status: String,
      lastLoginAt: String,
      createdAt: String,
      updatedAt: String
    });
    models.Food = db.define("food", {
      name: String,
      cuisine: String,
      ingredients: String,
      lotNumber: String,
      costOfProduction: Number,
      sellingCost: Number,
      createdAt: String
    });
    models.FoodRel = db.define("foodRel", {
      foodLotNum: String,
      ingredientsLotNum: String
    });
    models.Ingredients = db.define("ingredients", {
      name: String,
      lotNumber: String,
      vendorName: String,
      vendorEmail: String,
      price: Number,
      availableQuantity: Number,
      thresholdQuantity: Number
    });
    models.Order = db.define("order", {
      email: String,
      food: String,
      status: String,
      modeOfTransport: String,
      dateOfDelivery: String,
      orderDate: String,
      orderNum: String,
      quantity: Number
    });
    models.OrderRel = db.define("orderRel", {
      orderNum: Number,
      foodLotNum: String,
      quantity: Number,
      amount: Number
    });    
  }
}));

app.listen(port, () => {
  console.log(`Server started on port`);
});

app.use(require('./controllers'));
