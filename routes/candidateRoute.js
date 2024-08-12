const express = require("express");
const profileController = require("../controller/app/Candidate/profileController");
const { uploadFile, uploadRecordingFile } = require("../middleware/multerupload");
const premiumPlanController = require("../controller/app/Candidate/subscriptionCantroller");
const candidateJobController = require("../controller/app/Candidate/candidateJobController");
const chatCantroller = require("../controller/app/chatCantroller");
const notificationCantroller = require("../controller/app/notificationCantroller");
const { authorizePermission, authenticateUser } = require("../middleware/auth");

const uploadProfilePicture = uploadFile("profile_picture").single("profile_picture");
const uploadVideoCV = uploadRecordingFile("video_cv").single("video_cv");

const router = express.Router()

// profile
router.put("/candidate/update/profile/:candidateId", authenticateUser, authorizePermission("candidate"), profileController.updateCandidateData);
router.put("/candidate/update/profile_picture/:candidateId", authenticateUser, authorizePermission("candidate"), uploadProfilePicture, profileController.uplodeProfilePictur);
router.put("/candidate/update/video_cv/:candidateId", authenticateUser, authorizePermission("candidate"), uploadVideoCV, profileController.uplodeVideoCV);
router.get("/candidate/detail/:candidateId", authenticateUser, authorizePermission("candidate"), profileController.getCandidateDetails);

// subscription
router.get("/candidate/subscription/all", authenticateUser, authorizePermission("candidate"), premiumPlanController.getAllPremiumPlansForCandidate);
router.post("/candidate/subscription/buy", authenticateUser, authorizePermission("candidate"), premiumPlanController.buyPlanCandidate);
router.get("/candidate/subscription/my-all-subscription/:candidate_id", authenticateUser, authorizePermission("candidate"), premiumPlanController.getCandidatePremiumPlans);

// job
router.get("/candidate/job/all", authenticateUser, authorizePermission("candidate"), candidateJobController.getAllJobForCandidate);
router.get("/candidate/job/one/:id", authenticateUser, authorizePermission("candidate"), candidateJobController.getJobById);
router.post("/candidate/job/save", authenticateUser, authorizePermission("candidate"), candidateJobController.saveJobPost);
router.get("/candidate/job/save/all/:candidateId", authenticateUser, authorizePermission("candidate"), candidateJobController.getSavedJob);
router.delete("/candidate/job/save/remove", authenticateUser, authorizePermission("candidate"), candidateJobController.removeSavedJob);

// filters - dropdown
router.get("/filter/all", authenticateUser, profileController.getAllFiltersCandidat);
router.get("/filter/one/:id", authenticateUser, profileController.getFilterByIdCandidate);

// chat
router.post("/candidate/chat/send-msg", chatCantroller.sendMessage);
router.get("/candidate/chat/all/:id", chatCantroller.getChatUsers);
router.get("/candidate/chat/all-message/:chatId", chatCantroller.getChatMessages);
router.put("/candidate/chat/update-view-msg/:chatId", chatCantroller.updateMessageViewStatus);

//notification
router.get("/candidate/notification/all/:userId", notificationCantroller.getNotifications);
router.put("/candidate/notification/update-status/:notificationId", notificationCantroller.updateNotificationReadStatus);
router.put("/candidate/notification/remove/:notificationId", notificationCantroller.deleteNotification);

module.exports = router