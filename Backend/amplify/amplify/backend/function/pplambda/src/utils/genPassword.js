const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.post('/', async function generateHash(req,res){
    const {password } = req.body;
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password , salt );
    res.status(200).send({
        hashedpass: hash
        });

});

module.exports = router;