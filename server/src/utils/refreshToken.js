import { User } from "../models/User.model.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import { generateAccessAndRefreshToken } from "./Tokens.js";
import { wrapAsync } from "./wrapAsync.js";
import jwt from "jsonwebtoken";
const refreshToken = wrapAsync(async (req, res) => {
  const upcomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!upcomingRefreshToken) {
    throw new ApiError(400, "User is unauthorized");
  }

  let verifiedToken;
  try {
    verifiedToken = jwt.verify(
      upcomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  const user = await User.findById(verifiedToken._id);
  if (!user) {
    throw new ApiError(400, "User is unauthorized");
  }

  if (user && user.refreshToken !== upcomingRefreshToken) {
    throw new ApiError(400, "User is unauthorized");
  }

  let { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  if (!accessToken || !newRefreshToken) {
    throw new ApiError(500, "Failed to refresh Tokens");
  }

  let options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      })
    );
});

export { refreshToken };
