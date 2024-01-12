function genId() {
    const chars = "0123456789";
    const passwordLength = 15;
    var password = "";
    for (var i = 0; i <= passwordLength; i++) {
        // console.log(password);
        const randomNumber = Math.floor(Math.random() * chars.length);
        //    console.log(randomNumber);
        password += chars.substring(randomNumber, randomNumber + 1);
        //    console.log(password);
    }
    return password;
}


module.exports = {
    genId,
}
