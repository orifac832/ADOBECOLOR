const express = require('express');
const app = express();

// חשוב כדי שהשרת ידע לקרוא את הנתונים שהסקריפט שולח
app.use(express.json());

// מסד הנתונים הזמני שלנו
const licensesDB = {
    "ABCD-1234-EFGH-5678": { credits: 10, active: true },
    "XYZ0-9876-WXYZ-5432": { credits: 2, active: true }
};

// נתיב הבדיקה
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

    license.credits -= 1;

    return res.json({
        status: "approved",
        creditsLeft: license.credits,
        message: "הפעולה אושרה בהצלחה."
    });
});

// שינוי קריטי עבור Vercel!
// במקום app.listen(...) אנחנו מייצאים את האפליקציה:
module.exports = app;
