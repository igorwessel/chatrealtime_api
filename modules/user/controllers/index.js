'use strict';

const repository = require('../repositories');
const validation = require('../../../bin/helpers/validation');
const ctrlBase = require('../../../bin/base/controller-base');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const variables = require('../../../bin/configuration/variables');
const _repo = new repository();

function userController() {}

userController.prototype.post = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.body.name, 'Informe seu nome');
  _validationContract.isRequired(req.body.email, 'Informe seu email');
  _validationContract.isRequired(req.body.password, 'Informe sua senha');
  _validationContract.isRequired(
    req.body.passwordConfirmation,
    'Informe sua senha confirmacao'
  );
  _validationContract.isTrue(
    req.body.passwordConfirmation !== req.body.password,
    'As senhas devem ser iguais'
  );
  _validationContract.isEmail(req.body.email, 'Informe um email valido');

  try {
    const emailExist = await _repo.isEmailExist(req.body.email);
    if (emailExist) {
      _validationContract.isTrue(
        emailExist.email !== undefined,
        `Já existe o email ${emailExist.email} cadastrado`
      );
    }
    const salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hashSync(req.body.password, salt);
    ctrlBase.post(_repo, _validationContract, req, res);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

userController.prototype.put = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.params.id, 'Informe seu id');
  _validationContract.isRequired(req.body.name, 'Informe seu nome');
  _validationContract.isRequired(req.body.email, 'Informe seu email');
  _validationContract.isRequired(req.body.password, 'Informe sua senha');
  _validationContract.isRequired(
    req.body.passwordConfirmation,
    'Informe sua senha confirmacao'
  );
  _validationContract.isTrue(
    req.body.passwordConfirmation !== req.body.password,
    'As senhas devem ser iguais'
  );
  _validationContract.isEmail(req.body.email, 'Informe um email valido');

  try {
    const userExist = await _repo.isEmailExist(req.body.email);
    if (userExist) {
      _validationContract.isTrue(
        userExist.name !== undefined && userExist._id !== req.params.id,
        `Já existe o email ${userExist.email} cadastrado`
      );
    }
    const salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hashSync(req.body.password, salt);
    ctrlBase.put(_repo, _validationContract, req, res);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

userController.prototype.get = async (req, res) => {
  ctrlBase.get(_repo, req, res);
};

userController.prototype.delete = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.params.id, 'Informe seu id');
  ctrlBase.delete(_repo, req, res);
};

userController.prototype.authenticate = async (req, res) => {
  let _validationContract = new validation();
  _validationContract.isRequired(req.body.name, 'Informe seu nome');
  _validationContract.isRequired(req.body.email, 'Informe seu email');
  _validationContract.isRequired(req.body.password, 'Informe sua senha');
  _validationContract.isRequired(
    req.body.passwordConfirmation,
    'Informe sua senha confirmacao'
  );
  _validationContract.isTrue(
    req.body.passwordConfirmation !== req.body.password,
    'As senhas devem ser iguais'
  );
  _validationContract.isEmail(req.body.email, 'Informe um email valido');

  if (_validationContract.isValid()) {
    res.status(400).send({
      message: 'Não foi possivel efetuar o login',
      validation: _validationContract.errors(),
    });
    return;
  }

  let foundUser = await _repo.authenticate(
    req.body.email,
    req.body.password,
    false
  );
  if (foundUser) {
    res.status(200).send({
      user: foundUser,
      token: jwt.sign({ user: foundUser }, variables.Security.secretKey),
    });
  } else {
    res
      .status(404)
      .send({ message: 'Usuario ou senha informados são invalidos' });
  }
};

userController.prototype.getByPage = async (req, res) => {
  const _validationContract = new validation();
  const { params } = req;
  const { page } = params;
  _validationContract.isRequired(page, 'Número da pagina obrigatorio');

  if (!_validationContract.isValid()) {
    res
      .status(400)
      .send({
        message: 'Não foi possivel pegar a pagina',
        validation: _validationContract.errors(),
      })
      .end();
    return;
  }

  try {
    const result = await _repo.getByPage(parseInt(page));
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

userController.prototype.completeRegister = async (req, res) => {
  try {
    const _validationContract = new validation();
    _validationContract.isRequired(req.body.cpf, 'Informe seu cpf pentelho');
    _validationContract.isRequired(
      req.body.phone,
      'Informe seu phone pentelho'
    );
    if (!_validationContract.isValid()) {
      req
        .status(400)
        .send({
          message: 'Existem dados inválido na sua requisição',
          validation: _validationContract.errors(),
        })
        .end();
      return;
    }
    const data = req.body;
    const user = await _repo.completeRegister(data, req.userLogged.user._id);
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

module.exports = userController;
