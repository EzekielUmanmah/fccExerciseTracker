const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userProfile = require('../schemas/userProfile');

const addExercise = require('../schemas/addExercise');
const exerciseProfile = mongoose.model('exerciseProfile',addExercise)

router.post('/', (req, res, next) => {

  const { userId, description, date, duration } = req.body;

  const update = new exerciseProfile({
    description,
    duration: parseInt(duration),
    date: !date || new Date(date) == 'Invalid Date' ? new Date().toDateString() : new Date(date).toDateString()
  })
 
  //promise chain query style with minimal error code repetition
  return userProfile.findById(userId)
    .exec()
    .then( async profile => {
      //
      if(!profile) throw new Error(`Profile with the id: ${userId} was not found.`);

      await update.validate();

      profile.log.push(update);
      profile.count = profile.log.length;

      const response = {
        _id: userId,
        username: profile.username,
        description,
        duration: update.duration,
        date: update.date
        };

      profile.save();
      res.status(201).json(response);
      
    })
    .catch(next);

  //error first callback style; does not handle non-existant profile well and lots of repetition
  /*userProfile.findById(userId, (err, profile) => {
    if (err || !profile) return next(err)
    else {
      update.validate(err => {
        if (err) return next(err)
        else {
          profile.log.push(update)
          profile.count = profile.log.length;
          profile.save((err, result) => {
            if (err) return next(err);
            const response = {
              _id: userId,
              username: profile.username,
              description,
              duration: update.duration,
              date: update.date
            }
            res.status(201).json(response)
          })
        }
      });
    }
  })*/

});

module.exports = router;