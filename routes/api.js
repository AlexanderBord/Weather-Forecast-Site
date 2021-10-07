var express = require('express');
var router = express.Router();
const db = require('../models');


// Creating a resource
router.post('/add', (req, res) => {

    if(req.session.connected)
    {
        return db.Place.findOne({where:{place:req.body.place}})
            .then((places) => {
                db.Place.create({
                    place: req.body.place,
                    longitude: req.body.lon,
                    latitude: req.body.lat,
                    user_id: req.session.userId
                });
                res.status(200).send(`place ${req.body.place} created in data base`);
            })
            .catch((err) => {
                res.status(405).send("add error" + err);
            });
    }
    else{
        res.status(500).send("add error");
    }
});

// Deleting city from list
router.delete('/delete/:id', (req, res) => {

    if(req.session.connected) {
        return db.Place.destroy({where:{place:req.params.id}})
            .then((places) => {
                res.status(200).send(`Location ${req.params.id} removed successfully`);
            })
            .catch((err) => {
                res.status(405).send("delete error" + err);
        });
    }
    else{
        res.status(500).send("delete error");
    }
});

// Getting all the resources
router.post('/getlist', (req, res) => {

    return db.Place.findAll({where:{user_id: req.session.userId}})
        .then((places) => {
            res.status(200).send(places);
        })
        .catch((err) => {
            res.status(405).send("get list error" + err);
        });
});

// Deleting whole list
router.delete('/resetlist', (req, res) => {

    if(req.session.connected) {
        return db.Place.destroy({where: {user_id: req.session.userId}})
            .then((places) => {
                res.status(200).send("list was reset");
            })
            .catch((err) => {
                res.status(405).send("reset list error" + err);
            });
    }
    else{
        res.status(500).send("reset error");
    }
});

module.exports = router;
