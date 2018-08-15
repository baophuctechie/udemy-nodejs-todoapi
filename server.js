var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000; // only for Heroku port as process.env.PORT
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});
/**
 * Get the list of todos
 */
app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var where = {};
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        where.completed = true;
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        where.completed = false;
    }
    if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
        where.description = {
            $like: '%' + queryParams.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });
});

/**
 * Get the todo via id
 */
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

/**
 * POST add the todo item to the todos array / database
 */
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    
    if (!_.isBoolean(body.completed) || !_.isString(body.description)
            || body.description.trim().length === 0) {
        return res.status(400).send();
    }
    db.todo.create({
        description: body.description.trim(),
        completed: body.completed
    }).then(function(todo) {
        if (todo) {
            res.status(200).json(todo);
        } else {
            res.status(404).json({
                "error": "No todo created."
            });
        }
    }).catch(function(e) {
        res.status(400).json(e);
    });
})

/**
 * Delete an todo item
 * DELETE /todos/:id
 */
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({"error": "No todo with id"});
        } else {
            res.status(204).send();
        }
    }, function() {
        res.status(500).send();
    });
})

/**
 * Update an todo item
 * PUT /todos/:id
 */
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    
    db.todo.findById(todoId).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
})

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function(user) {
        res.json(user.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });
})

db.sequelize.sync().then(function() {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
})