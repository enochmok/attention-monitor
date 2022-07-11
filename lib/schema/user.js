const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Timestamp } = require('mongodb');
const confiq = require('../../config/config').get(process.env.NODE_ENV);
const salt = 10; // salt is for hashing the password

//UserSchema: It is used for setting up the model for registration so every registration will follow this form
const userSchema = mongoose.Schema({
        email: {
            type: String,
            required: true,
            maxlength: 100
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        username: {
            type: String,
            required: true,
            maxlength: 50
        },
        phone: {
            type: Number,
            required: true,
            maxlength: 8
        },
        salt: {
            type: String,
            maxlength: 100,
        },
        token: {
            type: String
        }
    }, { timestamps: true }) //built-in Mongoose Function, added createdAt and updatedAt

//hash password and store it in MongoDB
userSchema.pre('save', function(next) {
    var users = this;

    if (users.isModified('password')) {
        bcrypt.genSalt(salt, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(users.password, salt, function(err, hash) {
                if (err) return next(err);
                users.password = hash;
                next();
            })

        })
    } else {
        next();
    }
});

//to authenticate password
userSchema.methods.comparepassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(next);
        callback(null, isMatch);
    });
}

//to generate Token for authenticate login status
userSchema.methods.generateToken = function(callback) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), confiq.SECRET);

    user.token = token;
    user.save(function(err, user) {
        if (err) return callback(err);
        callback(null, user);
    })
}


// find user by token
userSchema.statics.findByToken = function(token, callback) {
    var user = this;

    jwt.verify(token, confiq.SECRET, function(err, decode) {
        user.findOne({ "_id": decode }, function(err, user) {
            if (err) return callback(err);
            // console.log(token + 'helohdwuiahduiawghduy')
            callback(null, user);
        })
    })
};


//delete token

userSchema.methods.deleteToken = function(token, cb) {
    var user = this;

    user.updateOne({ $unset: { token: 1 } }, function(err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}

module.exports = mongoose.model('User', userSchema);