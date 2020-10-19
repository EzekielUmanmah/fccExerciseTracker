const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//connect to MongoDB 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
}).then(() => console.log('Connected to MongoDB.'))
  .catch((e) => console.error('Something went wrong...', e));

app.use(cors());

//bodyparser enables parsing POSTed urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//serve the HTML/CSS for this app
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST: create new user
const createUser = require('./routes/createUser');
app.use('/api/exercise/new-user', createUser);

//POST: add exercise info to user profiles
const addExercise = require('./routes/addExercise');
app.use('/api/exercise/add', addExercise);

//GET: serve an array of all user profiles
const getAllUsers = require('./routes/getAllUsers');
app.use('/api/exercise/users', getAllUsers);

//GET: serve entire info. for one user with Query Params
const getOneUser = require('./routes/getOneUser');
app.use('/api/exercise/log', getOneUser);

// Not found middleware
app.use((req, res, next) => {
  const error = new Error(
    `The path ${req.originalUrl} was not found.`
  );
  error.statusCode = 404;
  next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors);
    //iterate through all thrown error keys and return each msg
    errMessage = keys.map(x => err.errors[`${x}`].message).join()
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt').send(errMessage)
});

const listener = app.listen(process.env.PORT || 2000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
