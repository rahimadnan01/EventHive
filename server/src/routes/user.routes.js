import Router from "express";
import {
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/User.controller.js";
const router = Router();
router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser);
router.route("/user/logout").post(logoutUser);
router.route("/user/:userId").get(getSingleUser);
export default router;
