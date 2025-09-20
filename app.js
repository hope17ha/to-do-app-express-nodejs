

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
const fsPromises = require('fs').promises;

async function getTasks() {
    try {
        const data = await fsPromises.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks:', error);
        return [];
    }
}


function saveTasks(tasks, callback) {
    fs.writeFile(dataPath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        console.error('Error saving tasks:', err);
        callback(err);
      } else {
        callback(null);
      }
    });
  }


app.get('/', async (req, res) => {
    const tasks = await getTasks();
    res.render('index', {
        layout: path.join('layout', 'main'),
        tasks: tasks
    }
     );
});

app.post('/toggle', async (req,res) => {
    const tasks = await getTasks();
    const task = tasks.find(task => task.id == Number(req.body.id));
    if (task && task.completed !== undefined){
        task.completed = !task.completed;
        saveTasks(tasks, (error) => {
            if (error){
                return res.status(500).send('Failed to save task.');
            }
            res.redirect('/');
        })
    } else {
        res.redirect('/');
    }
   

});

app.post('/delete', async (req,res) => {
    const tasks = await getTasks();
    const taskForDel = tasks.find ( task => task.id == Number(req.body.id))
    const idToDel = taskForDel.id;

    const updatedTasks = tasks.filter( task => task.id !== idToDel);

    saveTasks(updatedTasks, (error) => {
        if (error){
            return res.status(500).send('Failed to delete task.')
        } 
        res.redirect('/');
    });
    

})

app.post('/add', async (req,res) => {
    const tasks = await getTasks();
    const lastId = tasks ? tasks.length : 0;
    const taskToAdd = { id: lastId + 1 , title: req.body.title , completed: false};

    const updatedTasks = [...tasks, taskToAdd];
    saveTasks(updatedTasks, (error) => {
        if (error) {
            return res.status(500).send('Failed to save task.');
        }
        res.redirect('/');
    });
    

})





app.listen(port, () => {
    console.log(`Server is listening on  http://localhost:${port}...`);
})
