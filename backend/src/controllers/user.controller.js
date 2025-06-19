import User from "../models/User.model.js";
import FriendRequest from "../models/FriendRequest.model.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const getRecommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // it will exclude the current user
        { _id: { $nin: currentUser.friends } }, // it will exclude the friends of the current user
        { isOnboarded: true },
      ],
    });

    res.status(200).json(getRecommendedUsers);
  } catch (error) {
    console.log("Error in getRecommendedUsers", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      ); // populate the friends field with the fullName, profilePic, nativeLanguage and learningLanguage fields

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getMyFriends", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    //preventing to send request to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    //if users are already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // if you send request already
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ], // check if the request already exists
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent a friend request to this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.log("Error in sendFriendRequest", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Fix: Convert ObjectIds to strings for comparison
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not authorized to accept this friend request",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // now we gonna add each users id into other once friendlist

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted successfully" });

    //
  } catch (error) {
    console.log("Error in acceptFriendRequest", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic ");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getFriendRequests", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendRequests", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
