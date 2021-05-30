let mongoose = require("mongoose");

let schema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'job',
        },
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        userid:String,
        company:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "company"
        },
        companyid:String,
        status: {
            type: Number,
            default: 1 // 1 normal room  , 0 disabled
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

schema.statics.createRoom = async function (dev, company, job = undefined) {
    if(!job){
        const roomfound =  await Room.findOne({companyid:company._id,userid:dev._id}).sort({ "$natural": -1 }).lean().exec();
        if(roomfound && roomfound.company){
            return roomfound;
        }
    }
    //
    //if(roomfound === 0){
    let room = new Room();
    room.title = "communication between dev and company ";
    room.user = dev;
    room.userid=dev.id;
    room.company = company;
    room.companyid=company.id;
    room.job = job;
    await room.save();
    //}
};

schema.statics.Clear = async function () {
    Room.deleteMany().exec();
};
module.exports = mongoose.model("room", schema, "room");
