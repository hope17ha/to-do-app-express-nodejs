

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { error } = require('console');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded ({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'tasks.json');
const userPath = path.join(__dirname, 'data', 'users.json');
const fsPromises = require('fs').promises;
const newId = uuid();

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}


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
  };

  async function getUsers(){
    try {
        const users = await fsPromises.readFile(userPath, 'utf8');
        return JSON.parse(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
  
  };
  
  async function saveUsers(users) {
    try {
        await fs.writeFile(userPath, JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error saving user:', error);
    }
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
    

});

app.get('/register', (req,res) => {
    res.render('register', {
        layout: path.join('layout', 'main')
    })
});

app.post('/register', async (req,res) => {
  
    const {username, email, password, confirmPassword} = req.body;

    if (password !== confirmPassword){
        res.send("Passwords don't match!");
        return;
    };

    const users = await getUsers();

    if (users.find(user => user.username === username || user.email === email )){
        res.send('User with this email or username already exists!')
        return;
    };

    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);

    const newUser = {
        id: uuid(),
        username: username,
        email: email,
        passwordHash: hashedPassword
    };

    users.push(newUser);

    await saveUsers(users);
    res.redirect('/');

})






app.listen(port, () => {
    console.log(`Server is listening on  http://localhost:${port}...`);
})
