/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const app = express();
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
// const cors = require('cors')
// const credentials = require('./middleware/credentials');
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(credentials);
// Enable CORS for all methods
// app.use(cors(corsOptions));

// const allowlist = ['http://localhost:3000', 'https://form.ecellsakec.in'];

//     const corsOptionsDelegate = (req, callback) => {
//     let corsOptions;

//     let isDomainAllowed = whitelist.indexOf(req.header('Origin')) !== -1;

//     if (isDomainAllowed) {
//         // Enable CORS for this request
//         corsOptions = { origin: true }
//     } else {
//         // Disable CORS for this request
//         corsOptions = { origin: false }
//     }
//     callback(null, corsOptions)
// }

// app.use(cors(corsOptionsDelegate));

app.use(function (req, res, next) {
    var origin = req.get('origin');
    if (origin === 'http://localhost:3000'){
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    }
    if (origin === 'https://admin.ecellsakec.in'){
        res.header("Access-Control-Allow-Origin", "https://admin.ecellsakec.in");
    }


    if (origin === 'https://form.ecellsakec.in'){
        res.header("Access-Control-Allow-Origin", "https://form.ecellsakec.in");
    }
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
// declare a new express app
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(cookieParser());

//for testing purpose
app.use('/password',require('./utils/genPassword'));
// routes
app.use('/form', require('./routes/form'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.options('/users', async (req,res) => {
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  return res.sendStatus(200);

})
app.use(verifyJWT);
// app.use('/employees', require('./routes/api/employees'));
app.use('/users', require('./routes/api/users'));


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
