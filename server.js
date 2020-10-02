const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//var mongodb = require('mongodb');
//const ObjectId = mongodb.ObjectID;
const cors = require('cors');
/
//connect to MongoDB 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
}).then(()=> console.log('Connected to MongoDB.'))
.catch((e)=> console.error('Something went wrong...',e));

//I think this is to enable fcc tests
app.use(cors());

//bodyparser enables parsing POSTed urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//serve the HTML for this app
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//define exerciseSchema
const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    validate: {
      validator: function(str){
        return /[\w]+/.test(str)
      },
      message: 'Description must be word characters.'
    }
  },
  duration: {
    type: Number,
    min: 0,
  },
  date: String
});

//define exerciseSchema model
const exerciseProfile = mongoose.model('exerciseProfile', exerciseSchema);

//define userSchema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    validate: {
      validator: function(str){
        return /^[\w]+$/i.test(str)
      },
    message: 'A username must consist of only alphanumeric characters including underscore and cannot contain blank space.'
    }
    },
  log: [exerciseSchema],
  count: {type: Number, default: 0}
});

//define Model
const userProfile = mongoose.model('userProfile', userSchema);

//POST: create new user
app.post('/api/exercise/new-user', (req, res, next) => {

    let user = req.body.username;
    
    userProfile.findOne({ "username": user }, (err, foundUser) => {
      if (err) return next(err);
      else if (foundUser) {
        res.send(`Username "${foundUser.username}" already exists.`)
      }
      else {
        let createUser = new userProfile({
          "username": user
        });
        createUser.save((err, result) => {
          if (err) { 
            return next(err)
          }else{
            res.status(200).send({
              username: result.username,
              _id: result._id
            })
          }
        })
      }
    });

});

//POST: add exercise info to user profiles
app.post('/api/exercise/add', (req, res, next)=>{

  const {userId, description, date, duration} = req.body;

  const update = new exerciseProfile({
      description,
      duration: parseInt(duration),
      date: !date || new Date(date) == 'Invalid Date' ? new Date().toDateString() : new Date(date).toDateString()
    })

  userProfile.findById(userId, (err,profile)=>{
    if(err) return next(err)
    else{
      update.validate(err => {
        if(err) return next(err)
        else{
          profile.log.push(update)
          profile.count = profile.log.length;
          profile.save((err, result)=>{
          if(err) return next(err);
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

//test verifying __v field's function by deleting an exercise
app.get('/delete', (req, res, next)=>{
  const {userId, num} = req.query;
  
  userProfile.findById(userId, (err, data)=>{
    data.log.splice(num,del)
    res.json(data)
    data.save()
  })
})

//GET: serve an array of all user profiles
app.get('/api/exercise/users', async (req, res, next) => {
  try {
    userProfile.find({}, '_id username')
    .exec((err,result)=>{
      if(err) return next(err)
      res.send(result)
    })
  }
  catch (e) {
    next(e);
  }
});

//GET: serve entire info. for one user with Query Params
app.get('/api/exercise/log', (req, res, next)=>{

  const id = req.query.userId;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  //if(!id) return res.send('Enter a Valid userId')
  
  userProfile.findById(id, (err, result)=>{
    if(err || !result) return next(err)
    else{

      !parseInt(limit) || limit == null || limit > result.log.length ? 
      result.log.length = result.log.length : 
      result.log.length = limit;

      result.log = result.log.filter(x => {
        const exerDate = new Date(x.date);
        const fromDate = new Date(from);
        const toDate = new Date(to); 

        //if from&to=null, return all exercises
        if(!from && !to) return exerDate;
        //if from&to, return exercises between from&to
        else if(from && to) return exerDate > fromDate && exerDate < toDate;
        //if only to, return exercises before to date
        else if(!from && to) return exerDate < toDate;
        //if only from, return exercises after from date
        else if(from && !to) return exerDate > fromDate;
        });

      res.json(result);
    }
  })

})
// Not found middleware
app.use((req, res, next) => {console.log('not found middleware')
  return next({ status: 404, message: 'not found' })
});
// Error Handling Middleware
app.use((err, req, res, next) => {
  let errCode, errMessage
//console.log(Object.keys(err),'Object.keys(err)')
//console.log(err, 'err')
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors);
    console.log(1,keys)
    // report the first validation error
    //errMessage = err.errors[keys[0]].message
    errMessage = keys.length === 1 ? err.errors[keys[0]].message : 
    keys.map(x => err.errors[`${x}`].message).toString()
  } else {
    //console.log(2)
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});



const listener = app.listen(process.env.PORT || 4000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
