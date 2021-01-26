const repository = require('../repositories');
const _repo = new repository();
const ctrlBase = require('../../../bin/base/controller-base');
const ValidationContract = require('../../../bin/helpers/validation');

function chatController() {}

chatController.prototype.post = async (req, res) => {
  const _validationContract = new ValidationContract();
  _validationContract.isRequired(
    req.body.userRecipient,
    'Destinatario é obrigatorio'
  );

  if (!_validationContract.isValid()) {
    res
      .status(400)
      .send({ message: 'Existe dados inválidos na sua requisicao.' })
      .end();
    return;
  }

  req.body.userSender = req.userLogged.user._id;
  try {
    const chat = await _repo.verifyChat(
      req.body.userRecipient,
      req.userLogged.user._id
    );

    if (chat === false) {
      ctrlBase.post(_repo, _validationContract, req, res);
    } else {
      res.status(201).send(chat);
    }
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

chatController.prototype.sendMessage = async (req, res) => {
  const _validationContract = new ValidationContract();
  const { userLogged, io, connectedUsers, body, params } = req;
  const { user } = userLogged;
  const { id } = params;
  const { text } = body;
  const { _id, name } = user;

  _validationContract.isRequired(text, 'O texto da mensagem é obrigatorio');
  _validationContract.isRequired(id, 'O id do chat é obrigatorio');

  if (!_validationContract.isValid()) {
    res
      .status(401)
      .send({
        message: 'Existem dados invalidos na sua requisicao',
        validation: _validationContract.errors(),
      })
      .end();
    return;
  }

  try {
    const result = await _repo.sendMessage(id, text, _id);
    if (connectedUsers) {
      let userId;
      if (result.userRecipient.toString() === _id) {
        userId = result.userSender;
      } else {
        userId = result.userRecipient;
      }

      const userSocket = connectedUsers[userId];
      if (userSocket) {
        const msg = {
          _id: new Date().getTime(),
          text,
          createdAt: new Date(),
          user: { _id, name },
        };

        io.to(userId).emit('response', msg);
      }
    }
    res.status(202).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

chatController.prototype.getMyChats = async (req, res) => {
  const { userLogged, params } = req;
  const { user } = userLogged;
  const { page } = params;
  const { _id } = user;
  const _validationContract = new ValidationContract();

  _validationContract.isRequired(page, 'O número da pagina é obrigatório');

  if (!_validationContract.isValid()) {
    res
      .status(401)
      .send({
        message: 'Existem dados invalidos na sua requisicao',
        validation: _validationContract.errors(),
      })
      .end();
    return;
  }

  try {
    const result = await _repo.getMyChats(page, _id);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

chatController.prototype.delete = async (req, res) => {
  ctrlBase.delete(_repo, req, res);
};

chatController.prototype.getByIdPaginate = async (req, res) => {
  const _validationContract = new ValidationContract();
  const { page, id } = req.params;

  _validationContract.isRequired(page, 'O número da pagina é obrigatório');
  _validationContract.isRequired(id, 'O id do chat é obrigatório');

  if (!_validationContract.isValid()) {
    res
      .status(401)
      .send({
        message: 'Existem dados invalidos na sua requisicao',
        validation: _validationContract.errors(),
      })
      .end();
    return;
  }
  try {
    const result = await _repo.getByIdPaginate(id, page);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};

module.exports = chatController;
