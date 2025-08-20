import { User } from "../models/User.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Event } from "../models/Event.model.js";

export const addEvent = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const {
    type,
    name,
    location,
    description,
    contact,
    startDate,
    endDate,
    startTime,
    endTime,
  } = req.body;

  if (
    !type ||
    !name ||
    !location ||
    !description ||
    !contact ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime
  ) {
    throw new ApiError(400, "All fields are required to add an new Event");
  }

  const eventPhotoPath = req.files?.photo[0]?.path;
  if (!eventPhotoPath) {
    throw new ApiError(400, "Path for event Photo is required");
  }

  let eventPhoto = await uploadOnCloudinary(eventPhotoPath);

  if (!eventPhoto) {
    throw new ApiError(500, "Failed to upload photo");
  }

  const user = await User.findById(userId);
  if (!userId) {
    throw new ApiError(404, "No user found of this Id");
  }

  const event = await Event.create({
    type: type,
    name: name,
    location: location,
    photo: eventPhoto.url,
    description: description,
    contact: contact,
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,
    createdBy: user._id,
  });

  if (!event) {
    throw new ApiError(500, "Failed to create a new Event");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Event created successfully", event));
});

export const getSingleEvent = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event ID not given");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "No Event found");
  }
  res.status(200).json(new ApiResponse(200, "Event shown successfully", event));
});

export const getAllEvents = wrapAsync(async (req, res) => {
  const allEvents = await Event.find({});
  if (!allEvents) {
    throw new ApiError(404, "No Events found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Shown All Events successfully", allEvents));
});
