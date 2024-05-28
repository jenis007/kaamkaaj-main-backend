const express = require("express");
const { registerAdmin, loginAdmin } = require("../controller/admin/adminAuth");
const recruitersCantroller = require("../controller/admin/recruitersCantroller");
const candidateCantroller = require("../controller/admin/candidateCantroller");
const { getRecruiterDetails } = require("../controller/app/Recruiter/profileController");
const jobController = require("../controller/app/Recruiter/jobController");
const premiumPlanCantroller = require("../controller/admin/PremiumPlanCantroller");
const filterCantroller = require("../controller/admin/filterCantroller");

const router = express.Router()

// auth
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

// recruiter
router.get("/admin/recruiter/all", recruitersCantroller.getAllRecruiterAdmin)
router.get("/admin/recruiter/one/:recruiterId", getRecruiterDetails)
router.put("/admin/recruiter/request-update/:recruiterId", recruitersCantroller.requestUpdateRecruiter)

// candidate
router.get("/admin/candidate/all", candidateCantroller.getAllCandidateAdmin)

// job
router.get("/admin/job/all", recruitersCantroller.getAllJobsAdmin)
router.get("/admin/job/one/:jobId", jobController.getJobPostById)
router.get("/admin/job/recruiter-all/:recruiterId", jobController.getAllJobPostsByRecruiterId)
router.put("/admin/job/request-update/:jobId", recruitersCantroller.requestUpdateJobPost)

// dashboard

// premiumPlan
router.post("/admin/premium-plan/create", premiumPlanCantroller.createPremiumPlan);
router.get("/admin/premium-plan/all", premiumPlanCantroller.getAllPremiumPlan);
router.get("/admin/premium-plan/buyrs/:plan_id", premiumPlanCantroller.getAllPremiumPlanBuyers);

// filter
router.post("/admin/filter/create", filterCantroller.createFilters);
router.get("/admin/filter/all", filterCantroller.getAllFilters);
router.get("/admin/filter/one/:id", filterCantroller.getFilterById);
router.put("/admin/filter/update/:id", filterCantroller.updateFilter);


module.exports = router