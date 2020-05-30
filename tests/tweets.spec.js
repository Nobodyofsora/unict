const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const { expectJson, createTweet, createUser } = require('./utils/tweets');

const Tweet = require('../models/tweet');
const User = require('../models/user');
const utils = require('./utils/tweets');

const mongoose = require('mongoose');
chai.use(chaiHttp);

describe('[SHOW] \n Returns all tweets', () => {
  it('should return lenght 0 if no tweets are found', async () => {
    const result = await chai.request(app).get('/tweets');
    expect(result.status).to.be.equal(200);
    expect(result.body).to.be.instanceOf(Array);
    expect(result.body).to.have.lengthOf(0);
  });

  describe('If tweets exist', () => {
    let user = undefined;
    let tweet = undefined;
    before('create tweet', async () => {
      user = await utils.createUser();
      tweet = await utils.createTweet(user);
    });
    after('delete tweet', () => {
      utils.deleteTweet(tweet, user);
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
    let tweet = undefined;
    let user = undefined;
    before('create tweet', async () => {
      user = await utils.createUser();
      tweet = await utils.createTweet(user);
    });
    after('delete tweet', () => {
      utils.deleteTweet(tweet, user);
    });
    it('should return that tweet', async () => {
      const result = await chai
        .request(app)
        .get(`/tweets/${tweet._id.toString()}`);
      expect(result.status).to.be.equal(200);
      expect(result.body).to.have.property('_id', tweet._id.toString());
    });
  });
});

describe('[CREATE] POST: /tweets', () => {
  let tweet = undefined;
  before('cleaning', () => {
    utils.deleteAll();
  });
  after('delete tweet', async () => {
    await Tweet.findByIdAndDelete(tweet._id);
    await User.findByIdAndDelete(tweet._author);
  });
  it('should create a tweet', async () => {
    const user = await User.create({
      name: 'Manuel',
      surname: 'Caruso',
      email: 'manuel.caruso@stevejobs.academy',
      password: 'pass',
    });

    const result = await chai.request(app).post(`/tweets`).send({
      _author: user._id,
      tweet: 'Example',
    });

    tweet = result.body;

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
    currentTweet ? currentTweet.deleteOne() : console.log('missing tweet');
    currentUser ? currentUser.deleteOne() : console.log('missing user');
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

  beforeEach('Create tweet', async () => {
    currentUser = await createUser();
    currentTweet = await createTweet(currentUser);
  });

  afterEach('delete user', () => {
    currentUser ? currentUser.deleteOne() : console.log('missing user');
    currentTweet ? currentTweet.deleteOne() : console.log('missing tweet');
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
