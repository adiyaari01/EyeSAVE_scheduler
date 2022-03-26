const superAgent = require('superagent');
const {getCurrentDate, sendMessage} = require('./utils');

exports.noonJob = async () => {
    const date = getCurrentDate();
    const children = await superAgent.get('http://localhost:8000/children');
    const childrenAttendance = await superAgent.get(`http://localhost:8000/childrenAttendance?_date=${date}`);
    const staff = await superAgent.get('http://localhost:8000/staff');
    // const existsChildern = childrenAttendance.body.map(c => c._childId);
    // get all children that in their attendence report _departur is exist ans not empty and ?_escortDelay is not exist?
    const missingEcorts = children.body.filter(c =>{
        return childrenAttendance.body.find(a => c._id === a._childId && a._date === date && a._arrivalTime && !a._departureTime)
    });

    console.log('missingEcorts',missingEcorts);
    if (missingEcorts.length===0){
        return 0;
    }
    for (let child of missingEcorts) {
        const parents = await Promise.all(child._escort.map(es => superAgent.get(`http://localhost:8000/escorts/${es}`)))
        const parent = parents.find(es => es.body._relation === "Parent");
        //send notificatioon
        // superAgent.post('http://localhost:8001/escort/send').send({userID:parent.body._telegramID,msg:"Your child is missing, please contact the kindergarten teacher"});
        sendMessage(parent.body._telegramID, "Hi, this is a reminder that studies day was finished, please update on delay")
    }
}
