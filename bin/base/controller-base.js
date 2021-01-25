exports.post = async (repository, validationContract, req, res) => {
  try {
    const data = req.body;

    if (!validationContract.isValid()) {
      res
        .status(400)
        .send({
          message: 'Existem dados invalidos na sua requisicao.',
          validation: validationContract.errors(),
        })
        .end();
      return;
    }

    let result = await repository.create(data, req);
    res.status(201).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.put = async (repository, validationContract, req, res) => {
  try {
    const data = req.body;

    if (!validationContract.isValid()) {
      res
        .status(400)
        .send({
          message: 'Existem dados invalidos na sua requisicao.',
          validation: validationContract.errors(),
        })
        .end();
      return;
    }

    let result = await repository.update(
      req.params.id,
      data,
      req.userLogged.user
    );
    res.status(202).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.get = async (repository, validationContract, req, res) => {
  try {
    let result = await repository.getAll();

    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.delete = async (repository, validationContract, req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      let result = await repository.delete(id, req.userLogged);
      if (result !== 'Operacao invalida') {
        res.status(401).send({ message: 'Operacao invalida' });
      } else {
        res.status(200).send({ message: 'Registro excluido com sucesso.' });
      }
    } else {
      res.status(500).send({ message: 'O parametro id precisa ser informado' });
    }
  } catch (e) {
    res.status(500).send({ message: 'Internal server error' });
  }
};
