const express = require('express');
const http = require('http');
const socket = require('socket.io');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const dotenv = require('dotenv');
dotenv.config();


// MIDDLEWARES
const app = express();
app.use(express.json());
app.use(fileUpload());
let server = http.createServer(app);
let io = socket(server);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const Note = require('./models/note');
const Timetable=require('./models/timetable')
const Video=require('./models/video')
const Payment=require('./models/payment')
const Contact=require('./models/contact')
// Passport Middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.use(morgan('dev'));

io.on('connection', (socket) => {
  socket.on('join room', ({ room1, room2 }) => {
    socket.join(room1);
    socket.join(room2);
  });
  socket.on('private message', (message) => {
    io.to(message.room).emit('new Message', {
      message: message.message,
      sender: message.sender,
    });
  });
  socket.on('disconnect', function () {
    console.log('Socket disconnected');
  });
});


app.post("/upLoadNotes", (req, res) => {
  const file = req.files.screenshot;

  // Check if the file is of supported file type
  if (file.mimetype !== "application/pdf" && file.mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return res.status(400).send("Only PDF and DOCX file formats are supported.");
  }

  const filename = Date.now() + "_" + file.name;
  let uploadPath = __dirname + "/uploads/" + filename;

  file.mv(uploadPath, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error occurred while uploading the file.");
    }

    // Create a new note object
    const newNote = new Note({
      subject: req.body.subject, // Assuming the subject is sent in the request body
      file: filename,
      title: req.body.title,
      registration_num:req.body.registration_num,
    });

    try {
      // Save the note to the database
      await newNote.save();
      console.log("Note saved successfully.");
      res.sendStatus(200);
    } catch (error) {
      console.error("Error occurred while saving the note:", error);
      res.status(500).send("Error occurred while saving the note.");
    }
  });
});


app.get("/getNote/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = __dirname + "/uploads/" + filename;

  // Send the file as a response
  res.sendFile(filePath);
});


app.post("/uploadVideos", (req, res) => {
  const file1 = req.files.video;

  // Check if the file is of supported video file type
  if (
    file1.mimetype !== "video/mp4" &&
    file1.mimetype !== "video/mpeg" &&
    file1.mimetype !== "video/quicktime"
  ) {
    return res.status(400).send("Only MP4, MPEG, and QuickTime video formats are supported.");
  }

  const filename1 = Date.now() + "_" + file1.name;
  let uploadPath1 = __dirname + "/uploads_video/" + filename1;

  file1.mv(uploadPath1, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error occurred while uploading the file.");
    }
    // Create a new note object
    const newVideo = new Video({
      subject: req.body.subject,
      file: filename1,
      title: req.body.title,
      registration_num: req.body.registration_num,
      description:req.body.description
    });

    try {
      // Save the note to the database
      await newVideo.save();
      console.log("Note saved successfully.");
      res.sendStatus(200);
    } catch (error) {
      console.error("Error occurred while saving the note:", error);
      res.status(500).send("Error occurred while saving the note.");
    }
    
  });
});

app.get("/getVideo/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = __dirname + "/uploads_video/" + filename;

  // Send the file as a response
  res.sendFile(filePath);
});

let _response = {};

// ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);

// Catching 404 Error
app.use((req, res, next) => {
  const error = new Error('INVALID ROUTE');
  error.status = 404;
  next(error);
});

// Error handler function
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL.replace('<password>', process.env.MONGO_PASSWORD), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(async () => {
    _response.database = 'Healthy';
    console.log('Database Connected');

    // Define and load Mongoose models
    const AdminModel = require('./models/admin');
    const FacultyModel = require('./models/faculty');
    const StudentModel = require('./models/student');
    const NoteModel = require('./models/note');
    const TimeTableModel=require('./models/timetable');
    const PaymentModel=require('./models/payment')
    const ContactModel=require('./models/contact')
    const facultyRegModel=require('./models/facultyregister')
    const FeedbackModel=require('./models/feedback')
    // Create collections if they do not exist
    await AdminModel.createCollection();
    await FacultyModel.createCollection();
    await StudentModel.createCollection();
    await NoteModel.createCollection();
    await TimeTableModel.createCollection();
    await PaymentModel.createCollection();
    await ContactModel.createCollection();
    await facultyRegModel.createCollection();
    await FeedbackModel.createCollection();
    console.log('Models created');

    console.log('Server Started on PORT', PORT);
  })
  .catch((err) => {
    _response.database = 'Unhealthy';
    console.log('Error in connecting to the database', err.message);
  });

app.use('/', (req, res) => {
  res.status(200).json(_response);
});

server.listen(PORT, () => {
  _response.server = 'Healthy';
});

