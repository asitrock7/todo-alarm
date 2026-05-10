const express = require('express');
const webpush = require('web-push');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use your own VAPID keys (Generate via: npx web-push generate-vapid-keys)
const publicVapidKey = 'BJ_YOUR_PUBLIC_KEY_HERE';
const privateVapidKey = 'YOUR_PRIVATE_KEY_HERE';

webpush.setVapidDetails('mailto:test@yourdomain.com', publicVapidKey, privateVapidKey);

app.post('/schedule-task', (req, res) => {
    const { taskName, taskTime, subscription } = req.body;
    
    // Calculate alarm time: Task Time minus 4 minutes
    const alarmTime = new Date(new Date(taskTime).getTime() - (4 * 60000));

    schedule.scheduleJob(alarmTime, function() {
        const payload = JSON.stringify({
            title: 'Task Alarm!',
            body: `Your task "${taskName}" starts in 4 minutes.`
        });

        webpush.sendNotification(subscription, payload)
            .catch(err => console.error("Alarm push failed:", err));
    });

    res.status(201).json({ message: 'Alarm scheduled successfully.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
