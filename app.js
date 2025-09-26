

const express = require('express');
const path = require('path');
const { v4: uuid } = require('uuid');
const cookieParser = require('cookie-parser');
const { isAuth } = require('./middlewares/isAuth.js')
const { getCurrentUser } = require('./middlewares/getUser.js');
const { getTasks, saveTasks, getTaskByUserId } = require('./utils/tasks.js');
const { getUsers , saveUsers } = require('./utils/users.js');
const { hashPassword, comparePassword } = require('./utils/password.js');
const { execArgv } = require('process');
const { log } = require('util');
require ('./helpers/equals.js');


const app = express();
const port = 3000;


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded ({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(getCurrentUser);

app.use(async (req,res,next) => {
    res.locals.user = req.user || null;
    next();
});



app.get('/', isAuth, async (req, res) => {
    
    
    let userTasks = await getTaskByUserId(req.user.id);

    const filter = req.query.filter;

    if (filter === 'completed'){
        userTasks = userTasks.filter(task => task.completed === true);
    } else if (filter === 'active'){
        userTasks = userTasks.filter(task => task.completed === false);
    };
    
    res.render('index', {
        layout: path.join('layout', 'main'),
        tasks: userTasks ? userTasks : [],
        hasTasks: userTasks && userTasks.length > 0,
        filter: filter || 'all'
    }
     );
});

app.post('/toggle', isAuth, async (req, res) => {
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



app.post('/delete', isAuth, async (req,res) => {

    const tasks = await getTasks();

    const taskGroup = tasks.find(group => group.userId === req.user.id);
    
    if (!taskGroup){
        res.redirect('/');
    };

    const taskForDel = taskGroup.tasks.find ( task => task.id == Number(req.body.id))

    if (!taskForDel){
        res.redirect('/');
    };

    const idToDel = taskForDel.id;

    const updatedTasks = taskGroup.tasks.filter( task => task.id !== idToDel);

    taskGroup.tasks = updatedTasks;

    await saveTasks(tasks);

    res.redirect('/');
    

});

app.post('/add', isAuth, async (req,res) => {

    const tasks = await getTasks();


    let taskGroup = tasks.find(group => group.userId === req.user.id)
    
    if (!taskGroup){
        taskGroup = {
            userId: req.user.id,
            tasks: []
        };
        tasks.push(taskGroup);
    };

    const lastId = taskGroup.tasks.length > 0 ? taskGroup.tasks.length + 1 : 0;

    const newTask = {
        id: lastId,
        title: req.body.title,
        completed: false
    };

    taskGroup.tasks.push(newTask);
    await saveTasks(tasks);
    res.redirect('/');
    

});

app.get('/edit/:id', isAuth, async (req,res) => {
    const userTasks = await getTaskByUserId(req.user.id);
    
    if (!userTasks){
        res.redirect('/');
    };

    const currentTask = userTasks.find(task => task.id == req.params.id);

    if (!currentTask){
        res.redirect('/');
    };

    res.render('edit', {
        layout: path.join('layout', 'main'),
        task: currentTask

    });


});

app.post('/edit/:id', isAuth, async (req,res) => {
    const tasks = await getTasks();

    const userTasks = tasks.find(group => group.userId === req.user.id);

    if (!userTasks){
        res.redirect('/');
    };

    const taskToEdit = userTasks.tasks.find(task => task.id == req.params.id);

    if (!taskToEdit){
        res.redirect('/');
    };

    taskToEdit.title = req.body.title;

    await saveTasks(tasks);
    res.redirect('/');
    
});

app.get('/register', (req,res) => {
    res.render('register', {
        layout: path.join('layout', 'main')
    });
});

app.post('/register', async (req,res) => {
  
    const {username, email, password, confirmPassword} = req.body;

    if (password !== confirmPassword){
        return res.render('register', {
            layout: path.join('layout', 'main'),
            error: "Passwords don't match!"
        })
    };

    const users = await getUsers();

    if (users.find(user => user.username === username || user.email === email )){
        return res.render('register', {
            layout: path.join('layout', 'main'),
            error: "User with such username or email already exist!"
        })
    };

    const hashedPassword = await hashPassword(password);

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
        return res.render('login', {
            layout: path.join('layout', 'main'),
            error: "User with such username doesn't exist!"
        })
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
        return res.render('login', {
            layout: path.join('layout', 'main'),
            error: "Wrong password!"
        })
    }
});

app.get('/logout', isAuth, (req,res) => {
    res.clearCookie('loggedIn');
    res.clearCookie('username');
    res.redirect('/login');
});

app.get('/profile', isAuth, getCurrentUser, async (req,res) => {
    const userTasks = await getTaskByUserId(req.user.id);

    const completedTasks = userTasks.filter( task => task.completed);
    
    res.render('profile', {
        layout: path.join('layout', 'main'),
        user: req.user,
        tasks: userTasks,
        completedTasks: completedTasks,

    });
});

app.get('/profile-edit', isAuth, getCurrentUser, async (req,res) => {
    
    res.render('profile-edit', {
        layout: path.join('layout', 'main'),
        user: req.user
    })

});

app.post('/profile-edit', isAuth, async (req,res) => {

    const {username, email, password, confirmPassword} = req.body;

    const users = await getUsers();
    const currentUser = users.find(user => user.id == req.user.id);

    if (!users || !currentUser){
        return res.redirect('/');
    }

    currentUser.username = username;
    currentUser.email = email;

    if (password !== confirmPassword){
        return res.render('profile-edit', {
            layout: path.join('layout', 'main'),
            error: "Passwords don't match!",
            user: req.user
        })
    };

    if (password){   

     currentUser.passwordHash = await hashPassword(password);
     
    };
    
    await saveUsers(users);
    res.cookie('username', username, {
        httpOnly: true
    });
    res.cookie('loggedIn', true, {
        httpOnly: true
    });
    res.redirect('/');
});

app.post('/delete-profile', isAuth, async (req,res) => {
    let users = await getUsers();
    const currentUser = users.find(user => user.id == req.user.id);

    if (!users || !currentUser){
        return res.redirect('/');
    };

    users = users.filter(user => user !== currentUser);
    await saveUsers(users);

    res.clearCookie('loggedIn');
    res.clearCookie('username');
    res.redirect('/login');

})



app.listen(port, () => {
    console.log(`Server is listening on  http://localhost:${port}...`);
})
