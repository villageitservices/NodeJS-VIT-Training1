const express = require('express');
const { appendFile } = require('fs');
var router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const JSONdb = require('simple-json-db');
const db = new JSONdb('./storage.json');

//Show new student form
router.get('/new', (req, res) => {
    res.render('new-student', {
        student: {}
    });
});

// Get students page
router.get('/', (req, res) => {
    let students = db.get('students');
    if(students.length > 0) {
        res.render("students", {
            students: students,
            pskip: 0,
            nskip: 1,
            limit: 1,
            sampleText: "Hello, Good afternoon!"
        });
    } else {
        res.render("students", {
            students: [],
            sampleText: "Hello, Good afternoon!"
        });
    }
});

// Get students page with skip and limit
router.get('/filter/:skip/:limit', (req, res) => {
    let skip = parseInt(req.params.skip);
    let limit = parseInt(req.params.limit);
    console.log(skip);
    let students = db.get('students');
    let studentSubset = [];
    for(i=skip; i<limit+skip; i++){
        studentSubset.push(students[i]);
    }
    console.log(studentSubset);
    if(studentSubset.length > 0) {
        res.render("students", {
            students: studentSubset,
            pskip: skip == 0 ? skip : skip-limit,
            nskip: limit+skip,
            limit: limit,
            sampleText: "Hello, Good afternoon!"
        });
    } else {
        res.render("students", {
            students: [],
            sampleText: "Hello, Good afternoon!"
        });
    }
});

//add new student or edit existing student
router.post('/', (req, res) => {
    let students = db.get('students');
    let id = req.body.id;
    if(id) {
        let idx = students.findIndex((s) => s.id == id);
        students.splice(idx,1);
        students.push({
            id: id,
            name: req.body.name,
            branch: req.body.branch
        });
    } else {
        if(students && students.length >0 ) {
            let maxId = 0;
            students.forEach((s) => {
                if(s.id > maxId) {
                    maxId = s.id;
                }
            });
            students.push({
                id: maxId+1,
                name: req.body.name,
                branch: req.body.branch
            });
        } else {
            students = [];
            students.push({
                id: students.length + 1,
                name: req.body.name,
                branch: req.body.branch
            });
        }
    }
    db.set('students', students);
    res.render('students', {
        students: students,
        sampleText: "Hello, Good afternoon!"
    });
});

//edit a student details based on their id
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    let student = db.get('students').find(s => s.id == id);
    if(student) {
        res.render('new-student', {
            student: student
        });
    } else {
        res.send("Error");
    }
});

//delete a student based on their id
router.get('/delete/:id', (req, res) => {
    let id = parseInt(req.params.id);
    console.log("102", id);
    let students = db.get('students');
    let newStudents = [];
    students.forEach(s => {
        console.log(s);
        if(s.id != id) {
            newStudents.push(s);
        }
    });
    db.set('students', newStudents);
    res.render('students', {
        students: newStudents,
        sampleText: "Hello, Friday!"
    });
});

module.exports = router;