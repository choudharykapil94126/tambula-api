const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

let user = process.env.DB_USER;
let pass = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.ejagxj7.mongodb.net/`)
.then(()=>{
  console.log('db connected');
})
.catch((error)=>{
  console.log(error);
})



// Connect to MongoDB
const ticketSchema = new mongoose.Schema({
  ticketNumbers: [[Number]],
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Create Tambula ticket

app.post('/tickets', async (req, res) => {
  try {
    const ticketNumber = generateTicketNumbers(); 

    // Save the ticket to the database
    const ticket = new Ticket({ ticketNumber });
    await ticket.save();
  
    res.json({ ticketId: ticket._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Generate unique ticket numbers

function generateTicketNumbers() {
  const ticketNumbers = [];

  // Generate numbers 1 to 90
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Shuffle the numbers randomly
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Divide the shuffled numbers into 6 tickets
  for (let i = 0; i < 9; i++) {
    const ticket = [];

    // Add numbers to each row
    for (let j = 0; j < 3; j++) {
      const columnNumbers = numbers.splice(0, 10);
      ticket.push(columnNumbers);
    }

    // Add zeros or 'x' to fill the blank cells
    for (let j = 0; j < 3; j++) {
      const missingCount = 8 - ticket[j].length;
      if (missingCount > 0) {
        ticket[j] = ticket[j].concat(Array.from({ length: missingCount }, () => 0));
      }
    }

    ticketNumbers.push(ticket);
  }

  return ticketNumbers;
}


// Fetch Tambula tickets


app.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the ticket from the database
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});


// Ticket schema and model

app.listen(3000, () => {
  console.log('Server started on port 3000');
});