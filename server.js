var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000; // only for Heroku port as process.env.PORT

var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
},
{
    id: 2,
    description: 'Go to market',
    completed: false
},
{
    id: 3,
    description: 'Interview at 2 P.M',
    completed: true
}];

app.get('/', function (req, res) {
    res.send('Todo API Root');
});
/**
 * Get the list of todos
 */
app.get('/todos', function(req, res) {
    res.json(todos);
});

/**
 * Get the todo via id
 */
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo;
    todos.forEach(function (todo) {
        if (todoId === todo.id) {
            matchedTodo = todo;
        }
    });
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});