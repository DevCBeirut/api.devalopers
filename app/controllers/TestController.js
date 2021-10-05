module.exports = {
  /**
   * Show homepage
   * @param req
   * @param res
   * @param next
   */
  index: async function (req, res, next) {
    /* await ManagerType.Clear();
      const adminid = await ManagerType.AddManager("admin");
      await ManagerType.AddManager("manager");

     let newdata = new Manager();
      newdata.full_name ="admin";
      newdata.username = "admin";
      newdata.password = "letmein";
      // newdata.comments = data.comments;
      newdata.managertype = adminid;
      //newdata.phone = data.phone;
     await newdata.save()*/

    let newdata = new TalentType();
    newdata.name = "";
    //newdata.phone = data.phone;
    await newdata.save();

    return res.render("hello");
  },

  journey: async function (req, res, next) {
    /* await ManagerType.AddManager("admin");
     await ManagerType.AddManager("officer");
     await ManagerType.AddManager("support");
     await ManagerType.AddManager("financial officer ");
     await ManagerType.AddManager("helpdesk");*/

    /* let newdata = new Manager();
     newdata.full_name ="k";
     newdata.email = "sa@sa.sa";
     newdata.password = "letmein";
    // newdata.comments = data.comments;
     newdata.managertype = "5ccd48c89cb54f9cf13ac862";
     //newdata.phone = data.phone;
     await newdata.save()*/
    let set = new TalentType();
    set.name = "Software Developer";
    await set.save();

    return res.render("journey");
  },
};
