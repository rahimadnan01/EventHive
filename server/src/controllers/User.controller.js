import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
export const registerUser = wrapAsync(async (req, res) => {
  const { username, email, password } = req.body;
  if ((!email, !password, !email)) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new ApiError(409, "User Already existed with this email");
  }

  const user = await User.create({
    username: username,
    email: email,
    password: password,
    role: "user",
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "failed to register a user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User registeredSuccessfully", { createdUser }));
});

export const loginUser = wrapAsync(async (req, res) => {
  const { email, password } = req.body;
  if ((!email, !password)) {
    throw new ApiError(409, "All fields are required to Login User");
  }
  const user = await User.findOne({ email: email });
  if (!email) {
    throw new ApiError(401, "User is unauthorized");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate token ");
  }

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "failed to login User");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in Successfully", {
        loggedInUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
});

export const logoutUser = wrapAsync(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  let options = { httpOnly: true, secure: true };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "User loggedOut successfully"));
});

export const getSingleUser = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User Id not Given");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not Found of this Id");
  }

  res.status(200).json(new ApiResponse(200, "User shown successfully", user));
});

export const getAllUsers = wrapAsync(async (req, res) => {
  const allUsers = await User.find({});
  if (!allUsers) {
    throw new ApiError(500, "No Users found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "All users fetched successfully", allUsers));
});

export const deleteSingleUser = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "Id not given to delete User");
  }
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new ApiError(500, "Failed to delete User");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully", deletedUser));
});

export const deleteAllUsers = wrapAsync(async (req, res) => {
  const deletedUsers = await User.deleteMany({});
  if (deletedUsers.deletedCount == 0) {
    throw new ApiError(404, "No users found to delete");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Users deleted Successfully", deletedUsers));
});

export const updateUser = wrapAsync(async (req, res) => {
  const { username, email, password } = req.body;

  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new ApiError(409, "User already existed Of this email");
  }
  const { userId } = req.params;
  const profilePicPath = req.files?.profilePic[0]?.path;
  if (!profilePicPath) {
    throw new ApiError(400, "Path for profile pic is required");
  }
  let profilePic = await uploadOnCloudinary(profilePicPath);
  if (!profilePic.url) {
    throw new ApiError(500, "Failed to upload an image");
  }
  if (!userId) {
    throw new ApiError(400, "User Id is required to update User");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;
  if (profilePic.url) user.profilePic = profilePic.url;

  const updatedUser = await user.save();
  if (!updatedUser) {
    throw new ApiError(500, "Failed to upload User");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User uploaded Successfully", updatedUser));
});
