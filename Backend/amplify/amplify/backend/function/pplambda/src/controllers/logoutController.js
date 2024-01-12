const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
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
            const foundUser = response.Items[0]
            console.log('user',foundUser);
            if (foundUser == undefined){
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                return res.sendStatus(204);
            }
              try{
                var params = {
                    TableName: 'ecell-dev',
                    Key: {
                        email: foundUser.email
                    },
                    AttributeUpdates: {
                        'refreshToken': {
                          Action: "PUT",
                          Value: '',
                        },
                      },
                  };
                
                await docClient
                .update(params)
                .promise()
                .then((response) => {
                    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                    res.sendStatus(204);

                },(err) => {
                  res.status(500).send({
                  message: "Server Database error",
                  error: err,
                  });
              })

              }catch(err){
                console.log(err);
                console.log('logout server error');
              }

            
            


           
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

module.exports = { handleLogout }