const jwt = require('jsonwebtoken');
const variables = require('../bin/configuration/variables');
const user = require('../models/user-model');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [, token] = authHeader.split(' ');

  if (token) {
    try {
      let decoded = jwt.verify(token, variables.Security.secretKey);
      req.userLogged = decoded;
      const userExist = await user.findById(req.userLogged.user._id);

      if (!userExist) {
        res.status(401).send({ message: 'Usuario não existe' });
        return;
      }
      next();
    } catch (e) {
      res.status(401).send({ message: 'Token invalido' });
      return;
    }
  } else {
    res.status(401).send({ message: 'Token deve ser informado' });
    return;
  }
};
