const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const User = require('../schema/user');
const { auth } = require('./auth');

const router = express.Router();

//Create Express Service
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



//REGISTER
router.post('/register', (req, res) => {
    const newUser = new User(req.body);
    User.findOne({
        username: newUser.username,
    }, function(err, user) {
        if (user) {
            return res.status(400).json({ auth: false, message: "Registration Failed" });
        }

        newUser.save((err, doc) => {
            if (err) {
                return res.status(400).json({ success: false });
            }
            res.status(200).json({
                success: true,
                user: doc
            })
        })
    })
})

//LOGIN
router.post('/login', function(req, res) {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (user) return res.status(400).json({
            error: true,
            message: "You are already logged in"
        });

        else {
            User.findOne({ 'username': req.body.username }, function(err, user) {
                if (!user) return res.json({ isAuth: false, message: ' Auth failed ,username not found' });

                user.comparepassword(req.body.password, (err, isMatch) => {
                    if (!isMatch) return res.json({ isAuth: false, message: "password doesn't match" });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id,
                            username: user.username
                        });
                    });
                });
            });
        }
    });
});

//deleteToken: logout the user
router.get('/logout', auth, function(req, res) {
    res.clearCookie('auth', { path: '/' });
    console.log(req.cookies);
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);
        res.sendStatus(200);
    })
})

//get user Profile
router.get('/profile', auth, function(req, res) {
    console.log(req.cookies.auth);
    if (re)
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            username: req.user.username

        })
});

module.exports = router;