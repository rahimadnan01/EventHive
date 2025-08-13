import Router from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/User.controller.js";
const router = Router();
router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser);
router.route("/user/logout").post(logoutUser);
export default router;
