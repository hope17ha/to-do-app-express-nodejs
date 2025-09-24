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

async function saveTasks(tasks) {
  try {
    await fs.writeFile(dataPath, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
}

module.exports = { saveTasks };


  async function getTaskByUserId(userId){
    const tasks = await getTasks();
    const userTask = tasks.find(task => task.userId === userId);

    return userTask ? userTask.tasks : [];
  }


  module.exports = { getTasks, saveTasks, getTaskByUserId }