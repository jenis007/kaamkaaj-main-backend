const mongoose = require('mongoose');

const premiumPlanSchema = new mongoose.Schema({
    premium_name: {
        type: String,
        unique: true,
        trim: true,
    },
    user_type: {
        type: String,
        enum: ['candidate', 'recruiter'],
    },
    premium_price: {
        type: Number,
    },
    discount_price: {
        type: Number,
        default: 0
    },
    duration_day: {
        type: Number,
    },
    features: [
        {
            key: { type: String },
            name: { type: String }
        }
    ],
    description: {
        type: String,
        trim: true,
    },
    popular: {
        type: Number,
        enum: [0, 1],
        default: 0,
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1,
    },
    show_user: {
        type: Number,
        enum: [0, 1],
    },
    total_payment: {
        type: Number,
        default: 0
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

const PremiumPlan = mongoose.model('PremiumPlan', premiumPlanSchema);
module.exports = PremiumPlan;
