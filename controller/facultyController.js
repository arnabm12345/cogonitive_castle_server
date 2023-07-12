const bcrypt = require("bcryptjs")
const fs = require("fs");
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/nodemailer')
const Student = require('../models/student')
const Subject = require('../models/subject')
const Faculty = require('../models/faculty')
const Attendence = require('../models/attendence')
const Mark = require('../models/marks')
const Note=require('../models/note')
const Timetable=require('../models/timetable')
const keys = require('../config/key')
const Video=require('../models/video')
const Notice=require('../models/notice')
//File Handler
const bufferConversion = require('../utils/bufferConversion')
const cloudinary = require('../utils/cloudinary')

const validateFacultyLoginInput = require('../validation/facultyLogin')
const validateFetchStudentsInput = require('../validation/facultyFetchStudent')
const validateFacultyUpdatePassword = require('../validation/FacultyUpdatePassword')
const validateForgotPassword = require('../validation/forgotPassword')
const validateOTP = require('../validation/otpValidation')
const validateFacultyUploadMarks = require('../validation/facultyUploadMarks')

module.exports = {
    facultyLogin: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyLoginInput(req.body);
            // Check Validation
            if (!isValid) {
              return res.status(400).json(errors);
            }
            const { registrationNumber, password } = req.body;

            const faculty = await Faculty.findOne({ registrationNumber })
            .populate('subjectsCanTeach')
            .exec();
            if (!faculty) {
                errors.registrationNumber = 'Registration number not found';
                return res.status(404).json(errors);
            }
            if(faculty.block===1){
                errors.block="user is blocked by the admin";
                return res.status(404).json(errors);
            }
            //const isCorrect = await bcrypt.compare(password, faculty.password)
            const isCorrect=password===faculty.password;
            if (!isCorrect) {
                errors.password = 'Invalid Credentials';
                return res.status(404).json(errors);
            }
            const payload = {
                id: faculty._id, faculty
            };
            jwt.sign(
                payload,
                keys.secretOrKey,
                { expiresIn: 3600 },
                (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    });
                }
            );
        }
        catch (err) {
            console.log("Error in faculty login", err.message)
        }
    },
    fetchStudents: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFetchStudentsInput(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { department, year, section } = req.body;
            const subjectList = await Subject.find({ department, year })
            if (subjectList.length === 0) {
                errors.department = 'No Subject found in given department';
                return res.status(404).json(errors);
            }
            const students = await Student.find({ department, year, section })
            if (students.length === 0) {
                errors.department = 'No Student found'
                return res.status(404).json(errors);
            }
            res.status(200).json({
                result: students.map(student => {
                    var student = {
                        _id: student._id,
                        registrationNumber: student.registrationNumber,
                        name: student.name
                    }
                    return student
                }),
                subjectCode: subjectList.map(sub => {
                    return sub.subjectCode
                })
            })
        }
        catch (err) {
            console.log("error in faculty fetchStudents", err.message)
        }

    },
    markAttendence: async (req, res, next) => {
        try {
            const { selectedStudents, subjectCode, department,
                year,
                section } = req.body
            
            const sub = await Subject.findOne({ subjectCode })

            //All Students
            const allStudents = await Student.find({ department, year, section })
            
            var filteredArr = allStudents.filter(function (item) {
                return selectedStudents.indexOf(item.id) === -1
            });

            
            //Attendence mark karne wale log nahi
            for (let i = 0; i < filteredArr.length; i++) {
                const pre = await Attendence.findOne({ student: filteredArr[i]._id, subject: sub._id })
                if (!pre) {
                    const attendence = new Attendence({
                        student: filteredArr[i],
                        subject: sub._id
                    })
                    attendence.totalLecturesByFaculty += 1
                    await attendence.save()
                }
                else {
                    pre.totalLecturesByFaculty += 1
                    await pre.save()
                }
            }
            for (var a = 0; a < selectedStudents.length; a++) {
                const pre = await Attendence.findOne({ student: selectedStudents[a], subject: sub._id })
                if (!pre) {
                    const attendence = new Attendence({
                        student: selectedStudents[a],
                        subject: sub._id
                    })
                    attendence.totalLecturesByFaculty += 1
                    attendence.lectureAttended += 1
                    await attendence.save()
                }
                else {
                    pre.totalLecturesByFaculty += 1
                    pre.lectureAttended += 1
                    await pre.save()
                }
            }
            res.status(200).json({ message: "done" })
        }
        catch (err) {
            console.log("error", err.message)
            return res.status(400).json({ message: `Error in marking attendence${err.message}` })
        }
    },
    uploadMarks: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyUploadMarks(req.body);

            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { subjectCode, exam, totalMarks, marks, department, year,
                section } = req.body
            const subject = await Subject.findOne({ subjectCode })
            const isAlready = await Mark.find({ exam, department, section, subjectCode:subject._id })
            if (isAlready.length !== 0) {
                errors.exam = "You have already uploaded marks of given exam"
                return res.status(400).json(errors);
            }
            for (var i = 0; i < marks.length; i++) {
                const newMarks = await new Mark({
                    student: marks[i]._id,
                    subject: subject._id,
                    exam,
                    department,
                    section,
                   
                    marks: marks[i].value,
                    totalMarks
                })
                await newMarks.save()
            }
            res.status(200).json({message:"Marks uploaded successfully"})
        }
        catch (err) {
            console.log("Error in uploading marks",err.message)
        }
        
    },
    getAllSubjects: async (req, res, next) => {
        try {
            const allSubjects = await Subject.find({})
            if (!allSubjects) {
                return res.status(404).json({ message: "You havent registered any subject yet." })
            }
            res.status(200).json({ allSubjects })
        }
        catch (err) {
            res.status(400).json({ message: `error in getting all Subjects", ${err.message}` })
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyUpdatePassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { registrationNumber, oldPassword, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(404).json(errors);
            }
            const faculty = await Faculty.findOne({ registrationNumber })
            const isCorrect = await bcrypt.compare(oldPassword, faculty.password)
            if (!isCorrect) {
                errors.oldPassword = 'Invalid old Password';
                return res.status(404).json(errors);
            }
            let hashedPassword;
            hashedPassword = await bcrypt.hash(newPassword, 10)
            faculty.password = hashedPassword;
            await faculty.save()
            res.status(200).json({ message: "Password Updated" })
        }
        catch (err) {
            console.log("Error in updating password", err.message)
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { errors, isValid } = validateForgotPassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email } = req.body
            const faculty = await Faculty.findOne({ email })
            if (!faculty) {
                errors.email = "Email Not found, Provide registered email"
                return res.status(400).json(errors)
            }
            function generateOTP() {
                var digits = '0123456789';
                let OTP = '';
                for (let i = 0; i < 6; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                return OTP;
            }
            const OTP = await generateOTP()
            faculty.otp = OTP
            await faculty.save()
            await sendEmail(faculty.email, OTP, "OTP")
            res.status(200).json({ message: "check your registered email for OTP" })
            const helper = async () => {
                faculty.otp = ""
                await faculty.save()
            }
            setTimeout(function () {
                helper()
            }, 300000);
        }
        catch (err) {
            console.log("Error in sending email", err.message)
        }
    },
    postOTP: async (req, res, next) => {
        try {
            const { errors, isValid } = validateOTP(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { email, otp, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(400).json(errors);
            }
            const faculty = await Faculty.findOne({ email });
            if (faculty.otp !== otp) {
                errors.otp = "Invalid OTP, check your email again"
                return res.status(400).json(errors)
            }
            let hashedPassword;
            hashedPassword = await bcrypt.hash(newPassword, 10)
            faculty.password = hashedPassword;
            await faculty.save()
            return res.status(200).json({ message: "Password Changed" })
        }
        catch (err) {
            console.log("Error in submitting otp", err.message)
            return res.status(200)
        }

    },
    updateProfile: async (req, res, next) => {
        try {
            const { email, gender, facultyMobileNumber,
                aadharCard } = req.body
          /*  const userPostImg = await bufferConversion(req.file.originalname, req.file.buffer)
            const imgResponse = await cloudinary.uploader.upload(userPostImg)*/
            const faculty = await Faculty.findOne({ email })
            if (gender) {
                faculty.gender = gender
                await faculty.save()
            }
            if (facultyMobileNumber) {
                faculty.facultyMobileNumber = facultyMobileNumber
                await faculty.save()
            }
            if (aadharCard) {
                faculty.aadharCard = aadharCard
                await faculty.save()
            }
         //   faculty.avatar = imgResponse.secure_url
            await faculty.save()
            res.status(200).json(faculty)
        }
        catch (err) {
            console.log("Error in updating Profile", err.message)
        }
    },
    uploadNote :async (req, res) => {
        const { subject, year } = req.body;
      
        // Check if a file was uploaded
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
      
        // Create a new note instance
        const note = new Note({
          subject,
          year,
          file: req.file.filename
        });
      
        // Save the note to the database
        note.save((err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save note' });
          }
          res.status(200).json({ message: 'Note uploaded successfully' });
        });
    },
    getAllUploadedNotes :async (req, res) =>{
      const {registration_num}=req.params;
      try {
        // Find all notes with the given registration_num
        const notes = await Note.find({ registration_num }).sort({ updatedAt: -1 })
        .populate('subject')
        .exec();
       return  res.status(200).json(notes);
      } catch (error) {
        console.error('Error occurred while retrieving notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes.' });
      }

    },
    deleteUpload :async (req, res) =>{
        const {_id,file}=req.body;
        const filename = file;
        const filePath = __dirname+ "/../uploads/" + file;

        try {
          fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Error occurred while deleting the note:", err);
                  // Handle the error, e.g., return an error response to the client
                //  return res.status(500).send("Error occurred while deleting the note.");
                }
            }
            )              
            await Note.findByIdAndDelete(_id);
        
            res.status(200).json({ message: 'Upload deleted successfully.' });
          } catch (error) {
            console.error('Error occurred while deleting the upload:', error);
            res.status(500).json({ error: 'Failed to delete the upload.' });
          }
    },
    updateTimetabel: async(req,res) =>{
        const { _id, period, time, zoomLink, subject } = req.body;

        try {
          const timetable = await Timetable.findById(_id);
      
          if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
          }
      
          // Update the specific period in the timetable
          timetable[period].time = time;
          timetable[period].zoomLink = zoomLink;
          timetable[period].subject = subject;
      
          // Save the updated timetable
          await timetable.save();
      
          return res.status(200).json({ message: 'Timetable updated successfully' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Internal server error' });
        }
    },
    getAllTimetable: async(req,res)=>{
        try {
            const {year}=req.params;
            const timetable = await Timetable.find({year});
            return res.status(200).json(timetable);
          } catch (error) {
            console.error("Error retrieving timetable:", error);
            throw error;
          }
    },
    getAllUploadedVideos :async (req, res) =>{
        const {registration_num}=req.params;
        try {
          // Find all notes with the given registration_num
          const videos = await Video.find({ registration_num }).sort({ updatedAt: -1 }).populate('subject')
          .exec();
         return  res.status(200).json(videos);
        } catch (error) {
          console.error('Error occurred while retrieving notes:', error);
          res.status(500).json({ error: 'Failed to retrieve notes.' });
        }
  
      },
      deleteVideo :async (req, res) =>{
        const {_id,file}=req.body;
        const filename = file;
        const filePath = __dirname+ "/../uploads_video/" + file;

        try {
          fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Error occurred while deleting the note:", err);
                  // Handle the error, e.g., return an error response to the client
                //  return res.status(500).send("Error occurred while deleting the note.");
                }
            }
            )              
            await Video.findByIdAndDelete(_id);
        
            res.status(200).json({ message: 'Upload deleted successfully.' });
          } catch (error) {
            console.error('Error occurred while deleting the upload:', error);
            res.status(500).json({ error: 'Failed to delete the upload.' });
          }
    },
    uploadNotice :async (req, res) => {
        const { subject, content, classt,registration_num} = req.body;
      
      const date1=new Date();
      const date = date1.toISOString().split('T')[0];

        // Create a new note instance
        const notice = new Notice({
          subject,
          content,
          classt,
          date,
          registration_num
        });
      
        // Save the note to the database
        notice.save((err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save note' });
          }
          res.status(200).json({ message: 'Note uploaded successfully' });
        });
    },
    getAllUploadedNotice :async (req, res) =>{
        const {registration_num}=req.params;
        try {
          // Find all notes with the given registration_num
          const notice = await Notice.find({ registration_num }).sort({ updatedAt: -1 });
         return  res.status(200).json(notice);
        } catch (error) {
          console.error('Error occurred while retrieving notes:', error);
          res.status(500).json({ error: 'Failed to retrieve notes.' });
        }
  
      },
      deleteUploadNotice :async (req, res) =>{
       
        const {_id}=req.body;
        try {
            // Find the note by _id and delete it
            await Notice.findByIdAndDelete(_id);
        
            res.status(200).json({ message: 'Upload deleted successfully.' });
          } catch (error) {
            console.error('Error occurred while deleting the upload:', error);
            res.status(500).json({ error: 'Failed to delete the upload.' });
          }
     
      },
}