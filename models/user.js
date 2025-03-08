const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const newsListing = require("./newsListing.js");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: { 
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: true 
    },
    preferences: [String],
    receiveDigest: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
