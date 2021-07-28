
const startupDebugger= require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require('joi');  
const logger=require('./Logger');
const express = require('express');
const app = express();

app.set('view engine','pug');
app.set('views','./views');


app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));
app.use(helmet());

//configuration
console.log('Application name: '+config.get('name'));
console.log('Mail server: '+config.get('mail.host'));
console.log('Mail password: '+config.get('mail.password'));

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    startupDebugger('Morgan Enabled...');
}

//db work
dbDebugger('Connected to the database...');

app.use(logger);


const courses = [
    {id:1, name: 'course1'},
    {id:2, name: 'course2'},
    {id:3, name: 'course3'},
];

app.get('/', (req,res) => {
    res.render('index',{ title: 'My exsspress App', message: 'Hello'});
});

app.get('/api/courses', (req,res) =>{
    res.send(courses);
}); 

app.get('/get/courses/:id',(req,res) =>{
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('the course with the given id');


});


app.post('/api/courses',(req,res)=>{

    const {error}= validateCourse(req.body);
    if(error){
        res.status(400).send(result.error.details[0].message);
        return;  
    }
    const course ={
        id: courses.length +1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);   
});

app.put('/api/courses/:id',(req,res) =>{

    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course)res.status(404).send('The course was not found');
    
    const {error}= validateCourse(req.body);
    if(error){
        res.status(400).send(result.error.details[0].message);
        return;  
    }
    course.name= req.body.name;
    res.send(course);
});

app.delete('/api/courses/:d',(req,res)=>{

    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course)res.status(404).send('The course was not found');

    //delete
    const index = courses.indexOf(course);
    courses.splice(index,1); 

    res.send(course);
});

function validateCourse(course){
    const schema = Joi.object({ name: Joi.string() .min(3) .required()
    }) ;

    return schema.validate(course);
}

app.put('/api/courses/:id',(req,res) =>{
    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course)res.status(404).send('The course was not found');
    res.send(course);

});


const port = 3000;
app.listen(port,()=> console.log(`Listening on port ${port}...`));

