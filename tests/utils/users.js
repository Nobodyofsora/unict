const chai = require('chai');
const expect = chai.expect;

const User = require('../../models/user');

module.exports.expectJson = function(request) {
  expect(request.header).to.has.property('content-type');
  expect(require.header['content-type']).contains('application/json');
};

module.exports.createUser = async () => {
  const newUser = {
    name: 'Filippo',
    surname: 'Bianchi',
    email: 'filippoB@gmail.com',
    password: 'Hello',
  };
  return await User.create(newUser);
};
