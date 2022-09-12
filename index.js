const Joi = require('joi');
const JSONdb = require('simple-json-db');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

const studentsRoute = require('./training/students');
app.use('/students', studentsRoute);

const db = new JSONdb('./storage.json');

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(' <h2 style="font-family: Malgun Gothic; color: darkred;">Ooops... Cant find what you are looking for!</h2>');
});

//Define student schema
const schema = Joi.object({
    name: Joi.string().min(3).required(),
    age: Joi.number().min(1).max(150),
    mobileNo: Joi.number().required(),
    year: Joi.number().min(2018).max(2022).required(),
    branch: Joi.string().required(),
    address: Joi.string(),
    roleNumber: Joi.number(),
    percentage: Joi.number().min(1).max(100).required()
});
let students = [];

//Default route
app.get('/', (req, res) => {
    // res.send('Hello, Welcome to our NodeJS Training.');
    res.render('home');
});

//Get request to read all student records
app.get('/api/students', (req, res) => {
    res.send(students);
});

//Get request to read a single student record
app.get('/api/students/:id', (req, res) => {
    if(req.params.id) {
        const id = parseInt(req.params.id);
        const student = students.find(s => s.id === id);
        if(!student){
            res.status(404).send('No student found with the given ID.');
        }
        else {
            res.send(student);
        }
    } else {
        res.status(404).send('No student found with the given ID.');
    }
});

//Post request to create a single student record
app.post('/api/students', (req, res) => {
    const student = {
        id: students.length + 1,
        name: req.body.name
    };
    students.push(student);
    res.send(student);
});

//Post request to create a single student record with validations
app.post('/api/v2/students/', (req, res) => {
    const result = schema.validate(req.body);
    if(result.error){
        res.status(404).send(result.error);
    } else {
        const student = {
            id: students.length + 1,
            name: req.body.name,
            age: req.body.age,
            mobileNo: req.body.mobileNo,
            year: req.body.year,
            branch: req.body.branch,
            address: req.body.address,
            roleNumber: req.body.roleNumber,
            percentage: req.body.percentage
        };
        students.push(student);
        db.set('students', students);
        res.send(student);
    }
});

//Put request to update a single student record
app.put('/api/students', (req, res) => {
    const id = parseInt(req.body.id);
    const studentId = students.findIndex(s => s.id === id) + 1;
    // console.log(studentId);
    if(studentId) {
        students[studentId] = {
            id: id,
            name: req.body.name,
            age: req.body.age,
            mobileNo: req.body.mobileNo,
            year: req.body.year,
            branch: req.body.branch,
            address: req.body.address,
            roleNumber: req.body.roleNumber,
            percentage: req.body.percentage
        }
        res.send({
            "message": 'Student details updated successfully',
            "data": {
                id: id,
                name: req.body.name,
                age: req.body.age,
                mobileNo: req.body.mobileNo,
                year: req.body.year,
                branch: req.body.branch,
                address: req.body.address,
                roleNumber: req.body.roleNumber,
                percentage: req.body.percentage
            }
        });
    } else {
        res.status(404).send('No student found with the given ID.');
    }
});

//Delete request to delete a single student record
app.delete('/api/students', (req, res) => {
    const id = parseInt(req.body.id);
    console.log(id);
    students.splice(id-1,1);
    db.set('students', students);
    res.send({
        "message": 'Student deleted successfully',
        "data": students
    });
});

// Get home page
app.get('/home', (req, res) => {
    res.render("home");
});

app.listen(3001, () => console.log('Listening on port 3001...'));