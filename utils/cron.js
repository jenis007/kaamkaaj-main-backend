const cron = require('node-cron');
const { updateExpiredPlans } = require('../controller/app/cronCantroller');

function start() {
    cron.schedule('0 0 * * *', async () => {
        try {
            await updateExpiredPlans();
        } catch (error) {
            console.error('Error updating expired plans:', error);
        }
    }, {
        timezone: 'Asia/Kolkata'
    });
}

module.exports = { start };
