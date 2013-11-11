# Waitress
An educational application done with NodeJS and AngularJS

## Layout
* **/api** server side
* **/kitchen** front-end used in the kitchen
* **/order_taker** front-end used on mobile devices by waiters

## order-taker
Order Taker handles the tasks of taking orders and being notified when orders are ready. 

### Install
Install nodejs (< 0.10.7 or >= 0.10.13 if you want to run tests), I suggest using nvm. Then run `npm install -g yo grunt-cli bower karma phantomjs`.
Then set PHANTOMJS_BIN variable: ``export PHANTOMJS_BIN=`which phantomjs` ``

* to run server `grunt server` and then `localhost:9000`
* to run unit tests `karma start` 
* to run e2e tests `karma start karma-e2e.conf.js` 

Every commands from /order-taker folder.
