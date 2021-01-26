require('../models');
const base = require('../../../bin/base/repository-base');

class chatRepository {
  constructor() {
    this._base = new base('Chat');
    this.projection = 'userRecipient userSender createdAt lastMessage messages';
    this.chat_projection = 'userRecipient userSender createdAt lastMessage';
  }

  create(data) {
    return this._base.create(data);
  }

  sendMessage(_id, text, user) {
    return this._base._model.findByIdAndUpdate(
      { _id },
      {
        $push: { messages: { text, user, createdAt: new Date() } },
        $inc: { countMessages: 1 },
      },
      { new: true, projection: 'userRecipient userSender _id countMessages' }
    );
  }

  async deleteMessage(chatId, messageId, user) {
    const verify = await this._base._model
      .findById(chatId)
      .findOne({ messages: { $elemMatch: { _id: messageId, user } } });

    if (verify.length === 0) {
      return 'Operacao invalida';
    }

    const result = await this._base._model
      .findById(chatId)
      .findOneAndUpdate(
        { messages: { $elemMatch: { _id: messageId } } },
        {
          $pull: { messages: { _id: messageId } },
          $inc: { countMessages: -1 },
        },
        { new: true }
      )
      .exec((err, res) => {
        if (!err) {
          return res;
        }
      });
    return result;
  }

  async getMyChats(page, user) {
    const chats = await this._base._model
      .find(
        {
          or: [
            { $and: [{ userRecipient: { $ne: user }, userSender: { user } }] },
            { $and: [{ userSender: { $ne: user } }, { userRecipient: user }] },
          ],
        },
        this.chat_projection
      )
      .populate({ path: 'userRecipient', select: 'name photo_url' })
      .populate({ path: 'userSender', select: 'name photo_url' })
      .skip((page - 1) * 10)
      .limit(10)
      .sorte({ createdAt: -1 });

    const chatsCount = await this._base._model
      .find(
        {
          $or: [{ userRecipient: user }, { userSender: user }],
        },
        this.chat_projection
      )
      .count();
    return { chats, chatsCount };
  }

  async verifyChat(userRecipient, userSender) {
    const chat = await this._base._model
      .findOne(
        {
          $or: [
            { $and: [{ userRecipient }, { userSender }] },
            {
              $and: [
                { userSender: userRecipient },
                { userRecipient: userSender },
              ],
            },
          ],
        },
        this.chat_projection
      )
      .lean();

    if (chat !== null) {
      return chat;
    }

    return false;
  }

  async getByIdPaginate(id, page) {
    const position = page * -20;
    const array = await this._base._model
      .findOne({ _id: id }, { messages: { $slice: [position, 20] } })
      .populate({ path: 'messages.user', select: 'name photo_url' });
    return array;
  }

  async delete(id) {
    return this._base.delete(id);
  }
}

module.exports = chatRepository;
