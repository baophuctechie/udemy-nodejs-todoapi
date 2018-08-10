var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");

var app = express();
var PORT = process.env.PORT || 3000; // only for Heroku port as process.env.PORT
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

/*
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
*/

app.get('/', function (req, res) {
    res.send('Todo API Root');
});
/**
 * Get the list of todos
 */
app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var filtedTodos = todos;
    // Filter via completed ?completed=false/true
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filtedTodos = _.where(filtedTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filtedTodos = _.where(filtedTodos, {completed: false});
    }

    // Filter via description ?q=xxxx
    if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
        filtedTodos = _.filter(filtedTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

    res.json(filtedTodos);
});

/**
 * Get the todo via id
 */
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    /*var matchedTodo;
    todos.forEach(function (todo) {
        if (todoId === todo.id) {
            matchedTodo = todo;
        }
    });*/
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

/**
 * POST add the todo item to the todos array
 */
app.post('/todos', function(req, res) {
    //var body = req.body;
    var body = _.pick(req.body, 'description', 'completed');
    if (!_.isBoolean(body.completed) || !_.isString(body.description) 
            || body.description.trim().length === 0) {
        return res.status(400).send();
    }
    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);
    res.json(body);
    /*var todoItem = {
        'id': todoNextId++,
        'description': body.description,
        'completed': body.completed
    };
    todos.push(todoItem);
    res.json(todoItem);*/

})

/**
 * Delete an todo item
 * DELETE /todos/:id
 */
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({"error": "no todo found with that id"});
    }
})

/**
 * Update an todo item
 * PUT /todos/:id
 */
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }

    // Validate the completed property first
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }
    // Validate the description property first
    if (body.hasOwnProperty('description') && _.isString(body.description) 
            && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
})

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});