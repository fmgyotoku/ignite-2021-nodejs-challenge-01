const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

const users = []

app.use(express.json())

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers

  if (!username) {
    return response.status(412).json({ error: "Missing required condition" })
  }

  const user = users.find((user) => user.username === username)

  if (!user || user.length < 1) {
    return response.status(404).json({ error: "User not found" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body

  const hasUser = users.some((user) => user.username === username)

  if (hasUser) {
    response.status(400).json({ error: 'User already exists' })
  }

  const user = {
    name: name, 
    username: username, 
    id: uuidv4(), 
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
})

app.get('/users', (request, response) => {
  return response.json(users)
})

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
})

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(), 
    title: title, 
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
})

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = user.todos.find((todo) => todo.id === request.params.id)

  if (!todo) {
    response.status(404).json({ error: 'To do not found'})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json(todo)
})

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === request.params.id)

  if (!todo) {
    response.status(404).json({ error: 'To do not found'})
  }

  todo.done = true

  return response.status(201).json(todo)
})

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find((todo) => todo.id === request.params.id)

  if (!todo) {
    response.status(404).json({ error: 'To do not found'})
  }

  const idxTodo = user.todos.indexOf(todo)

  user.todos.splice(idxTodo, 1)

  return response.status(204).send()
})

module.exports = app
