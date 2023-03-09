// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

/**
 * @title Twitter Contract
 * @dev Store & retrieve value in a variable
 */
contract TwitterContract {

    event AddTweet(address recipient, uint tweetId);
    event DeleteTweet(uint tweetId, bool isDeleted);
    event UserUpdated(address owner);

    struct Tweet {
        uint id;
        address author;
        uint256 date;
        string tweetText;
        string tweetImage;
        bool isDeleted;
    }

    struct User {
        address owner;
        string name;
        string bio;
        string avatar;
        int active;
    }

    Tweet[] private tweets;

    // Mapping of Tweet id to the wallet address of the user
    mapping(uint256 => address) tweetToOwner;
    mapping(address => User) users;

    // Method to be called by our frontend when trying to add a new Tweet
    function addTweet(string memory tweetText, string memory tweetImage) external {
        uint tweetId = tweets.length;
        tweets.push(Tweet(tweetId, msg.sender, block.timestamp, tweetText, tweetImage, false));
        tweetToOwner[tweetId] = msg.sender;
        emit AddTweet(msg.sender, tweetId);
    }

    function updateUser(string memory name, string memory bio, string memory avatar) external {
        if(users[msg.sender].active == 1) {
            users[msg.sender].name = name;
            users[msg.sender].bio = bio;
            users[msg.sender].avatar = avatar;
        }
        else {
            users[msg.sender] = User(msg.sender, name, bio, avatar, 1);
        }
        emit UserUpdated(msg.sender);
    }

    function getUser(address userAddress) external view returns (User memory) {
        if(users[userAddress].active == 1){
            return users[userAddress];
        }
        else {
            revert('Not found');
        }
    }

    // Method to get all the Tweets
    function getAllTweets() external view returns (Tweet[] memory) {
        Tweet[] memory temporary = new Tweet[](tweets.length);
        uint counter = 0;
        uint firstIndex = 0;
        if(tweets.length > 50) {
            firstIndex = tweets.length - 50;
        }
        for(uint i=firstIndex; i<tweets.length; i++) {
            if(tweets[i].isDeleted == false) {
                temporary[counter] = tweets[i];
                counter++;
            }
        }

        Tweet[] memory result = new Tweet[](counter);
        for(uint i=0; i<counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    // Method to get only your Tweets
    function getMyTweets() external view returns (Tweet[] memory) {
        Tweet[] memory temporary = new Tweet[](tweets.length);
        uint counter = 0;
        uint firstIndex = 0;
        if(tweets.length > 50) {
            firstIndex = tweets.length - 50;
        }
        for(uint i=firstIndex; i<tweets.length; i++) {
            if(tweetToOwner[i] == msg.sender && tweets[i].isDeleted == false) {
                temporary[counter] = tweets[i];
                counter++;
            }
        }

        Tweet[] memory result = new Tweet[](counter);
        for(uint i=0; i<counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    // Method to Delete a Tweet
    function deleteTweet(uint tweetId, bool isDeleted) external {
        if(tweetToOwner[tweetId] == msg.sender) {
            tweets[tweetId].isDeleted = isDeleted;
            emit DeleteTweet(tweetId, isDeleted);
        }
    }

}
