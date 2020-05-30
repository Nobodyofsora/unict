const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const expect = chai.expect;

const app = require('../app');
const User = require('../models/user');

chai.use(chaiHttp);

const { expectJson, createUser } = require('./utils/users');

describe('[INDEX] GET: /users', () => {
  it('Empty Array if no users are found', async () => {
    const result = await chai.request(app).get('/users');
    expect(result.status).to.be.equal(200);
    expect(result.body).to.be.instanceof(Array);
    expect(result.body).to.have.lengthOf(0);
    expect(result.header).to.have.property('content-type');
    expect(result.header)
      .to.have.property('content-type')
      .contains('application/json');
  });

  describe('User inside database', async () => {
    let createdUser = undefined;
    before('create user', async () => {
      createdUser = await createUser();
    });
    after('delete user', async () => {
      createdUser ? createdUser.remove() : console.log('missing user');
    });
    it('User found if present in DB', async () => {
      const result = await chai.request(app).get('/users');
      expect(result.header)
        .to.have.property('content-type')
        .contains('application/json');
      expect(result.status).to.equal(200);
      expect(result.body).to.be.instanceof(Array);
      expect(result.body).to.have.lengthOf(1);
    });
  });
});

describe('[SHOW] GET: /users/:id', () => {
  it('Return status 404 if user is missing', async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app).get(`/users/${newObjectId}`);
    expect(result.status).to.be.equal(404);
    expect(result.header).to.have.property('content-type');
    expect(result.header['content-type']).contains('application/json');
  });
  describe('User inside database', () => {
    let createdUser = undefined;
    before('create user', async () => {
      createdUser = await createUser();
    });
    after('delete user', async () => {
      createdUser ? createdUser.remove() : console.log('missing user');
    });
    it('Return expected user from DB', async () => {
      const result = await chai
        .request(app)
        .get(`/users/${createdUser._id.toString()}`);
      expect(result.status).to.be.equal(200);
      expect(result.body).to.has.property('_id', createdUser._id.toString());
    });
  });
});
