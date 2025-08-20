import Router from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addEvent,
  getAllEvents,
  getSingleEvent,
} from "../controllers/Event.controller.js";
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
router.route("/events/:eventId").get(getSingleEvent);
router.route("/events").get(getAllEvents);
export default router;
