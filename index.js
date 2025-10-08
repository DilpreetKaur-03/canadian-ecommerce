const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // ✅ sabse important
app.use(express.json());

// Example API
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, title: 'Laptop', price: 999 },
    { id: 2, title: 'Wireless Headphones', price: 199 },
    { id: 3, title: '4K TV', price: 149 }
  
  ]);
});

app.listen(8000, () => {
  console.log('✅ Backend running at http://localhost:8000');
});