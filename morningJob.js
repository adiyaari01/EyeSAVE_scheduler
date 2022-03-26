const superAgent = require('superagent');
const {getCurrentDate, sendMessage} = require('./utils');

exports.morningJob = async () => {
    const date = getCurrentDate();
    const children = await superAgent.get('http://localhost:8000/children');
    const childrenAttendance = await superAgent.get(`http://localhost:8000/childrenAttendance?_date=${date}`);
    const staff = await superAgent.get('http://localhost:8000/staff');
    const existsChildern = childrenAttendance.body.map(c => c._childId);
    const missingChildren = children.body.filter(c => !existsChildern.includes(c._id));

    if (missingChildren.length===0){return 0;}
    // send notification to parents
    for (let child of missingChildren) {
        const parents = await Promise.all(child._escort.map(es => superAgent.get(`http://localhost:8000/escorts/${es}`)))
        if (parents.length===0){return 0;}
        const parent = parents.find(es => es.body._relation === "Parent");
            //send notificatioon
            // superAgent.post('http://localhost:8001/escort/send').send({userID:parent.body._telegramID,msg:"Your child is missing, please contact the kindergarten teacher"});
                sendMessage(parent.body._telegramID, "Hi, your child is missing. Please update on absence or delay");
    }
    
    if (staff.body.length ===0){return 0;}
    // send notification to staff
    const staffTelegramId = staff.body.map(c => c._telegramID);
    if (missingChildren.length > 0) {
        for (let i = 0; i < staffTelegramId.length; i++) {
            sendMessage(staffTelegramId[i], "Hi, please pay attention: there are missing children");
        }
    }
}
