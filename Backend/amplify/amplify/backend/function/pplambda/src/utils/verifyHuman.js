const fetch = require("node-fetch");

function verifyHuman(token) {
  // console.log(token);
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  return fetch(
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
      secret +
      "&response=" +
      token,
    {
      method: "POST",
    }
  );
}

module.exports = {
  verifyHuman,
};
