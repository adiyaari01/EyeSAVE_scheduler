const superAgent = require('superagent');
const config = require('./config');
const axios = require('axios');
const { CronJob } = require('cron');

const getCurrentDate = () => {
    let date_ob = new Date();
    // adjust 0 before single digit date
    let day = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // prints date in YYYY-MM-DD format
    return year + "-" + month + "-" + day;
}

const sendMessage = (userId, msg) => {
    axios({
        method: 'post',
        url: 'http://localhost:8001/escort/send',
        data: {
            userId: userId,
            msg: msg,
        }
    });
}

// every morning at specifc hour, send notification to missing children's parents and staff
const absenceJob = new CronJob(config.cronTime, async () => {
    const date = getCurrentDate();
    const children = await superAgent.get('http://localhost:8000/children');
    const childrenAttendance = await superAgent.get(`http://localhost:8000/childrenAttendance?_date=${date}`);
    const staff = await superAgent.get('http://localhost:8000/staff');
    const existsChildern = childrenAttendance.body.map(c => c._childId);
    const missingChildren = children.body.filter(c => !existsChildern.includes(c._id));

    // send notification to parents
    for (let child of missingChildren) {
        const parents = await Promise.all(child._escort.map(es => superAgent.get(`http://localhost:8000/escorts/${es}`)))
        const parent = parents.find(es => es.body._relation === "Parent");
        //send notificatioon
        // superAgent.post('http://localhost:8001/escort/send').send({userID:parent.body._telegramID,msg:"Your child is missing, please contact the kindergarten teacher"});
            sendMessage(parent.body._telegramID, "Hi, your child is missing. Please update on absence or delay");
    }
    // send notification to staff
    const staffTelegramId = staff.body.map(c => c._telegramID);
    if (missingChildren.length > 0) {
        for (let i = 0; i < staffTelegramId.length; i++) {
            sendMessage(staffTelegramId[i], "Hi, please pay attention: there are missing children");
        }
    }
});

// every noon, at specific hour, sending message to children that left in kindergarten 
const absenceEscort = new CronJob(config.cronTime, async () => {
    const date = getCurrentDate();
    const children = await superAgent.get('http://localhost:8000/children');
    const childrenAttendance = await superAgent.get(`http://localhost:8000/childrenAttendance?_date=${date}`);
    const staff = await superAgent.get('http://localhost:8000/staff');
    // const existsChildern = childrenAttendance.body.map(c => c._childId);
    // get all children that in their attendence report _departur is exist ans not empty and ?_escortDelay is not exist?
    const missingEcorts = children.body.filter(c => {
        return childrenAttendance.find(a => c._id === a._childId && a._date === date && !a._departureTime && a._arrivalTime)
    });

    console.log('missingEcorts',missingEcorts);

    for (let child of missingEcorts) {
        const parents = await Promise.all(child._escort.map(es => superAgent.get(`http://localhost:8000/escorts/${es}`)))
        const parent = parents.find(es => es.body._relation === "Parent");
        //send notificatioon
        // superAgent.post('http://localhost:8001/escort/send').send({userID:parent.body._telegramID,msg:"Your child is missing, please contact the kindergarten teacher"});
        sendMessage(parent.body._telegramID, "Hi, this is a reminder that studies day was finished, please update on delay")
    }
});

Promise.all([absenceJob.start(),]);
// Promise.all([absenceEscort.start(),]);