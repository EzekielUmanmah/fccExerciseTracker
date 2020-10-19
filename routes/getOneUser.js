const express = require('express');
const router = express.Router();
const userProfile = require('../schemas/userProfile');

router.get('/', (req, res, next) => {

  const { userId, from, to, limit } = req.query;

  userProfile.findById(userId)
    .exec()
    .then(result => {

      if (parseInt(limit)) {
        result.log = result.log.slice(0, limit);
      }

      if (from || to) {
        //define base date conditions if undefined by user
        let fromDate = new Date(0);
        let toDate = new Date();

        //redefine dates if they are defined by user
        if (from) {
          fromDate = new Date(from)
        }
        if (to) {
          toDate = new Date(to)
        }

        //return the filtered log by date range
        result.log = result.log.filter(x => {
          const exerDate = new Date(x.date);
          return exerDate >= fromDate && exerDate <= toDate;
        });
      }

      result.count = result.log.length;
      res.status(200).json(result);

    })
    .catch(next)

  /*userProfile.findById(userId, (err, result) => {
    if (err || !result) return next(err)
    else {

      if (parseInt(limit)) {
        result.log = result.log.slice(0, limit);
      }

      if (from || to) {
        //define base date conditions if undefined by user
        let fromDate = new Date(0);
        let toDate = new Date();

        //redefine dates if they are defined by user
        if (from) {
          fromDate = new Date(from)
        }
        if (to) {
          toDate = new Date(to)
        }

        //return the filtered log by date range
        result.log = result.log.filter(x => {
          const exerDate = new Date(x.date);
          return exerDate >= fromDate && exerDate <= toDate;
        });
      }

      result.count = result.log.length;
      res.status(200).json(result);
    }
  });*/

})

module.exports = router;