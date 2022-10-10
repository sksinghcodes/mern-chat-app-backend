const Task = require('../models/task'); 

exports.allTasks = (req, res) => {
    Task.find({author: req.userId})
        .then(tasks => {
            res.json({
                success: true,
                tasks,
            });
        })
        .catch(error => {
            res.json({
                success: false,
                error,
            });
        })
}

exports.addTask = (req, res) => {
    const task = new Task({
        author: req.userId,
        text: req.body.task,
        isComplete: false,
    })
    task.save()
        .then(() => Task.find({author: req.userId}))
        .then(tasks => {
            res.json({
                success: true,
                tasks,
            });
        })
        .catch(error => {
            res.json({
                success: false,
                error,
            });
        })
}

exports.removeTask = (req, res) => {
    Task.deleteOne({ _id: req.params.id, author: req.userId })
        .then(() => Task.find({author: req.userId}))
        .then(tasks => {
            res.json({
                success: true,
                tasks,
            });
        })
        .catch(error => {
            res.json({
                success: false,
                error,
            });
        })
}

exports.updateTask = (req, res) => {
    const task = req.body.task
    Task.findOneAndUpdate({_id: task._id, author: req.userId}, task, function(error) {
        if(error){
            res.json({
                success: false,
                error,
            });
        } else {
            Task.find({author: req.userId})
            .then(tasks => {
                res.json({
                    success: true,
                    tasks,
                });
            })
            .catch(error => {
                res.json({
                    success: false,
                    error,
                });
            })
        }
    })
        
}