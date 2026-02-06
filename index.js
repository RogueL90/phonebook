require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./model/person')

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :response-time ms :body'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// No longer needed after implementation of mongoDB which auto generates an ID for each document

/*
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => String(Math.random());
*/

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res =>{
    response.json(res)
  })
})

app.get('/info', (request, response, next) => {
    const date = new Date()
    Person.find({})
    .then(people => {
      response.send(`<p>Phonebook has info for ${people.length} people</p><p>${date.toDateString()} ${date.toLocaleTimeString()}</p>`)
    }).catch(err => next(err))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
      if(!person){
        response.status(404).end()
      }
      response.json(person)
    }).catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(res => {
      console.log(res)
      response.status(204).end();
    }).catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if(!person){
      return response.status(404).end()
    }
    person.name = request.body.name
    return person.save()
    .then(updatedPerson => response.json(updatedPerson))
  })
  .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;
    const newPerson = Person({
        name: body.name, 
        number: body.number,
    })
    if(!body.name || !body.number){
        console.log('name or number missing');
        return response.status(400).json({ 
    error: 'content missing' 
  })
    }
    Person.find({name: body.name}).then(after => {
      if(after.length!=0){
        console.log(after);
        return response.status(400).json({ 
    error: 'no dup names' 
  })
    }
    return newPerson.save().then(res => {
      response.status(201).json(res);
    })
    })
    .catch(err => next(err))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})