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
    receiveDigest: { type: Boolean, default: false },
    preferredLanguage: {
        type: String
    },
    notes: [
  {
    newsId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
  }
],


    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date 
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
