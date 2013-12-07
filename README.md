# Waitress
An educational application done with NodeJS and AngularJS

## Layout
* **/api** server side
* **/frontend** client side
  * **/kitchen** front-end used in the kitchen
  * **/order-taker** front-end used on mobile devices by waiters
  * **/test** front-end tests
* **/tools** project automation stuffs

## Install
* install NodeJS >= 0.10.13, I suggest to do that using nvm
* install NodeJS needed global packages with `npm install -g yo grunt-cli bower karma phantomjs uglify-js`
* set PHANTOMJS_BIN variable: ``export PHANTOMJS_BIN=`which phantomjs` ``
* install Ruby needed global packages with `gem install compass`

## Run
* to run server `grunt server` and then `localhost:9000`
* to run unit tests `karma start`
* to run e2e tests `karma start karma-e2e.conf.js`

Every commands from /tools folder
