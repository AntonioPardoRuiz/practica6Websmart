const TwitterContract = artifacts.require("./TwitterContract.sol")

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract('TwitterContract', ([contractOwner, myAddress, otherAddress]) => {

    let twitterContract;
    let totalTweets = [];
    let totalMyTweets = [];

    const OTHER_USERS_TWEETS = 5;
    const OWNER_TWEETS = 2;

    // check if deployment goes smooth
    it('deployment', () => {
        // check if the smart contract is deployed
        // by checking the address of the smart contract
        it('deploys successfully', async () => {
            const address = await twitterContract.address;

            assert.notEqual(address, '')
            assert.notEqual(address, undefined)
            assert.notEqual(address, null)
            assert.notEqual(address, 0x0)
        })

    })

    // this would attach the deployed smart contract and its methods
    // to the `truffleTutorial` variable before all other tests are run
    before(async () => {

        twitterContract = await TwitterContract.deployed()

        // Creating 5 tweets by other users
        for (let id = 0; id < OTHER_USERS_TWEETS; id++) {
            let tweet = {
                tweetText: 'Other user tweet #' + id,
                tweetImage: '',
                username: otherAddress,
            };

            await twitterContract.addTweet(tweet.tweetText, tweet.tweetImage, {from: tweet.username});
            totalTweets.push(tweet);
        }
        // Creating 2 tweets by the owner
        // Starting from 5 till 7
        for (
            let id = OTHER_USERS_TWEETS;
            id < OWNER_TWEETS + OTHER_USERS_TWEETS;
            id++
        ) {
            let tweet = {
                username: myAddress,
                tweetImage: '',
                tweetText: 'Owner tweet #' + id,
            };

            await twitterContract.addTweet(tweet.tweetText, tweet.tweetImage, {from: tweet.username});
            totalTweets.push(tweet);
            totalMyTweets.push(tweet);
        }

    });

    describe("Add Tweet", () => {
        it("should emit AddTweet event", async () => {
            let tweet = {
                'tweetText': 'New Tweet',
            };

            let result = await twitterContract.addTweet(tweet.tweetText, '');
            truffleAssert.eventEmitted(result, 'AddTweet', (args) => {
                return args[0] == contractOwner && args[1] == OTHER_USERS_TWEETS + OWNER_TWEETS;
            });
        })
    });

    describe("User", () => {
        it("should emit UserEdited event", async () => {
            let user = {
                'name': 'Antonio Párraga',
                'bio': 'Programming Motherfucker 20x',
                'avatar': 'xxx'
            };

            let result = await twitterContract.updateUser(user.name, user.bio, user.avatar);
            truffleAssert.eventEmitted(result, 'UserUpdated', (args) => {
                return args[0] == contractOwner;
            });
        });

        it('should return a given user', async () => {
            const user = await twitterContract.getUser(contractOwner);
            expect(user.name).to.equal('Antonio Párraga');
            expect(user.bio).to.equal('Programming Motherfucker 20x');
            expect(user.avatar).to.equal('xxx');

        });

        it('should update user', async () => {
            let user = {
                'name': 'Antuan Párraga',
                'bio': 'Programming Motherfucker 22x',
                'avatar': 'yyy'
            };

            let result = await twitterContract.updateUser(user.name, user.bio, user.avatar);
            truffleAssert.eventEmitted(result, 'UserUpdated', (args) => {
                return args[0] == contractOwner;
            });
        });

        it('should return the user already modified', async () => {
            const user = await twitterContract.getUser(contractOwner);
            expect(user.name).to.equal('Antuan Párraga');
            expect(user.bio).to.equal('Programming Motherfucker 22x');
            expect(user.avatar).to.equal('yyy');
        });

    });

    describe('Get All Tweets', () => {
        it('should return the correct number of total tweets', async () => {
            const tweetsFromChain = await twitterContract.getAllTweets();
            expect(tweetsFromChain.length).to.equal(OTHER_USERS_TWEETS + OWNER_TWEETS + 1);
        });
    });

    describe('Get My Tweets', () => {
        it('should return the correct number of total tweets', async () => {
            const tweetsFromChain = await twitterContract.getMyTweets({from: myAddress});
            expect(tweetsFromChain.length).to.equal(OWNER_TWEETS);
        });
    });

    describe('Delete Tweet', () => {
        it('should emit delete tweet event', async () => {
            const TWEET_ID = 1; // Belongs to other users
            const TWEET_DELETED = true;

            let result = await twitterContract.deleteTweet(TWEET_ID, TWEET_DELETED, {from: otherAddress})
            truffleAssert.eventEmitted(result, 'DeleteTweet', (args) => {
                return args[0] == TWEET_ID && args[1] == TWEET_DELETED;
            });
        });
    });

    describe('Add more than 50 tweets', () => {
        it('should keep last 50 tweets', async () => {
            let tweet = {
                'tweetText': 'New Tweet',
            };

            for(i = 0; i < 60; i++)
            {
                await twitterContract.addTweet(tweet.tweetText, '');
            }

            const tweetsFromChain = await twitterContract.getAllTweets();
            expect(tweetsFromChain.length).to.equal(50);

        });
    });

})
