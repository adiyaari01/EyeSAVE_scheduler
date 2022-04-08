const config = require('./config');
const { CronJob } = require('cron');
const { morningJob } = require('./morningJob');
const { noonJob } = require('./noonJob');

// every morning at specifc hour, send notification to missing children's parents and staff
const absenceJob = new CronJob(config.cronTime, async () => {
    await repeatAlertMorningJob.start();
    await morningJob();
});

// every noon, at specific hour, sending message to children that left in kindergarten 
const absenceEscort = new CronJob(config.cronTimeNoon, async () => {
    await repeatAlertNoonJob.start();
    await noonJob();
});

const repeatAlertMorningJob = new CronJob('*/1 * * * *',  morningJob);
const repeatAlertNoonJob = new CronJob('*/5 * * * *',  noonJob);

const StopMorningRepeat = new CronJob('* 9 */1 * *', () => repeatAlertMorningJob.stop());
const StopNoonRepeat = new CronJob('* 14 */1 * *', () => repeatAlertNoonJob.stop());

// const startJobNow = async ()=>{
//     await morningJob();
// }

// startJobNow();
Promise.all([absenceJob.start(),absenceEscort.start(), StopMorningRepeat.start(), StopNoonRepeat.start()]);