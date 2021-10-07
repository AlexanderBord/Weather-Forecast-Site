var express = require('express');
var router = express.Router();
var Cookies = require('cookies')
var keys = ['keyboard cat']
const db = require('../models');

//main page
router.get('/', function(req, res, next) {
    if(req.session.connected) {
        res.render('weather', {userName:req.session.firstName});
    }
    else {
        return res.redirect('/register');
    }
});

//Registration page(register), checks if the user is in the system, plants a cookie and saves data in the session
router.post('/register', (req, res, next) => {

    var cookies = new Cookies(req, res, { keys: keys })
    var lastVisit = cookies.get('LastVisit')

    if (!lastVisit) {
        cookies.set('LastVisit', new Date().toDateString(), {maxAge: 1*60*1000}); //one minute
    }

    req.session.fname = req.body.firstName;
    req.session.lname = req.body.lastName;
    req.session.email = req.body.email;

    return db.User.findOne({where:{email:req.body.email}})
        .then((users) => {
            if(users != null) {
                res.render("register", {msg:'This email is already in use, please choose another one.'});
            }
            else{
                res.render('password');
            }
        })
        .catch((err) => {
            res.send("failed connect to server");
        });
});

router.get('/register', (req, res, next) => {

    if(req.session.connected) {
        res.render('weather', {userName:req.session.firstName});
    }
    else {
        res.render("register", {msg:''});
    }
});

//Secondary registration page(password), creates a user in the system, checks whether the registration time has elapsed
router.post('/password', function(req, res, next) {

    var cookies = new Cookies(req, res, { keys: keys })
    var lastVisit = cookies.get('LastVisit')

    if (!lastVisit) {
        return res.redirect("/");
    }

    return db.User.findOne({where:{email:req.session.email}})
        .then((users) => {
            if(users == null) {
                db.User.create({
                    firstName: req.session.fname,
                    lastName: req.session.lname,
                    email: req.session.email,
                    password: req.body.password.toString()
                });
                res.redirect('/signin');
            }
        })
        .catch((err) => {
            res.status(405).send(JSON.stringify("failed connect to server"));
        });
});

//password pages
router.get('/password', function(req, res, next) {
    if(req.session.connected) {
        res.render('weather', {userName:req.session.userFname});
    }
    else {
        res.render("register", {msg:''});
    }
});

//Login page(sign in), transfers to the site if the user is in the system
router.post('/signin', (req, res, next) => {

    return db.User.findOne({where:{email:req.body.email}})
        .then((users) => {
            if(users != null && req.body.password === users.password) {
                req.session.connected = true;
                req.session.userId = users.id;
                req.session.userFname = users.firstName;
                res.redirect("/weather");
            }
            else{
                res.render('signin', {msg:'Sign in', msg2:'Wrong email / password, please try again.'});
            }
        })
        .catch((err) => {
            res.send("failed connect to server");
        });
});

//sign in page
router.get('/signin', (req, res, next) => {

    if(req.session.connected) {
        res.render('weather', {userName:req.session.userFname});
    }
    else {
        res.render('signin', {msg: 'Sign in', msg2: ''});
    }
});

//weather page
router.get('/weather', (req, res, next) => {

    if(req.session.connected) {
        res.render('weather', {userName:req.session.userFname});
    }
    else {
        res.redirect('/signin');
    }
});


//log out page, destroys the session and transfers to the login page
router.post('/logout', (req, res, next) => {
    req.session.connected = false;
    req.session.destroy();
    res.redirect('/signin');
});

//readme
router.get("/readme", function (req, res, next) {
    res.render("readme");
});

module.exports = router;

