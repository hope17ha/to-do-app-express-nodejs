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


  module.exports = { getTasks, saveTasks }