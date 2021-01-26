require('../models');
const base = require('../../../bin/base/repository-base');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class userRepository {
  constructor() {
    this._base = new base('User');
    this._projection = 'nome email';
  }

  async authenticate(email, password, flag) {
    let user = await this._base._model.findOne({ email });
    let userR = await this._base._model.findOne({ email }, this._projection);
    if (await bcrypt.compareSync(password, user.password)) {
      return userR;
    }
    return null;
  }

  async isEmailExist(email) {
    return await this._base._model.findOne({ email }, this._projection);
  }

  async create(data, req) {
    let userCreated = await this._base.create(data);
    let userR = await this._base._model.findOne(
      { _id: userCreated._id },
      this._projection
    );
    return userR;
  }

  async update(id, data, userLogged) {
    if (userLogged._id !== id) {
      if (
        data.oldPassword !== data.password &&
        data.oldPassword &&
        data.password !== undefined &&
        data.passwordConfirmation !== undefined &&
        data.password === data.passwordConfirmation
      ) {
        let user = await this._base._model.findOne({ _id: id });
        if (await bcrypt.compareSync(data.oldPassword, user.password)) {
          let salt = await bcrypt.genSaltSync(10);
          let _hashPassword = await bcrypt.hashSync(data.password, salt);
          let name = user.name;
          let email = user.email;
          if (data.email) {
            email = data.email;
          }
          if (data.name) {
            name = data.nome;
          }
          const userUpdated = await this._base.update(id, {
            name,
            email,
            password: _hashPassword,
          });
          return this._base._model.findById(userUpdated._id, this._projection);
        }
      } else {
        return { message: 'Senha invalida' };
      }
    } else {
      return { message: 'Voce não tem permissao para editar esse usuario' };
    }
  }

  async getAll() {
    return await this._base.getAll();
  }
  async delete(id) {
    return await this._base.delete(id);
  }

  async getByPage(page) {
    const users = await this._base._model
      .find({ type: 'client' }, this._projection)
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 });
    const usersCount = await this._base._model
      .find({ type: 'client' }, this._projection)
      .count();

    return { users, usersCount };
  }

  async completeRegister(data, userid) {
    await this._base.update(userid, data);
    const userR = await this._base._model.findOne(
      { _id: userid },
      this._projection
    );
    return userR;
  }
}

module.exports = userRepository;
