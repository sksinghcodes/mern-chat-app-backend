const router = require('express').Router();
const { 
    allTasks,
    addTask,
    removeTask,
    updateTask,
} = require('../controllers/task');
const { isAuthenticated } = require('../controllers/user');

router.get('/all', isAuthenticated, allTasks);
router.post('/', isAuthenticated, addTask);
router.delete('/:id', isAuthenticated, removeTask);
router.put('/', isAuthenticated, updateTask);

module.exports = router;