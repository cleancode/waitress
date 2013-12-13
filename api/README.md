# WALKING-SKELETON
* checkout branch `blank`
* create package.json with `npm init`
* install express and add it as dependecy to the project
* GET /hello should reply with "Hello World"
  * `curl "http://localhost:3000/hello"`
* GET /hello?who="Gabriele" should reply with "Hello Gabriele"
  * `curl "http://localhost:3000/hello?who=Gabriele"`
* extract magic number 3000 into environment variable
* start http server only if app.js module is called directly from node and not required
* GET /hello acceptance test
  * install mocha + chai and add them as development dependencies
  * usage example of mocha + chai test/unit/example.js
  * test/acceptance/hello.js
* checkout branch `walking-skeleton`
  * show helper file
  * show acceptance tests
  * show log middleware

# DISHES
* checkout branch `work-on-dishes`
  * run `npm install`
  * show how to create mongodb connection
  * show how to load fixtures
* crete GET /dishes acceptance test
* create dish model
* serialize dish as JSON
* adjust JSON serialization
* last touch with middlewares: favicon, cors
* checkout branch `dishes`

# ORDERS
* checkout branch `work-on-orders`
  * run `npm install`
  * show extraction of dish model in `models/dish.js`
  * show structure of an order specification sent from order-taker
  * show helper function to create order specifications in tests
  * show skeleton of order model in `models/order.js`
  * show order acceptance tests
  * show order integration tests
* our customer is picky, the representation of an order is quite different form the given data
* pass all order integration tests
* pass all order acceptance tests
* checkout branch `orders`

# SSE
* checkout branch `work-on-sse`
* show requirements
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
* show unit tests
* pass all unit tests
* create an acceptance test
* checkout branch `sse`


# USEFUL LINKS
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
```json
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
```

## An Order returned by GET /orders
```json
{
   "id" : "52a49f75ad3213b162000080",
   "table" : "52a49f75ad3213b16200007f",
   "ready" : false,
   "updatedAt" : "2013-12-08T16:33:57.000Z",
   "createdAt" : "2013-12-08T16:33:57.000Z",
   "dishes" : {
      "primi" : [
         {
            "id" : "52a49f75ad3213b162000085",
            "portionsReadyInTheKitchen" : 0,
            "ready" : false,
            "portionsToDeliver" : 3,
            "name" : "ravioli di patate e bufala ai porcini",
            "category" : "primi"
         },
         {
            "id" : "52a49f75ad3213b162000084",
            "ready" : false,
            "portionsReadyInTheKitchen" : 0,
            "category" : "primi",
            "portionsToDeliver" : 4,
            "name" : "tortelloni verdi al radicchio e provola affumicata"
         },
         {
            "category" : "primi",
            "name" : "risotto ai porcini",
            "portionsToDeliver" : 2,
            "ready" : false,
            "portionsReadyInTheKitchen" : 0,
            "id" : "52a49f75ad3213b162000082"
         }
      ],
      "antipasti" : [
         {
            "ready" : false,
            "portionsReadyInTheKitchen" : 0,
            "id" : "52a49f75ad3213b162000081",
            "category" : "antipasti",
            "portionsToDeliver" : 4,
            "name" : "bruschette al tonno e pepe verde"
         }
      ],
      "secondi" : [
         {
            "id" : "52a49f75ad3213b162000083",
            "ready" : false,
            "portionsReadyInTheKitchen" : 0,
            "category" : "secondi",
            "portionsToDeliver" : 3,
            "name" : "filetto di maiale alle mele"
         }
      ]
   }
}
```

