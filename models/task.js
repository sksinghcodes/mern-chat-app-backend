const { Schema, model } = require('mongoose');

const taskSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
        maxLength: 300,
        trim: true,
    }, 
    isComplete: {
        type: Boolean,
        required: true,
    },
})

module.exports = model('Task', taskSchema);