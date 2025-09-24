const path = require('path');
const fs = require('fs').promises;

const dataPath = path.join(__dirname, '..', 'data', 'tasks.json');

async function getTasks() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks:', error);
        return [];
    }
};


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

  async function getTaskByUserId(userId){
    const tasks = await getTasks();
    const userTask = tasks.find(task => task.userId === userId);

    return userTask ? userTask.tasks : [];
  }


  module.exports = { getTasks, saveTasks }