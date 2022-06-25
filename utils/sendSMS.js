require('dotenv').config();

const sendSMS = async (name, numberPhone) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    let convertPhone = numberPhone;
    convertPhone = convertPhone.replace('0', '+84');

    const res = await client.messages.create({
      body: `Hi ${name}, a new room has been check out. Please check it at : https://dthotel-cleaner.vercel.app/`,
      from: '+19708251054',
      to: convertPhone,
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = { sendSMS };
