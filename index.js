const express = require('express');
const admin = require('firebase-admin');
const app = express();

app.use(express.json());

// אתחול Firebase באמצעות משתני סביבה מאובטחים
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.database();

app.get('/', (req, res) => {
    res.send('✅ שרת הרישיונות מחובר ל-Firebase!');
});

app.post('/api/check-license', async (req, res) => {
    const { licenseKey } = req.body;

    try {
        const ref = db.ref(`licenses/${licenseKey}`);
        const snapshot = await ref.once('value');
        const license = snapshot.val();

        if (!license) {
            return res.json({ status: "error", message: "רישיון לא קיים." });
        }

        if (!license.active) {
            return res.json({ status: "error", message: "הרישיון חסום." });
        }

        if (license.credits <= 0) {
            return res.json({ status: "expired", message: "נגמרו הקרדיטים." });
        }

        // עדכון הקרדיטים במסד הנתונים
        const newCredits = license.credits - 1;
        await ref.update({ credits: newCredits });

        return res.json({
            status: "approved",
            creditsLeft: newCredits
        });

    } catch (error) {
        return res.json({ status: "error", message: "שגיאת שרת." });
    }
});

module.exports = app;
