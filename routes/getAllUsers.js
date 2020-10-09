const express = require('express');
const router = express.Router();
const userProfile = require('../schemas/userProfile');

router.get('/', (req, res, next) => {

    userProfile.find({}, '_id username')
      .exec()
      .then(docs => {
        res.status(200).json(docs)
      })
      .catch(err => next(err))
      
});

module.exports = router;