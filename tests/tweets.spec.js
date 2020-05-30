const chai = require('chai');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const app = require('../app');
const chaiHttp = require('chai-http');
const { expectJson, createTweet, createUser } = require('./utils/index');

chai.use(chaiHttp);

describe('[EDIT] PUT: /tweets/:id', () => {
  let currentUser = undefined;
  let currentTweet = undefined;

  before('Create tweet', async () => {
    currentUser = await createUser();
    currentTweet = await createTweet(currentUser);
  });

  after('delete tweet', () => {
    currentTweet ? currentTweet.remove() : console.log('missing tweet');
    currentUser ? currentUser.remove() : console.log('missing user');
  });

  it('Edit tweet', async () => {
    const result = await chai
      .request(app)
      .put(`/tweets/${currentTweet._id.toString()}`)
      .send({ tweet: String(currentTweet.tweet).split('').reverse().join('') });

    expectJson(result);
    expect(result).to.have.property('status', 200);
    expect(result.body).to.have.property(
      'tweet',
      String(currentTweet.tweet).split('').reverse().join(''),
    );
  });

  it('should return status 404 if tweetID not exist', async () => {
    const result = await chai
      .request(app)
      .put(`/tweets/${mongoose.Types.ObjectId()}`)
      .send({ tweet: 'Hello world' });

    expectJson(result);
    expect(result).to.have.property('status', 404);
  });

  it('should return status 400 if tweet lenght is 0', async () => {
    const result = await chai
      .request(app)
      .put(`/tweets/${mongoose.Types.ObjectId()}`)
      .send({ tweet: '' });

    expectJson(result);
    expect(result).to.have.property('status', 400);
  });

  it('should return status 400 if tweet lenght is greater than 120', async () => {
    const result = await chai
      .request(app)
      .put(`/tweets/${mongoose.Types.ObjectId()}`)
      .send({ tweet: Array(140).join('x') });

    expectJson(result);
    expect(result).to.have.property('status', 400);
  });
});

describe('[DELETE] DELETE: /tweets/:id', () => {
  let currentUser = undefined;
  let currentTweet = undefined;

  before('Create tweet', async () => {
    currentUser = await createUser();
    currentTweet = await createTweet(currentUser);
  });

  after('delete user', () => {
    currentUser ? currentUser.remove() : console.log('missing user');
  });

  it('Delete user', async () => {
    const result = await chai
      .request(app)
      .delete(`/tweets/${currentTweet._id.toString()}`);
    expectJson(result);
    expect(result.body).to.have.property(
      'message',
      'Tweet successfully deleted',
    );
    expect(result).to.have.property('status', 200);
  });

  it('should return status 404 if tweetID not exist', async () => {
    const result = await chai
      .request(app)
      .delete(`/tweets/${mongoose.Types.ObjectId()}`);
    expectJson(result);
    expect(result).to.have.property('status', 404);
  });
});
