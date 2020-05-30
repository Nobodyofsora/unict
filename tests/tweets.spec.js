const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const { expectJson, createTweet, createUser } = require('./utils/index');

const Tweet = require('../models/tweet');

const mongoose = require('mongoose');

chai.use(chaiHttp);

describe.only('[TWEETS] GET: /tweets', () => {
  it(' should return lenght 0 if no tweets are found', async () => {
    const result = await chai.request(app).get('/tweets');
    expect(result.status).to.be.equal(200);
    expect(result.body).to.be.instanceOf(Array);
    expect(result.body).to.has.lengthOf(0);
  });

  describe('If tweets exist', () => {
    let tweet = undefined;
    before('create tweet', async () => {
      tweet = await new Tweet({ tweet: 'Example' });
    });
    after('delete tweet', () => {
      tweet ? tweet.remove() : console.log('missing tweet');
    });
    it(' should return lenght 1', async () => {
      const result = await chai.request(app).get('/tweets');
      expect(result.status).to.be.equal(200);
      expect(result.body).to.be.instanceOf(Array);
      expect(result.body).to.be.lengthOf(1);
    });
  });
});
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
