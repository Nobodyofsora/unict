const expect = require('chai').expect;
const Tweet = require('../../models/tweet');
const User = require('../../models/user');

module.exports.expectJson = (request) => {
  expect(request.header).to.have.property('content-type');
  expect(request.header['content-type']).contains('application/json');
};

module.exports.createUser = () => {
  return User.create({
    name: 'Manuel',
    surname: 'Caruso',
    email: 'manuel.caruso@stevejobs.academy',
    password: '12345',
  });
};

module.exports.createTweet = (user) => {
  return Tweet.create({
    _author: user._id,
    tweet: 'Hello world',
  });
};
module.exports.deleteTweet = (tweet, user) => {
  tweet ? tweet.remove() : console.log('cannot delete tweet');
  user ? user.remove() : console.log('cannot delete user');
};

module.exports.deleteAll = () => {
  User.deleteMany({});
  Tweet.deleteMany({});
};
