const axios = require('axios');

exports.getCurrentDate = () => {
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

exports.sendMessage = (userId, msg) => {
    axios({
        method: 'post',
        url: 'http://localhost:8001/escort/send',
        data: {
            userId: userId,
            msg: msg,
        }
    });
}
