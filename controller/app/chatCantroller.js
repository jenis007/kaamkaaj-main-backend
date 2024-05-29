const Candidate = require("../../models/Candidate/candidateModel");
const Recruiter = require("../../models/Recruiter/recruiterModel");
const Chat = require("../../models/chatModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const { checkPremiumRecruiter, checkPremiumCandidate, getChatMessagesById } = require("../../utils/helper");
const { getSocketDataUsingId } = require("../../utils/socketManager");

const sendMessage = async (req, res, next) => {
    try {
        const { recruiterId, candidateId, text, sender_type } = req.body;

        const candidate = await Candidate.findById(candidateId);
        const recruiter = await Recruiter.findById(recruiterId);

        const message = {
            text: text,
            sender_type: sender_type,
            updated_at: Date.now()
        };

        let chat = await Chat.findOne({ participants: [candidateId, recruiterId] });
        if (!chat) {
            chat = new Chat({
                participants: [candidateId, recruiterId],
                messages: [message]
            });
            await chat.save();
        } else {
            chat.messages.push(message);
            await chat.save();
        }

        const candidateChat = {
            recruiter: recruiterId,
            status: 1,
            chat: chat._id
        };

        const existingCandidateChat = candidate.chats.find(c => c.recruiter.equals(recruiterId));
        if (!existingCandidateChat) {
            candidate.chats.push(candidateChat);
            await candidate.save();
        }

        const recruiterChat = {
            candidate: candidateId,
            status: 1,
            chat: chat._id
        };

        const existingRecruiterChat = recruiter.chats.find(c => c.candidate.equals(candidateId));
        if (!existingRecruiterChat) {
            recruiter.chats.push(recruiterChat);
            await recruiter.save();
        }
        const getChat = await getChatMessagesById(chat._id);

        const senderData = {
            id: sender_type === "recruiter" ? recruiterId : candidateId,
            role: sender_type,
            type: "message",
            data: getChat
        };
        const receiverData = {
            id: sender_type === "recruiter" ? candidateId : recruiterId,
            role: sender_type === "recruiter" ? "candidate" : "recruiter",
            type: "message",
            data: getChat
        };
        getSocketDataUsingId(senderData);
        getSocketDataUsingId(receiverData);

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Message sent successfully",
            data: chat.participants
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getChatUsers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        let user;

        if (type === "candidate") {
            user = await Candidate.findById(id).populate({
                path: 'chats.recruiter',
                select: '_id mobile_number first_name last_name email fcm_token'
            }).populate({
                path: 'chats.chat',
                select: '_id',
                populate: {
                    path: 'messages',
                    options: { sort: { updated_at: -1 } }
                }
            });
        } else if (type === "recruiter") {
            user = await Recruiter.findById(id).populate({
                path: 'chats.candidate',
                select: '_id mobile_number first_name last_name email fcm_token'
            }).populate({
                path: 'chats.chat',
                select: '_id',
                populate: {
                    path: 'messages',
                    options: { sort: { updated_at: -1 } }
                }
            });
        } else {
            throw new ErrorHandler("Invalid type parameter", StatusCodes.BAD_REQUEST);
        }

        if (!user) {
            const errorMessage = type === "candidate" ? "Candidate not found" : "Recruiter not found";
            throw new ErrorHandler(errorMessage, StatusCodes.NOT_FOUND);
        }

        const { activePremium } = type === "candidate" ? await checkPremiumCandidate(id) : await checkPremiumRecruiter(id);

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Chat list retrieved successfully",
            data: user.chats.map(chat => ({
                candidate: chat.candidate,
                status: chat.status,
                chat: chat.chat.messages[chat.chat.messages.length - 1],
                _id: chat._id,
                updated_at: chat.updated_at
            })),
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getChatMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new ErrorHandler("Chat not found", StatusCodes.NOT_FOUND);
        }

        chat.messages.sort((a, b) => b.updated_at - a.updated_at);
        const response = {
            code: StatusCodes.OK,
            success: true,
            data: chat,
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        throw new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const updateMessageViewStatus = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new ErrorHandler("Chat not found", StatusCodes.NOT_FOUND);
        }

        chat.messages.forEach(message => {
            message.view = true;
        });

        await chat.save();

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Message view status updated successfully",
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    sendMessage,
    getChatUsers,
    updateMessageViewStatus,
    getChatMessages
}