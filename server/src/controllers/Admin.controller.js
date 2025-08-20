import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/Tokens.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerAdmin = wrapAsync(async (req, res) => {
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
    role: "admin",
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "failed to register a user");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Admin registeredSuccessfully", { createdUser })
    );
});

export const loginAdmin = wrapAsync(async (req, res) => {
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

  if (user.role !== "admin") {
    throw new ApiError(403, "Access Denied ");
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

export const logoutAdmin = wrapAsync(async (req, res) => {
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
