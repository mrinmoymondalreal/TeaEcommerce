const Razorpay = require("razorpay");
const {
  validatePaymentVerification,
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils.js");

let instance, secret, key_id;

function init() {
  secret = process.env.RAZORPAY_SECRET;
  key_id = process.env.RAZORPAY_KEY_ID;
  instance = new Razorpay({
    key_id: key_id,
    key_secret: secret,
  });
}

function getkeyId() {
  return key_id;
}

// create order
async function createOrder(amount, receipt) {
  var options = {
    amount,
    currency: "INR",
    receipt,
  };
  return await instance.orders.create(options).catch(console.log);
}

//verify payment
function verifyPayment(razorpayOrderId, razorpayPaymentId, signature) {
  return validatePaymentVerification(
    { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
    signature,
    secret
  );
}

module.exports = {
  init,
  createOrder,
  verifyPayment,
  getkeyId,
};
