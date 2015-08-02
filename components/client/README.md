This document explains how you can set up your local machine for development.

#### 1. Install NodeJs [Node.js v0.10.27+](https://nodejs.org/download/)

In Debian based distributions, there is a name clash with another utility called node. The suggested solution is to also install the nodejs-legacy apt package, which renames node to nodejs.

 `apt-get install nodejs-legacy npm`
 
`nodejs --version`

`npm --version`
 
#### 2. Check the version of Node.js that you have installed by running the following command:

 ```
node --version
 ```
 
#### 3. Install the tool dependencies
 
- [Bower](http://bower.io/) - client-side code package manager
- [Http-Server](https://github.com/nodeapps/http-server) - simple local static web server
- [Karma](https://github.com/karma-runner/karma) - unit test runner
- [Protractor](https://github.com/angular/protractor) - end to end (E2E) test runner

```
    sudo npm install
```

#### 4. Running Development Web Server

`npm start`

This will create a local webserver that is listening to port 8000 on your local machine. You can now browse to the application at:

`http://localhost:8000/index.html`

#### 5. Running Unit Tests

`npm test`

#### 6. Running End to End Tests

The End to End tests are kept in the test/e2e directory.

`npm run update-webdriver`

(You should only need to do this once.)

Since Protractor works by interacting with a running application, we need to start our web server:

`npm start`

Then in a separate terminal/command line window, we can run the Protractor test scripts against the application by running:

`npm run protractor`

Protractor will read the configuration file at test/protractor-conf.js. This configuration tells Protractor to:

open up a Chrome browser and connect it to the application
execute all the End to End tests in this browser
report the results of these tests in the terminal/command line window
close down the browser and exit

