const variables = {
  Database: {
    connection: process.env.CONNECTION,
  },
  Security: {
    secretKey: process.env.SECRET_KEY,
  },
  PagarMe: {
    pagarMeKey: process.env.PAGARMEKEY,
  },
};

module.exports = variables;
