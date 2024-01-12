const jwt = require('jsonwebtoken');
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

const handleRefreshToken = async (req, res) => {
    // console.log(req.headers.cookie);
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(403); //forbidden
    const refreshToken = cookies.jwt;
    console.log(refreshToken);


    try {
        const paramData = {
            TableName: "ecell-dev",
            FilterExpression : 'refreshToken = :rT',
            ExpressionAttributeValues : { 
                ':rT' : refreshToken ,
            }
        };
        await docClient
        .scan(paramData)
        .promise()
        .then(async (response) => {
            foundUser = response.Items[0]
            console.log('user',foundUser);
            if (foundUser == undefined) return res.sendStatus(403);

             // evaluate jwt 
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    (err, decoded) => {
                        console.log(decoded);
                        if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
                        const roles = Object.values(foundUser.roles);
                        const accessToken = jwt.sign(
                            {
                                "email": decoded.email,
                                "roles": roles
                            },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '1h' }
                        );
                        res.json({ roles, accessToken })
                    }
                );



        },
            (err) => {
                res.status(403).send({
                message: "Forbidden",
                error:err,
                });
          }
        );
    }catch (err) {
        res.status(500).send({
            error: err,
        });
    } 
    
}

module.exports = { handleRefreshToken }