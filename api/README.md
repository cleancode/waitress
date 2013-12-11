# US-01

## LIVE: Walking Skeleton
* create package.json
* install express and add it as dependecy to the project
* GET /hello should reply with "Hello World"
* GET /hello?who="Gabriele" should reply with "Hello Gabriele"
* extract magic number 3000 into environment variable
* run start http server only if app.js module is called directly from node and not required
* GET /hello acceptance test with mocha + chai
  * install mocha + chai and add them as development dependencies
  * usage example of mocha + chai test/unit/example.js
  * test/acceptance/hello.js

## OFFLINE
* application configuration by environment
* load fixtures before start http server
* extract startServer(app) in helper file
* extract loadFixtures(ass) in helper file

## WORKSHOP: List of dishes
* install mongoose and add it as dependency
* create connection to mongodb
* create Dish model (without proper presentation)
* GET /dishes with test/acceptance/dishes.js acceptance test
  * add presentation transformation to Dish model

## OFFLINE
* use common middlewares in express
* use cors middleware in express
* add local vimrc


# US-02

## OFFLINE
* extract `Dish` model in `models/dish.js`
* prepare `Order` model
  * create skeleton in `models/order.js`
    * add createdAt field to the order
    * add updatedAt field to the order
  * methods in `_helper.js` to create order specifications
  * move `helper.js` in `test` directory
  * POST /orders implementation and acceptance tests
  * create skeleton of integration tests

## Order Model [WORKSHOP]
* our customer is _picky_ the representation of an order is quite different form the given data
* add portionsToDeliver field for each dish in order
* add portionsReadyInTheKitchen field for each dish in order
* add ready field for each dish in order, ready when all portions are ready in the kitchen
* add ready field to the order, ready when all dishes are ready
* add extended informations for each dish in order (name and category)
* dishes should be groupped by dish's category
* add createdBetween(timestamp, timestamp) custom query

## Connect Middleware for SSE on Mongoose Models [WORKSHOP]
We want a connect middleware that takes an instance of a mongoose model (Model) and if the request is an event source request than it emits an event with all the documents returned by Model.createdBetween(previousLastEventId, nextLastEventId)

### [Specifications](http://www.w3.org/TR/2011/WD-eventsource-20110208)
* Request
  * have header `Last-Event-ID: <ID>`
  * have header `Accept: text/event-stream`
* Response
  * 200 OK
  * with header `Content-Type: text/event-stream`
  * with header `Cache-Control: no-cache`
  * with header `Connection: keep-alive`
  * body will be something like
    ```
    id: {Next-Last-Event-ID}
    event: orders
    data: {List-Of-Orders-As-JSON}
    {End-Of-Line}
    ```


# LINKS
* http://lodash.com/docs
* https://github.com/mikeal/request
* http://nodejs.org/api/
* http://mongoosejs.com/docs/guide.html
* https://github.com/LearnBoost/mongoose
* http://www.senchalabs.org/connect/
* https://github.com/senchalabs/connect/wiki
* http://expressjs.com/api.html
* http://chaijs.com/api/bdd/
* http://sinonjs.org/docs/


# SAMPLES
## Request to Create an Order
```
POST /orders
Accept: application/json
Content-Type: application/json

{"dishes":[{"id":"52a5a7eccf6812e0570000a0","portions":"2"}],"table":"52a5a7eccf6812e057000fff"}
```

## An Order stored on MongoDB
{
  "table" : "52a83bbde6cce9cd610000af",
  "createdAt" : ISODate("2013-12-11T10:17:33.609Z"),
  "updatedAt" : ISODate("2013-12-11T10:17:33.610Z"),
  "dishes" : [
    {
      "portionsToDeliver" : 2,
      "name" : "abbacchio tartufato",
      "category" : "secondi",
      "portionsReadyInTheKitchen" : 0
      "_id" : ObjectId("52a83bbde6cce9cd610000b3"),
    },
    {
      "portionsToDeliver" : 1,
      "name" : "vino bianco della casa",
      "category" : "bevande",
      "portionsReadyInTheKitchen" : 0
      "_id" : ObjectId("52a83bbde6cce9cd610000b2"),
    },
    {
      "portionsToDeliver" : 5,
      "name" : "vino rosso della casa",
      "category" : "bevande",
      "portionsReadyInTheKitchen" : 0
      "_id" : ObjectId("52a83bbde6cce9cd610000b1"),
    }
  ],
  "_id" : ObjectId("52a83bbde6cce9cd610000b0"),
  "__v" : 0
}

## An Order returned by GET /orders
{
  table: '52a49f75ad3213b16200007f',
  createdAt: '2013-12-08T16:33:57.000Z',
  updatedAt: '2013-12-08T16:33:57.000Z',
  dishes:
  { primi:
     [ { portionsToDeliver: 3,
         name: 'ravioli di patate e bufala ai porcini',
         category: 'primi',
         portionsReadyInTheKitchen: 0,
         ready: false,
         id: '52a49f75ad3213b162000085' },
       { portionsToDeliver: 4,
         name: 'tortelloni verdi al radicchio e provola affumicata',
         category: 'primi',
         portionsReadyInTheKitchen: 0,
         ready: false,
         id: '52a49f75ad3213b162000084' },
       { portionsToDeliver: 2,
         name: 'risotto ai porcini',
         category: 'primi',
         portionsReadyInTheKitchen: 0,
         ready: false,
         id: '52a49f75ad3213b162000082' } ],
    secondi:
     [ { portionsToDeliver: 3,
         name: 'filetto di maiale alle mele',
         category: 'secondi',
         portionsReadyInTheKitchen: 0,
         ready: false,
         id: '52a49f75ad3213b162000083' } ],
    antipasti:
     [ { portionsToDeliver: 4,
         name: 'bruschette al tonno e pepe verde',
         category: 'antipasti',
         portionsReadyInTheKitchen: 0,
         ready: false,
         id: '52a49f75ad3213b162000081' } ]
  },
  ready: false,
  id: '52a49f75ad3213b162000080'
}

