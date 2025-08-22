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

export const deleteSingleEvent = wrapAsync(async (req, res) => {
  const { eventId } = req.params;

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "User is unauthorized");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(500, "Something went wrong while fetching the event");
  }

  if (
    user.role !== "admin" &&
    user._id.toString() !== event.createdBy.toString()
  ) {
    throw new ApiError(
      403,
      "Access Denied only Owner of this event can delete or update event"
    );
  }
  if (!eventId) {
    throw new ApiError(400, "Event ID is required to delete Event");
  }
  const deletedEvent = await Event.findByIdAndDelete(eventId);
  if (!deletedEvent) {
    throw new ApiError(500, "Something went wrong while deleting the Event ");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Event deleted successfully", deletedEvent));
});

export const deleteAllEvents = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "User is unauthorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "No such user Found");
  }

  if (user && user.role !== "admin") {
    throw new ApiError(403, "access Denied only Admin can delete all Events");
  }

  const deletedEvents = await Event.deleteMany({});
  if (deletedEvents.deletedCount <= 0) {
    throw new ApiError(404, "NO Events found to delete");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "All Events deleted successfully", deletedEvents)
    );
});

export const bookEvent = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event Id is required");
  }
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }

  if (user && event) {
    user.eventsJoined = event._id;
    event.participants = user._id;
  }

  let updatedUser = await user.save({ validateBeforeSave: false });
  if (!updatedUser) {
    throw new ApiError(500, "Failed to update User");
  }
  let updatedEvent = await event.save({ validateBeforeSave: false });
  if (!updatedEvent) {
    throw new ApiError(500, "Failed to Book Event");
  }

  res.status(200).json(
    new ApiResponse(200, "Event Booked successfully", {
      updatedUser: updatedUser,
      updatedEvent: updatedEvent,
    })
  );
});

export const updateEvent = wrapAsync(async (req, res) => {
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

  const eventPhotoPath = req.files?.photo[0]?.path;

  let eventPhoto = await uploadOnCloudinary(eventPhotoPath);

  if (eventPhotoPath && !eventPhoto) {
    throw new ApiError(500, "Failed to upload photo");
  }

  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(500, "Something went wrong while fetching the Event");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "No such user Found");
  }

  if (
    user.role !== "admin" &&
    user._id.toString() !== event.createdBy.toString()
  ) {
    throw new ApiError(
      403,
      "Access Denied only Owner of this event can  update event"
    );
  }

  if (type) event.type = type;
  if (name) event.name = name;
  if (location) event.location = location;
  if (contact) event.contact = contact;
  if (description) event.description = description;
  if (startDate) event.startDate = startDate;
  if (endDate) event.endDate = endDate;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;
  if (eventPhoto?.url) event.photo = eventPhoto.url;

  let updatedEvent = await event.save();
  if (!updatedEvent) {
    throw new ApiError(500, "Failed to update an Event");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
});

export const getEventWithParticipants = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event Id is required");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event Not found");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "User is unauthorized");
  }

  if (
    user.role !== "admin" &&
    user._id.toString() !== event.createdBy.toString()
  ) {
    throw new ApiError(
      403,
      "Access Denied only Owner of this event can  update event"
    );
  }

  const eventWithParticipants = await Event.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participantsInfo",
      },
    },
    {
      $addFields: {
        participantsInfo: {
          $map: {
            input: "$participantsInfo",
            as: "p",
            in: {
              _id: "$$p._id",
              username: "$$p.username",
              email: "$$p.email",
            },
          },
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Event with participants shown successfully",
        eventWithParticipants
      )
    );
});


