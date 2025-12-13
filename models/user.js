const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username:{
         type:String,
         required:true,
         unique:true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    }

});


module.exports = mongoose.model("User", userSchema);

 //passport-local-mongoose will add a username,hashed and salt field store the username , the password and the  salt 