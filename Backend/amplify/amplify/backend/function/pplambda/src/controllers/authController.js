// const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyHuman } = require("../utils/verifyHuman");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

const handleLogin = async (req, res) => {
    const { email, password , recaptcha_token } = req.body;
    //empty strings are falsy values in js
    if (!email || !password) return res.status(400).json({ 'message': 'Username and password are required.' });


    const response = {success : true} // ONLY FOR TESTING PURPOSE
    const data = response;
        // const response = await verifyHuman(recaptcha_token);
    // const data = await response.json();
    if (data.success === true) {
        console.log('checking existance of email');
        try {
            const paramData = {
                TableName: "ecell-dev",
                Key: {
                    email: email
                },
            };
            await docClient
            .get(paramData)
            .promise()
            .then(async (response) => {
                console.log('email exists');
                foundAccount = response.Item;
                
                const match = await bcrypt.compare(password, foundAccount.password);
                if (match) {
                    console.log('password matches');
                    const roles = Object.values(foundAccount.roles).filter(Boolean);
                    console.log(roles);
                    // create JWTs
                    const accessToken = jwt.sign(
                    {
                            "email": foundAccount.email,
                            "roles": roles
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '1h' }
                    );

                    
                    console.log('creating access token');
                    const refreshToken = jwt.sign(
                        { 
                            "email": foundAccount.email
                        },
                        process.env.REFRESH_TOKEN_SECRET,
                        { expiresIn: '15d' }
                    );
                    console.log(refreshToken);
                    // Saving refreshToken with current user
                    console.log('saving refresh token');
                    var params = {
                        TableName: 'ecell-dev',
                        Key: {
                            email: email
                        },
                        AttributeUpdates: {
                            'refreshToken': {
                              Action: "PUT",
                              Value: refreshToken
                            },
                          },
                        
                        ReturnValues: "UPDATED_NEW",
                      };
                      try{
                        
                        await docClient
                        .update(params)
                        .promise()
                        .then((response) => {
                          console.log('refreshtoken saved');
                          console.log(response);
                        // console.log(roles);
                         // Creates Secure Cookie with refresh token
                        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                        // Send authorization roles and access token to user
                        res.json({ 
                        roles,
                        accessToken });
        
  
                        },(err) => {
                          res.status(500).send({
                          message: "Server Database error",
                          error: err,
                          });
                      })

                      }catch(err){
                        console.log(err);
                        console.log('auth server error');
                      }
                   


            
                } else {
                    res.sendStatus(401);
                }
            },
            (err) => {
                res.status(401).send({
                message: "Unauthorized",
                });
          }
        );

        } catch (err) {
            res.status(500).send({
                error: err,
            });
        }

    } else {
        res.status(403).send({
          message: "Bots are not allowed",
        });
    }
}

module.exports = { handleLogin };