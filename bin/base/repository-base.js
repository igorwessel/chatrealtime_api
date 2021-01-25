const mongoose = require('mongoose');

class baseRepository {
  constructor(model) {
    this._model = mongoose.model(model);
  }

  async create(data) {
    const model = new this._model(data);
    const result = await model.save();

    return result;
  }

  async update(id, data, userLogged) {
    await this._model.findByIdAndUpdate(id, { $set: data });
    const result = this._model.findById(id);
    return result;
  }

  async getAll() {
    return await this._model.find();
  }

  async delete(id) {
    return await this._model.findByIdAndDelete(id);
  }
}

module.exports = baseRepository;
