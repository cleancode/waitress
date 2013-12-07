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
* extract Dish model in models/dish.js
