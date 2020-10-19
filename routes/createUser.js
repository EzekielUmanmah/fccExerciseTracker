const express = require('express');
const router = express.Router();
const userProfile = require('../schemas/userProfile');

//POST: create new user
router.post('/', (req, res, next) => {

  const {username} = req.body;

  userProfile.findOne({username})
    .exec()
    .then(async(result) => { 

      if(result) throw new Error('User already exists!');

      const newUser = await new userProfile({username}).save();

      res.status(201).json({
        username,
        _id: newUser._id
      });
        
    })
    .catch(next);

  /*userProfile.findOne({username}, (err, foundUser) => {
    if (err) return next(err);
    else if (foundUser) {
      res.status(409).send(`Username "${foundUser.username}" already exists.`)
    }
    else {
      let createUser = new userProfile({
        username
      });
      createUser.save((err, result) => {
        if (err) {
          return next(err)
        } else {
          res.status(201).send({
            username: result.username,
            _id: result._id
          })
        }
      })
    }
  });*/
  
});

module.exports = router;