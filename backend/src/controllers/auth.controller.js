import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

// This part is done
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existiEmail = await User.findOne({ email });
    if (existiEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // creating the profile picture
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    // TODO: create the user on the stream

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream User create with id ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user");
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true, // prevents XSS attacks,
      sameSite: "strict", // prevents CSRF attacks,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("error in the signup controller ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// login route is comeleted too
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    // Set cookie with JWT token
    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Return success response
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// logout route completed
export const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "User logged out successfully" });
};

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;

    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName ? "fullName" : "",
          !bio ? "bio" : "",
          !nativeLanguage ? "nativeLanguage" : "",
          !learningLanguage ? "learningLanguage" : "",
          !location ? "location" : "",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: update the user on the stream

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });

      console.log(`Stream User updated with id ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user", streamError.message);
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log("Error in onboarding controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
