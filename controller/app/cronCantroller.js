const Candidate = require("../../models/Candidate/candidateModel");
const Recruiter = require("../../models/Recruiter/recruiterModel");

async function updateExpiredPlans() {
    try {
        const recruiters = await Recruiter.find({});
        for (const recruiter of recruiters) {
            for (const membership of recruiter.membership) {
                if (membership.expiry_date <= new Date() && membership.expired === 0) {
                    membership.expired = 1;
                }
            }
            await recruiter.save();
        }

        const candidates = await Candidate.find({});
        for (const candidate of candidates) {
            for (const membership of candidate.membership) {
                if (membership.expiry_date <= new Date() && membership.expired === 0) {
                    membership.expired = 1;
                }
            }
            await candidate.save();
        }
    } catch (error) {
    }
}

module.exports = {
    updateExpiredPlans
};