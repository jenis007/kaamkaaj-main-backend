const admin = require("firebase-admin");
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (fcmToken, title, body, data) => {
    try {
        const message = {
            token: fcmToken,
            notification: {
                title: title,
                body: body
            },
            data: data
        };

        await admin.messaging().send(message);
    } catch (error) {
    }
};

module.exports = {
    sendNotification,
};
