const express = require('express');
const app = express();

// הגדרה חשובה כדי שהשרת ידע לקרוא נתונים (JSON) שהסקריפט שולח אליו
app.use(express.json());

// מסד הנתונים הזמני שלנו (כאן תוכל להוסיף ולערוך רישיונות)
const licensesDB = {
    "ABCD-1234-EFGH-5678": { credits: 10, active: true },
    "XYZ0-9876-WXYZ-5432": { credits: 2, active: true }
};

// 1. נתיב ראשי לבדיקה - כשתכנס לכתובת דרך הדפדפן תראה את ההודעה הזו
app.get('/', (req, res) => {
    res.send('✅ שרת הרישיונות פעיל ומוכן לפעולה!');
});

// 2. הנתיב שהסקריפט מפוטושופ פונה אליו (מאחורי הקלעים) כדי לבדוק רישיון
app.post('/api/check-license', (req, res) => {
    const { licenseKey } = req.body;

    if (!licensesDB[licenseKey]) {
        return res.json({ status: "error", message: "רישיון לא קיים במערכת." });
    }

    const license = licensesDB[licenseKey];

    if (!license.active) {
        return res.json({ status: "error", message: "הרישיון חסום." });
    }

    if (license.credits <= 0) {
        return res.json({ status: "expired", message: "נגמרו הקרדיטים לרישיון זה." });
    }

    // אם הכל תקין, מורידים קרדיט אחד (הנתון יישמר בזיכרון השרת כל עוד הוא באוויר)
    license.credits -= 1;

    return res.json({
        status: "approved",
        creditsLeft: license.credits,
        message: "הפעולה אושרה בהצלחה."
    });
});

// שינוי קריטי עבור Vercel - אנחנו מייצאים את האפליקציה במקום להפעיל אותה מקומית
module.exports = app;
