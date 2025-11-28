import UserModel from "../models/user.model.js";
import MeetingModel from "../models/meeting.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Oops! Your passwords don’t match." });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "Account already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Registration completed successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials!" });
    }

    const token = crypto.randomBytes(64).toString("hex");
    user.token = token;
    await user.save();

    return res
      .status(httpStatus.OK)
      .json({ message: "You are now logged in.", token });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await UserModel.findOne({ token: token });

    const meetings = await MeetingModel.find({ user_id: user.name });

    res.json({ meetings: meetings });
  } catch (error) {
    console.error("Get User History Error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

const addToHistory = async (req, res) => {
  const { token, meetingId } = req.body;

  try {
    const user = await UserModel.findOne({ token: token });

    const newMeeting = new MeetingModel({
      user_id: user.name,
      meetingId: meetingId,
    });

    await newMeeting.save();

    res
      .status(httpStatus.CREATED)
      .json({ message: "Meeting added to history." });
  } catch (error) {
    console.error("Add to History Error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

export { registerUser, loginUser, getUserHistory, addToHistory };
