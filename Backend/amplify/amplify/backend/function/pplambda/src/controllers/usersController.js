const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const getAllUsers = async (req, res) => {
    var allData = [];
    const getAllData = async (params) => {

        console.log("Querying Table");
        let data = await docClient.scan(params).promise();

        if (data['Items'].length > 0) {
            allData = [...allData, ...data['Items']];
        }

        if (data.LastEvaluatedKey) {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            return await getAllData(params);

        } else {
            return data;
        }
    }
    try {
        const paramData = {
            TableName: "product-dev",
            Select: "ALL_ATTRIBUTES"
        };

        await getAllData(paramData);

        console.log("Processing Completed");
        if (allData[0] == undefined) return res.status(204).send({ message: "no user found" })
        console.log('user', allData);
        const items = allData
        const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
        const header = Object.keys(items[0])
        const csv = [
            header.join(','), // header row first
            ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n')

        console.log(csv)
           
        res.attachment('customers.csv').send(csv)
        // res.json(allData);
       

        // console.log(allData);

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: err,
        });
    }



}

// const deleteUser = async (req, res) => {
//     if (!req?.body?.contact_number) return res.status(400).json({ "message": 'Contact Number required' });
//     const user = await User.findOne({ _id: req.body.contact_number }).exec();
//     if (!user) {
//         return res.status(204).json({ 'message': `User ID ${req.body.id} not found` });
//     }
//     const result = await user.deleteOne({ _id: req.body.id });
//     res.json(result);
// }

// const getUser = async (req, res) => {
//     if (!req?.params?.id) return res.status(400).json({ "message": 'User ID required' });
//     const user = await User.findOne({ _id: req.params.id }).exec();
//     if (!user) {
//         return res.status(204).json({ 'message': `User ID ${req.params.id} not found` });
//     }
//     res.json(user);
// }

module.exports = {
    getAllUsers,
    // deleteUser,
    // getUser
}