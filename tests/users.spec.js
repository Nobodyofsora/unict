const crypto = require('crypto');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../app');
const expect = chai.expect;

const mongoose = require('mongoose');

const User = require('../models/user');

const { expectJson, createUser } = require('./utils/users');
const expectedNotFoundError = { message: 'User not found' };

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
describe('[CREATE] POST: /users', () => {
  let createdUserId = undefined;
  after('Delete user', async () => {
    createdUserId
      ? await User.findByIdAndDelete(createdUserId)
      : console.log('Missing document');
  });
  it('Save a new user inside database and return it', async () => {
    const newUser = {
      name: 'Filippo',
      surname: 'Bianchi',
      email: 'filippoB@gmail.com',
      password: 'Hello',
    };
    const password = new Buffer(
      crypto.createHash('sha256').update(newUser.password, 'utf8').digest(),
    ).toString('base64');

    const result = await chai.request(app).post(`/users`).send(newUser);
    expectJson(result);
    expect(result).to.has.property('status', 201);
    expect(result.body).to.has.property('_id');
    createdUserId = result.body._id;
    const createdUser = await User.findById(createdUserId);
    expect(createdUser).to.be.not.undefined;
    expect(createdUser).to.has.property('name', newUser.name);
    expect(createdUser).to.has.property('surname', newUser.surname);
    expect(createdUser).to.has.property('email', newUser.email);
    expect(createdUser).to.has.property('password', password);
  });

  it("Validation error if email field isn't an email", async () => {
    const password = new Buffer(
      crypto.createHash('sha256').update('Hello', 'utf8').digest(),
    ).toString('base64');
    const newUser = {
      name: 'Filippo',
      surname: 'Bianchi',
      email: 'filippoB@gmail.com',
      password: password,
    };

    const result = await chai.request(app).post(`/users`).send(newUser);
    expectJson(result);
    expect(result).to.has.property('status', 409);
  });
});
describe('[UPDATE] PUT: /users/:id', () => {
  it("should return 404 status if user doesn't exist", async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app).put(`/users/${newObjectId}`);
    expect(result).to.have.property('status', 404);
    expect(result).to.have.property('body');
    expect(result.body).to.be.deep.equals(expectedNotFoundError);
  });

  describe('With an existing user', () => {
    let createdUser = undefined;
    beforeEach('Create user', async () => {
      createdUser = await createUser();
    });
    afterEach('Delete user', () => {
      createdUser ? createdUser.remove() : console.log('Missing user');
    });
    it('Update existing user', async () => {
      const result = await chai
        .request(app)
        .put(`/users/${createdUser._id.toString()}`);
      expect(result).to.have.property('status', 200);
      expect(result).to.have.property('body');
    });
  });
});

describe('[DELETE] DELETE: /users/:id', () => {
  it("should return 404 status if user doesn't exists", async () => {
    const newObjectId = mongoose.Types.ObjectId();
    const result = await chai.request(app).delete(`/users/${newObjectId}`);
    expect(result).to.have.property('status', 404);
    expect(result).to.have.property('body');
    expect(result.body).to.be.deep.equals(expectedNotFoundError);
  });

  describe('With an existing user', () => {
    let createdUser = undefined;
    before('Create user', async () => {
      createdUser = await createUser();
    });
    after('Delete user', () => {
      createdUser ? createdUser.deleteOne() : console.log('Missing user');
    });
    it('Delete existing user', async () => {
      const result = await chai
        .request(app)
        .delete(`/users/${createdUser._id.toString()}`);
      expect(result).to.have.property('status', 200);
      expect(result).to.have.property('body');
      expect(result.body).to.be.deep.equals({
        message: 'User successfully deleted',
      });
    });
  });
});
