const { getUsers } = require('../utils/users.js')

async function getCurrentUser(req, res, next) {
    const username = req.cookies.username;

    if (!username) {
        req.user = null;
        return next();
    }

    const users = await getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.redirect('/login');
    }

    req.user = user || null;
    next();
};

module.exports = { getCurrentUser };