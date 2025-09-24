

const express = require('express');
const path = require('path');
const { v4: uuid } = require('uuid');
const cookieParser = require('cookie-parser');
const { isAuth } = require('./middlewares/isAuth.js')
const { getTasks, saveTasks } = require('./utils/tasks.js');
const { getUsers , saveUsers } = require('./utils/users.js');
const { hashPassword, comparePassword } = require('./utils/password.js')

const app = express();
const port = 3000;


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded ({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



app.get('/', isAuth, async (req, res) => {
    const users = await getUsers();
    
    if (!req.cookies.username) {
        return res.redirect('/login');
    }
    const user = users.find(user => user.username === req.cookies.username);

    if (!user){
        return res.redirect('/login');
    }
    
    const tasks = await getTasks();
    const userTasks = tasks.find(task => task.userId === user.id);
    
    res.render('index', {
        layout: path.join('layout', 'main'),
        tasks: userTasks ? userTasks.tasks : [],
        hasTasks: userTasks && userTasks.tasks.length > 0
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

    res.cookie('loggedIn', true, {
        httpOnly: true
    });
    res.cookie('username', username, {
        httpOnly: true
    });

    res.redirect('/');

});

app.get('/login', (req,res) => {
    res.render('login', {
        layout: path.join('layout', 'main')
    })
});

app.post('/login', async (req,res) => {
    const {username, password} = req.body;

    const users = await getUsers();

    const user = users.find(user => user.username === username);

    if (!user){
        res.send('User with this username does not exist!');
        return;
    };
    

    const isMatch = await comparePassword(password, user.passwordHash);

    if (isMatch){
        res.cookie('loggedIn', true, {
            httpOnly: true
        });
        res.cookie('username', username, {
            httpOnly: true
        });
        res.redirect('/');
    } else {
        res.send('Wrong password!')
    }
});

app.get('/logout', isAuth, (req,res) => {
    res.clearCookie('loggedIn');
    res.clearCookie('username');
    res.redirect('/login');
})




app.listen(port, () => {
    console.log(`Server is listening on  http://localhost:${port}...`);
})
