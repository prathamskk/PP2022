const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { verifyHuman } = require("../utils/verifyHuman");
const { genId } = require("../utils/genId");

const handleForm = async (req, res) => {
    const {
        company_name,
        owners_name,
        applicant_name,
        applicant_designation,
        email,
        contact_number,
        team_size,
        company_type,
        commodity_name,
        domain,
        turnover,
        company_description,
        commodity_description,
        website_link,
        app_link,
        recaptcha_token
    } = req.body;
    const response = await verifyHuman(recaptcha_token);
    const data = await response.json();
    // data.success = true;
    if (data.success === true) {
        try {
            const paramData = {
                TableName: "product-" + process.env.ENV,

                Item: {
                    company_name: company_name,
                    owners_name: owners_name,
                    applicant_name: applicant_name,
                    applicant_designation: applicant_designation,
                    email: email,
                    contact_number: contact_number,
                    team_size: team_size,
                    company_type: company_type,
                    commodity_name: commodity_name,
                    domain: domain,
                    turnover: turnover,
                    company_description: company_description,
                    commodity_description: commodity_description,
                    website_link: website_link,
                    app_link: app_link,
                    registration_id: genId(),
                    status: "pending"
                },
                ConditionExpression: "attribute_not_exists(contact_number)",
            };
            await docClient
                .put(paramData)
                .promise()
                .then((startup) => {
                    res.status(200).send({
                        message: "Registration Successful",
                    });
                },
                    (err) => {
                        if (err.code === "ConditionalCheckFailedException") {
                            res.status(400).send({
                                message: "Cannot Register Twice with same Contact Number",
                                error: err,
                            });
                        } else {
                            res.status(500).send({
                                message: "Server error",
                                error: err,
                            });
                        }
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

module.exports = { handleForm };