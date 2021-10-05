module.exports = {
  contract: async function (req, res) {
    let data = await Content.findById(
      _config("app.conractid"),
      "-_id description"
    )
      .lean()
      .exec();
    return res.render("contract", { content: data.description });
  },

  listfaq: async function (req, res) {
    const items = await Faq.find().sort({ $natural: -1 }).lean().exec();
    return res.ok(items);
  },
};
