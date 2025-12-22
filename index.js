const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :response-time ms :body'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}



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

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date.toDateString()} ${date.toLocaleTimeString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.filter(person => person.id===id);
    response.json(person);
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
})

app.post('/api/persons', (request, response) => {
    const body = request.body;
    const newPerson = {
        name: body.name, 
        number: body.number,
        id: generateId()
    };
    if(!body.name || !body.number){
        console.log('name or number missing');
        return response.status(400).json({ 
    error: 'content missing' 
  })
    }
    const duplicateCheck = persons.filter(person => person.name ===body.name);
    if(duplicateCheck.length!=0){
        console.log('no duplicate name');
        return response.status(400).json({ 
    error: 'no dup names' 
  })
    }
    persons = persons.concat(newPerson);
    response.status(201).json(newPerson);
})

app.use(unknownEndpoint)

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})