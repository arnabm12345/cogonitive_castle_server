const express = require('express')
const passport = require('passport')
const upload = require('../utils/multer')

const router = express.Router()

const { fetchStudents, markAttendence, facultyLogin, getAllSubjects,
    updatePassword, forgotPassword, postOTP, uploadMarks, updateProfile,getAllUploadedNotes,deleteUpload,getAllTimetable,
    updateTimetabel,getAllUploadedVideos,deleteVideo,uploadNotice,getAllUploadedNotice,deleteUploadNotice} = require('../controller/facultyController')

router.post('/login', facultyLogin)

router.post('/forgotPassword', forgotPassword)

router.post('/postOTP', postOTP)

router.post('/updateProfile', passport.authenticate('jwt', { session: false }), updateProfile)

router.post('/fetchStudents', passport.authenticate('jwt', { session: false }), fetchStudents)

router.post('/fetchAllSubjects', passport.authenticate('jwt', { session: false }), getAllSubjects)

router.post('/markAttendence', passport.authenticate('jwt', { session: false }), markAttendence)

router.post('/uploadMarks', passport.authenticate('jwt', { session: false }),uploadMarks)

router.post('/updatePassword', passport.authenticate('jwt', { session: false }), updatePassword)
router.get('/getAllUploadedNotes/:registration_num',getAllUploadedNotes)
router.delete('/deleteUpload',deleteUpload)
router.get('/getAllTimetable/:year',getAllTimetable);
router.post('/updateTimetabel',updateTimetabel);
router.get('/getAllUploadedVideos/:registration_num',getAllUploadedVideos)
router.delete('/deleteVideo',deleteVideo)
router.post('/uploadNotice',uploadNotice)
router.get('/getAllUploadedNotice/:registration_num',getAllUploadedNotice)
router.delete('/deleteUploadNotice',deleteUploadNotice)
module.exports = router
