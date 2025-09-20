

const express = require('express');
const path = require('path');
const fs = require('fs');
const { error } = require('console');

const app = express();
const port = 3000;


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded ({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'tasks.json');

function getTasks(){
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2), (error) => {
        if (error){
            console.error(error);
            return res.status(500).send('Could not save tasks.');
        } else {
            res.redirect('/');
        }
    });
}


app.get('/', (req, res) => {
    const tasks = getTasks();
    res.render('index', {
        layout: path.join('layout', 'main'),
        tasks: tasks
    }
     );
});

app.post('/toggle', (req,res) => {
    const tasks = getTasks();
    const task = tasks.find(task => task.id == req.body.id);
    if (task && task.completed !== undefined){
        task.completed = !task.completed;
        saveTasks(tasks)
    }
    res.redirect('/');

});

app.post('/delete', (req,res) => {
    const tasks = getTasks();
    const taskForDel = tasks.find ( task => task.id == req.body.id)
    const idToDel = taskForDel.id;

    const updatedTasks = tasks.filter( task => task.id !== idToDel);

    saveTasks(updatedTasks);

    res.redirect('/');
})








app.listen(port, () => {
    console.log('Server is listening on  http://localhost:3000...');
})
