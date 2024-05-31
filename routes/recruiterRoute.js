const express = require("express");
const { uploadFile, uploadRecordingFile } = require("../middleware/multerupload");
const profileController = require("../controller/app/Recruiter/profileController");
const chatCantroller = require("../controller/app/chatCantroller");
const jobController = require("../controller/app/Recruiter/jobController");
const notificationCantroller = require("../controller/app/notificationCantroller");
const { profileApprovalAccess, authenticateUser, authorizePermission } = require("../middleware/auth");
const subscriptionRecruiter = require("../controller/app/Recruiter/subscriptionRecruiter");

const uploadProfilePicture = uploadFile("profile_picture").single("profile_picture");

const router = express.Router()

// profile
router.put("/recruiter/update/profile/:recruiterId", authenticateUser, authorizePermission("recruiter"), profileController.updateRecruiterData);
router.get("/recruiter/one/profile/:recruiterId", authenticateUser, authorizePermission("recruiter"), profileController.getRecruiterDetails);
router.put("/recruiter/update/profile_picture/:recruiterId", authenticateUser, authorizePermission("recruiter"), uploadProfilePicture, profileController.uplodeProfilePicturRecruiter);

// requst admin
router.get("/recruiter/request/profile/:recruiterId", authenticateUser, authorizePermission("recruiter"), profileController.checkProfileRequestStatus);

// job Post
router.post("/recruiter/job/create", authenticateUser, authorizePermission("recruiter"), jobController.createJobPost);
router.get("/recruiter/job/all/:recruiterId", authenticateUser, authorizePermission("recruiter"), jobController.getAllJobPostsByRecruiterId);
router.get("/recruiter/job/one/:jobId", authenticateUser, authorizePermission("recruiter"), jobController.getJobPostById);
router.put("/recruiter/job/update-job-status/:jobId", authenticateUser, authorizePermission("recruiter"), jobController.updateJobStatus);

// home screen API
router.get("/recruiter/candidate/all", authenticateUser, authorizePermission("recruiter"), profileController.getAllCandidates);
router.get("/recruiter/candidate/one/:candidateId", authenticateUser, authorizePermission("recruiter"), profileController.getOneCandidates);

// candidet save              
router.post("/recruiter/candidate/save-profile", authenticateUser, authorizePermission("recruiter"), profileController.saveCandidateProfile);
router.get("/recruiter/candidate/save-profile/all/:recruiterId", authenticateUser, authorizePermission("recruiter"), profileController.getSavedProfiles);
router.delete("/recruiter/candidate/remove-save-profile", authenticateUser, authorizePermission("recruiter"), profileController.removeSavedProfile);

// sidbar
router.get("/recruiter/sidebar/data/:recruiterId", authenticateUser, authorizePermission("recruiter"), profileController.countRecruiterData);

// subscription
router.get("/recruiter/subscription/all", authenticateUser, authorizePermission("recruiter"), subscriptionRecruiter.getAllPremiumPlansForRecruiter);
router.post("/recruiter/subscription/buy", authenticateUser, authorizePermission("recruiter"), subscriptionRecruiter.buyPlanRecruiter);
router.get("/recruiter/subscription/my-subscription/:recruiter_id", authenticateUser, authorizePermission("recruiter"), subscriptionRecruiter.getRecruiterPremiumPlans);

// chat
router.post("/recruiter/chat/send-msg", chatCantroller.sendMessage);
router.get("/recruiter/chat/all-user/:id", chatCantroller.getChatUsers);
router.get("/recruiter/chat/all-message/:chatId", chatCantroller.getChatMessages);
router.put("/recruiter/chat/update-view-msg/:chatId", chatCantroller.updateMessageViewStatus);

//notification
router.get("/recruiter/notification/all/:userId", notificationCantroller.getNotifications);
router.put("/recruiter/notification/update-status/:notificationId", notificationCantroller.updateNotificationReadStatus);
router.put("/recruiter/notification/remove/:notificationId", notificationCantroller.deleteNotification);

module.exports = router