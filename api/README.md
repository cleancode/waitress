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

## WORKSHOP
* our customer is _picky_ the representation of an order is quite different form the given data
* add portionsToDeliver field for each dish in order
* add portionsReadyInTheKitchen field for each dish in order
* add ready field for each dish in order, ready when all portions are ready in the kitchen
* add ready field to the order, ready when all dishes are ready
* add extended informations for each dish in order (name and category)
* dishes should be groupped by dish's category
* add updatedAfter(timestamp) custom query
