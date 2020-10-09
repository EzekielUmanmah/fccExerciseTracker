const express = require('express');
const router = express.Router();
const userProfile = require('../schemas/userProfile');

//POST: create new user
router.post('/',  (req, res, next) => {

  const {username} = req.body;

  userProfile.findOne({username}, (err, foundUser) => {
    if (err) return next(err);
    else if (foundUser) {
      res.send(`Username "${foundUser.username}" already exists.`)
    }
    else {
      let createUser = new userProfile({
        username
      });
      createUser.save((err, result) => {
        if (err) {
          return next(err)
        } else {
          res.status(200).send({
            username: result.username,
            _id: result._id
          })
        }
      })
    }
  });
  
});

module.exports = router;