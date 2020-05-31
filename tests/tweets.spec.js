const chai = require('chai');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const app = require('../app');
const chaiHttp = require('chai-http');
const {
  expectJson,
  createTweet,
  createUser,
  deleteTweet,
  deleteAll,
} = require('./utils/tweets');
const Tweet = require('../models/tweet');
const User = require('../models/user');
chai.use(chaiHttp);
describe('[SHOW] \n Returns all tweets', () => {
  it('should return lenght 0 if no tweets are found', async () => {
    const result = await chai.request(app).get('/tweets');
    expect(result.status).to.be.equal(200);
    expect(result.body).to.be.instanceOf(Array);
    expect(result.body).to.have.lengthOf(0);
  });

  describe('If tweets exist', () => {
    let currentUser = undefined;
    let currentTweet = undefined;

    before('Create tweet', async () => {
      currentUser = await createUser();
      currentTweet = await createTweet(currentUser);
    });

    after('delete tweet', () => {
      deleteTweet(currentTweet, currentUser);
    });

    it(' should return lenght 1', async () => {
      const result = await chai.request(app).get('/tweets');

      expect(result.status).to.be.equal(200);
      expect(result.body).to.be.instanceOf(Array);
      expect(result.body).to.be.lengthOf(1);
    });
  });
  // describe('Server Crash', () => {
  //   it('should return status code 500', async () => {
  //     const result = await chai.request(app).get('/tweets');
  //     expect(result.status).to.be.equal(500);
  //   });
  // });
});
describe('[SHOW] Returns a tweet', () => {
  it('should return status 404 if tweet is missing', async () => {
    const id = mongoose.Types.ObjectId();
    const result = await chai.request(app).get(`/tweets/${id}`);
    expect(result.status).to.be.equal(404);
  });
  describe('If tweet exists', () => {
    let currentUser = undefined;
    let currentTweet = undefined;

    before('Create tweet', async () => {
      currentUser = await createUser();
      currentTweet = await createTweet(currentUser);
    });

    after('delete tweet', () => {
      deleteTweet(currentTweet, currentUser);
    });
    it('should return that tweet', async () => {
      const result = await chai
        .request(app)
        .get(`/tweets/${currentTweet._id.toString()}`);
      expect(result.status).to.be.equal(200);
      expect(result.body).to.have.property('_id', currentTweet._id.toString());
    });
  });
});
describe('[CREATE] POST: /tweets', () => {
  let currentUser = undefined;
  let currentTweet = undefined;
  before('cleaning', () => {
    deleteAll();
  });
  after('delete tweet', async () => {
    await Tweet.findByIdAndDelete(currentTweet._id);
    await User.findByIdAndDelete(currentUser._id);
  });
  it('should create a tweet', async () => {
    currentUser = await createUser();
    const result = await chai.request(app).post(`/tweets`).send({
      _author: currentUser._id,
      tweet: 'Example',
    });
    currentTweet = result.body;
    expect(result.status).to.be.equal(201);
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
    deleteTweet(currentTweet, currentUser);
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
