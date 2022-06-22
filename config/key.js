module.exports = {
  app: {
    name: 'DTH Soft',
    apiURL: `${process.env.BASE_API_URL}`,
  },

  vnPay: {
    vnp_TmnCode: '882D722Q',
    vnp_HashSecret: 'HYJBSMSSSNNIMDTAKRFAAMHMXRNNHUCP',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: 'https://dthotel-kltn.vercel.app/booking-success',
  },
};
