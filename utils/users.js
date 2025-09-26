const fs = require('fs').promises;
const path = require('path');

const userPath = path.join(__dirname, '..', 'data', 'users.json');

async function getUsers(){
    try {
        const users = await fs.readFile(userPath, 'utf8');
        return JSON.parse(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
  
  };

  async function getCurrentUser(userId){
    try {
        const users = await getUsers();
        const user = users.find(user => user.id == userId);
        return user || null;

    } catch (error) {
        console.error('Error saving user:', error);
        return null;
    }
  };
  
  async function saveUsers(users) {
    try {
        await fs.writeFile(userPath, JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error saving user:', error);
    }
  };

  module.exports = { getUsers , saveUsers, getCurrentUser };