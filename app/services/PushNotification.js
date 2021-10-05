module.exports = {
  /**
   * Send emails
   * @param req
   * @param res
   */
  sendios: function (registrationIds, title, msg, silent = false) {
    // Sending ...
  },

  androidfcm: function (registrationIds, title, msg, silent = false) {},

  androidoldpush: function (registrationIds, title, msg, silent = false) {},

  sendandroid: function (registrationIds, title, msg, silent = false) {},
};
