import Router from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addEvent } from "../controllers/Event.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
const router = Router();
router.route("/events/create").post(
  verifyJwt("user" || "admin"),
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  addEvent
);
export default router;
