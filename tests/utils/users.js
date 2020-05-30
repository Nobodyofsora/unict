const crypto = require('crypto');
const chai = require('chai');
const expect = chai.expect;

const User = require('../../models/user');

module.exports.expectJson = function (request) {
  expect(request.header).to.have.property('content-type');
  expect(request.header['content-type']).contains('application/json');
};

module.exports.createUser = async function () {
  const password = new Buffer(
    crypto.createHash('sha256').update('Hello', 'utf8').digest(),
  ).toString('base64');
  const newUser = {
    name: 'Filippo',
    surname: 'Bianchi',
    email: 'filippoB@gmail.com',
    password: password,
  };
  return await User.create(newUser);
};
