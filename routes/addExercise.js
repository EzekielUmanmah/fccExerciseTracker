const express = require('express');
const router = express.Router();
const userProfile = require('../schemas/userProfile');

const addExercise = require('../schemas/addExercise');
const mongoose = require('mongoose');
const exerciseProfile = mongoose.model('exerciseProfile',addExercise)

router.post('/', (req, res, next) => {

  const { userId, description, date, duration } = req.body;

  const update = new exerciseProfile({
    description,
    duration: parseInt(duration),
    date: !date || new Date(date) == 'Invalid Date' ? new Date().toDateString() : new Date(date).toDateString()
  })

  userProfile.findById(userId, (err, profile) => {
    if (err) return next(err)
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
            res.json(response)
          })
        }
      });
    }
  })

});

module.exports = router;