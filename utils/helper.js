const Candidate = require("../models/Candidate/candidateModel");
const Chat = require("../models/chatModel");
const Recruiter = require("../models/Recruiter/recruiterModel");

module.exports.extractFolderAndFilename = (imageUrl) => {
    const segments = imageUrl.split('/');
    if (segments.length < 2) {
        throw new Error('Invalid image URL format. Expected "folderName/filename"');
    }
    const filename = segments.pop();
    const folderName = segments.join('/');
    return { folderName, filename };
}

module.exports.checkPremiumCandidate = async (userId) => {
    try {
        const user = await Candidate.findById(userId).populate('membership.plan');
        if (!user || !user.membership || user.membership.length === 0) {
            const premium = {
                activePremium: false
            };
            return premium;
        }

        const activePremium = user.membership.find(detail => detail.expired === 0);
        if (!activePremium) {
            const premium = {
                activePremium: false
            };
            return premium;
        }

        const premium = {
            activePremium: {
                plan_features: activePremium.plan.features,
                plan_id: activePremium.plan._id,
                expired: activePremium.expired,
                purchase_date: activePremium.purchase_date,
                expiry_date: activePremium.expiry_date
            }
        };
        return premium;
    } catch (error) {
        const premium = {
            activePremium: false
        };
        return premium;
    }
};

module.exports.checkPremiumRecruiter = async (userId) => {
    try {
        const user = await Recruiter.findById(userId).populate('membership.plan');
        if (!user || !user.membership || user.membership.length === 0) {
            const premium = {
                activePremium: false
            };
            return premium;
        }

        const activePremium = user.membership.find(detail => detail.expired === 0);
        if (!activePremium) {
            const premium = {
                activePremium: false
            };
            return premium;
        }

        const premium = {
            activePremium: {
                plan_features: activePremium.plan.features,
                plan_id: activePremium.plan._id,
                expired: activePremium.expired,
                purchase_date: activePremium.purchase_date,
                expiry_date: activePremium.expiry_date
            }
        };
        return premium;
    } catch (error) {
        const premium = {
            activePremium: false
        };
        return premium;
    }
};

module.exports.getChatMessagesById = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return false
        }

        chat.messages.sort((a, b) => b.updated_at - a.updated_at);
        return chat;
    } catch (error) {
        throw new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
