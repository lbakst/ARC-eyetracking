// Import necessary packages
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path')

// create and configure the express app
const PORT = process.env.PORT || 3000;
const cors = require('cors');

const fs              = require('fs');
const { spawn, fork } = require('child_process');

const path_a = 'pipe_a';
let fifoWs = fs.createWriteStream(path_a);

var app = express();
app.use(cors());
app.use(bodyParser.json({limit: '500mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

//...
//app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: 'im a keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Database Connection Info
const uri = process.env.MONGODB_URI;
const MongoClient = require("mongodb").MongoClient;

// the URL we copied from earlier. Replace username and password with what you created in the initial steps
const url = "mongodb+srv://ahncj:lwDspIJRCXOIunuk@cluster0.kjt6z.mongodb.net/arc-online-behavioral-db";
let db;

// The index route
app.get("/", function(req, res) {
  // res.send("ARC behavioral task by Cognitive Neuroimaging lab (Boston University)");
  res.sendFile(path.join(__dirname+'/app/home.html')); //remove log in screen

});

// Connect to the database with [url]
(async () => {
   app.listen(PORT, async function() {
       console.log(`Listening on Port ${PORT}`);
	});
})();

// Create player (local)
//app.post("/subject", async function(req, res) {
   // get information of player from POST body data
//   let { subj_ID, start_time, session } = req.body;
   // check if the subj_ID already exists in the local file
//   fs.readFile(__dirname+'/data/'+subj_ID+'.json', 'utf8', function (err, data) {
//    if (err) {
//      return console.log(err);
//    }
//    let dataArr= JSON.parse(data);
//    let found= dataArr.find(x => x.subj_ID==subj_ID)
//    if(found){
//       res.send({ status: false, msg: "Participant subj_ID already exists" });
//    }else{
//       dataArr.push({subj_ID, start_time, session});
//       fs.writeFile(__dirname+'/data/'+subj_ID+'.json', JSON.stringify(dataArr), function (err) {
//         if (err) {
//          return console.log(err);
//         }
//         res.send({ status: true, msg: "Participant created" });
//       });
//    }
//   });
//});

app.post("/subject", async function(req, res) {
   let { subj_ID, start_time, session } = req.body;
   let filePath = __dirname + '/data/' + subj_ID + '.json';

   fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
         // file doesn't exist, create a new file with an empty array
         fs.writeFile(filePath, JSON.stringify([]), (err) => {
            if (err) {
               console.error(err);
               res.send({ status: false, msg: "Could not create participant" });
               return;
            }

            // now that the file exists, continue with the rest of the logic
            addSubjectToFile(subj_ID, start_time, session, filePath, res);
         });
      } else {
         // file exists, continue with the rest of the logic
         addSubjectToFile(subj_ID, start_time, session, filePath, res);
      }
   });
});

function addSubjectToFile(subj_ID, start_time, session, filePath, res) {
   fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
         console.error(err);
         res.send({ status: false, msg: "Could not create participant" });
         return;
      }

      let dataArr = JSON.parse(data);
      let found = dataArr.find(x => x.subj_ID === subj_ID);
      if (found) {
         res.send({ status: false, msg: "Participant subj_ID already exists" });
      } else {
         dataArr.push({ subj_ID, start_time, session });
         fs.writeFile(filePath, JSON.stringify(dataArr), function (err) {
            if (err) {
               console.error(err);
               res.send({ status: false, msg: "Could not create participant" });
               return;
            }
            res.send({ status: true, msg: "Participant created" });
         });
      }
   });
}


// Route to send message to python
app.post("/python", async function(req, res,next) {
   // get information of player from POST body data
   console.log(req.body)
   let message;
    if (req.body.message === "Task") {
        message = "=";
    } else if (req.body.message === "New Subject") {
        message = "*";
    } else if (req.body.message === "Submit") {
        message = "+";
    } else if (req.body.message === "Start Break") {
        message = "b";
    } else if (req.body.message === "End Break") {
        message = "e";
    } else if (req.body.message === "End") {
        message = "q";
    } else {
        message = "default";
    }
    //let fifoWs = fs.createWriteStream(path_a);
    next();
    //console.log('Ready to write')
    fifoWs.write(message)
})


// Update player file (local)
app.put("/subject", async function(req, res) {
    let { subj_ID, start_time, session } = req.body;
    let filePath = __dirname + '/data/' + subj_ID + '.json';
    // read the data from local file
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        let dataArr = JSON.parse(data);
        let found = dataArr.find(x => x.subj_ID == subj_ID);
        if (found) {
            // update the data of player with the subj_ID
            let index = dataArr.indexOf(found);
            dataArr[index] = { subj_ID, start_time, session };
            fs.writeFile(filePath, JSON.stringify(dataArr), function (err) {
                if (err) {
                    return console.log(err);
                }
                res.send({ status: true, msg: "Participant task updated" });
            });
        } else {
            res.send({ status: false, msg: "Participant subj_ID not found" });
        }
    });
});

// delete player
//app.delete("/ARC", async function(req, res) {
//   let { subj_ID, start_time, session } = req.body;
   // check if the subj_ID already exists
//   const alreadyExisting = await db
//       .collection("BUBehavioral")
//       .findOne({ subj_ID: subj_ID });

//   if (alreadyExisting) {
//       await db.collection("BUBehavioral").deleteOne({ subj_ID });
//       console.log(`Participant ${subj_ID} deleted`);
//       res.send({ status: true, msg: "Participant deleted" });
//   } else {
//       res.send({ status: false, msg: "subj_ID not found" });
//   }
//});

app.get("/",function(req,res){
	console.log("hi")

})
app.use(express.static(path.join(__dirname, 'app')));

app.use(express.static(path.join(__dirname, 'login')));


app.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/login/login.html'));
});

//app.use(express.static("app"));
//app.use(express.static(path.join(__dirname, 'app')));

//app.use('/app', ensureAuthenticated);

// Access the leaderboard
//app.get("/ARC", function(req, res) {
//   db.collection("BUBehavioral")
//       .find()
       // -1 is for descending and 1 is for ascending
//       .sort({ task: -1 })
//       .toArray(function(err, result) {
//           if (err) {
//			res.send({ status: false, msg: "Failed to retrieve participants" });
//           } else {
//           	console.log(Array.from(result));
//           	res.send({ status: true, msg: result });
//           }
//       });
//});



var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;



var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("hrqvd", salt);


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

passport.use(new LocalStrategy(function(username,password, cb) {
  // Locate user first here
  bcrypt.compare(password, hash, function(err, res) {
    if (err) return cb(err);
    if (res === false) {
      return cb(null, false);
    } else {
      //console.log("nice")
      return cb(null, username);
    }
  });
}));
app.post('/login',
  passport.authenticate('local', { successRedirect: '/app',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

//app.post('/auth', function(req, res){
//  console.log("body parsing", req.body);
  //should be something like: {username: YOURUSERNAME, password: YOURPASSWORD}
//});


const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

// Defined routes

app.get("/app", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
     res.sendFile(path.join(__dirname+'/app/home.html'));
 
// res.render("user", {
//    title: "Profile",
//    userProfile: userProfile
//  });


});
