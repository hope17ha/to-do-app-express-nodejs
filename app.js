

const express = require('express');
const path = require('path');
const { v4: uuid } = require('uuid');
const cookieParser = require('cookie-parser');
const { isAuth } = require('./middlewares/isAuth.js')
const { getCurrentUser } = require('./middlewares/getUser.js');
const { getTasks, saveTasks, getTaskByUserId } = require('./utils/tasks.js');
const { getUsers , saveUsers } = require('./utils/users.js');
const { hashPassword, comparePassword } = require('./utils/password.js')

const app = express();
const port = 3000;


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded ({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



app.get('/', isAuth, getCurrentUser, async (req, res) => {
    
    
    const userTasks = await getTaskByUserId(req.user.id);
    
    res.render('index', {
        layout: path.join('layout', 'main'),
        tasks: userTasks ? userTasks : [],
        hasTasks: userTasks && userTasks.length > 0
    }
     );
});

app.post('/toggle', isAuth, getCurrentUser, async (req, res) => {
    try {
        const { id } = req.body;
        const tasks = await getTasks();

        const tasksGroup = tasks.find(group => group.userId === req.user.id);
        if (!tasksGroup) {
            return res.redirect('/');
        }

        const task = tasksGroup.tasks.find(task => task.id == id);
        if (!task) {
            return res.redirect('/');
        }

        task.completed = !task.completed;

        await saveTasks(tasks);
        return res.redirect('/');
    } catch (err) {
        console.error('Error in /toggle:', err);
        return res.status(500).send('Internal Server Error');
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

app.post('/add', isAuth, getCurrentUser, async (req,res) => {

    const userTasks = await getTaskByUserId(req.user.id);
    console.log(userTasks);

   
    const lastId = userTasks ? userTasks.length : 0;
    const taskToAdd = { id: lastId + 1 , title: req.body.title , completed: false};

    const updatedTasks = [...userTasks, taskToAdd];
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
