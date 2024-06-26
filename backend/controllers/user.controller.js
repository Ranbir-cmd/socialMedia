import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenSetCookie.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import Post from "../models/post.model.js";

export const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);    // as we store id as token, and set cookie in res 

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser controller: ", err.message);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // const user = await User.findOne({ username });
        const user = await User.findOne({
            $or: [{ username: username }, { email: email }]
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }
        if (!user.password) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password );

        if (!isPasswordCorrect) return res.status(400).json({ error: "Invalid credentials" });

        // if (user.isFrozen) {
        //     user.isFrozen = false;
        //     await user.save();
        // }

        generateTokenAndSetCookie(user._id, res);
        
        res.status(200).json(
            {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser controller: ", error.message);
    }
};

export const logoutUser = (req, res) => {
    try {
        res.cookie("jwtToken", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in logoutUser controller: ", err.message);
    }
};

export const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);  // req.user is coming from protectedRoute middleware

        if (id === req.user._id.toString())
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // if it is already following, then Unfollow operation happen
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });   // pulling operation of mongo
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // and if it is not following then Follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });   // pushing operation
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnFollowUser: ", err.message);
    }
};

export const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;

    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: "User not found" });

        if (req.params.id !== userId.toString())
            return res.status(400).json({ error: "You cannot update other user's profile" });

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            // to upload a new img, destroy the current img first 
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();
        // // Find all posts that this user replied and update username and userProfilePic fields
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,
                },
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        );

        // password should be null in response
        user.password = null;

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in updateUser controller: ", err.message);
    }
};

export const getUserProfile = async (req, res) =>{
    // will fetch user profile either with username or userid 
    const {query} = req.params;
    try {
        let user;
        // if query is userId 
        if(mongoose.Types.ObjectId.isValid(query)){
            user = await User.findOne({ _id: query}).select("-password").select("-updatedAt");
        } else {
            user = await User.findOne({ username : query }).select("-password").select("-updatedAt");
        }
        if(!user) return res.status(404).json({error: "User not found"});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in getUserProfile controller: ", err.message);
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        // exclude the current user from suggested users array and exclude users that current user is already following
        const userId = req.user._id;

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);
        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        // remove password 
        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};