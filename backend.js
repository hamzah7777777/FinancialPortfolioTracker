const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios'); // Add axios for HTTP requests
const app = express();
const path = require('path');
// Finnhub API Key
const FINNHUB_API_KEY = 'cr6tf2hr01qg9ve85p30cr6tf2hr01qg9ve85p3g';
app.use(express.json());
app.use(cors());

// Connect to the MYSQL database called 'StockPortfolioDB'
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'c0nygre',
  database: 'StockPortfolioDB'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database!');
});

app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './', 'index.html'));
});


// Function to fetch the current price of a stock using Finnhub API
async function getCurrentStockPrice(ticker) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.c; // 'c' is the current price in Finnhub's response
  } catch (error) {
    console.error(`Error fetching current price for ${ticker}:`, error);
    return null; // Return null if there's an error
  }
}

// GET endpoint to retrieve a user's portfolio along with transactions, current stock prices, and percentage gain/loss
app.get('/portfolio/:username', async (req, res) => {
  const username = req.params.username;

  // Query the database to fetch the user's portfolio along with their transactions
  const query = `
    SELECT
      u.username,
      s.ticker_symbol,
      s.company_name,
      p.quantity,
      p.purchase_price,
      p.purchase_date,
      t.transaction_date,
      t.transaction_type
    FROM Users u
    JOIN Portfolio p ON u.user_id = p.user_id
    JOIN Stocks s ON p.stock_id = s.stock_id
    LEFT JOIN Transactions t ON t.portfolio_id = p.portfolio_id
    WHERE u.username = ?
    ORDER BY t.transaction_date DESC
  `;

  connection.query(query, [username], async (error, results, fields) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).json({ error: 'Error fetching portfolio data' });
      return;
    }

    // Format the results and include current stock prices and percentage gain/loss
    const portfolio = [];
    for (const row of results) {
      const portfolioItem = portfolio.find(item => item.ticker === row.ticker_symbol);

      const transaction = {
        transactionDate: row.transaction_date ? row.transaction_date.toISOString().slice(0, 10) : null,
        transactionType: row.transaction_type,
      };

      if (portfolioItem) {
        portfolioItem.transactions.push(transaction);
      } else {
        const currentPrice = await getCurrentStockPrice(row.ticker_symbol);
        const percentageChange = currentPrice ? ((currentPrice - row.purchase_price) / row.purchase_price) * 100 : null;

        portfolio.push({
          username: row.username,
          ticker: row.ticker_symbol,
          company: row.company_name,
          quantity: row.quantity,
          purchasePrice: row.purchase_price,
          purchaseDate: row.purchase_date.toISOString().slice(0, 10),
          currentPrice, // Add current stock price here
          percentageChange, // Add percentage gain/loss here
          transactions: row.transaction_date ? [transaction] : []
        });
      }
    }

    res.json(portfolio);
  });
});

// POST endpoint to add a new stock to a user's portfolio or update an existing one
app.post('/portfolio/add', async (req, res) => {
  const { username, ticker, quantity, purchasePrice, purchaseDate } = req.body;

  // Convert quantities and prices to numbers to avoid concatenation
  const newQuantity = Number(quantity);
  const newPurchasePrice = Number(purchasePrice);

  // First, fetch the user ID by username
  const userQuery = 'SELECT user_id FROM Users WHERE username = ?';
  connection.query(userQuery, [username], async (error, results) => {
    if (error || results.length === 0) {
      console.error('Error fetching user ID: ', error);
      res.status(500).json({ error: 'User not found' });
      return;
    }

    const userId = results[0].user_id;

    // Next, check if the stock exists in the Stocks table
    const stockQuery = 'SELECT stock_id FROM Stocks WHERE ticker_symbol = ?';
    connection.query(stockQuery, [ticker], (error, results) => {
      if (error) {
        console.error('Error fetching stock ID: ', error);
        res.status(500).json({ error: 'Error fetching stock data' });
        return;
      }

      let stockId;
      if (results.length === 0) {
        // If the stock doesn't exist, insert it into the Stocks table
        const insertStockQuery = 'INSERT INTO Stocks (ticker_symbol, company_name) VALUES (?, ?)';
        connection.query(insertStockQuery, [ticker, ticker], (error, results) => {
          if (error) {
            console.error('Error inserting new stock: ', error);
            res.status(500).json({ error: 'Error adding new stock' });
            return;
          }
          stockId = results.insertId;
          upsertPortfolio(userId, stockId, newQuantity, newPurchasePrice, purchaseDate, res);
        });
      } else {
        stockId = results[0].stock_id;
        upsertPortfolio(userId, stockId, newQuantity, newPurchasePrice, purchaseDate, res);
      }
    });
  });
});

// Helper function to insert data into the Portfolio table
function upsertPortfolio(userId, stockId, newQuantity, newPurchasePrice, purchaseDate, res) {
  // Check if the stock is already in the portfolio
  const portfolioQuery = 'SELECT quantity, purchase_price FROM Portfolio WHERE user_id = ? AND stock_id = ?';
  connection.query(portfolioQuery, [userId, stockId], (error, results) => {
    if (error) {
      console.error('Error checking portfolio: ', error);
      res.status(500).json({ error: 'Error checking portfolio' });
      return;
    }

    if (results.length > 0) {
      // If the stock is already in the portfolio, update the quantity and average the purchase price
      const currentQuantity = Number(results[0].quantity);
      const currentPurchasePrice = Number(results[0].purchase_price);

      const updatedQuantity = currentQuantity + newQuantity;
      const updatedPurchasePrice = ((currentQuantity * currentPurchasePrice) + (newQuantity * newPurchasePrice)) / updatedQuantity;

      const updateQuery = `
        UPDATE Portfolio
        SET quantity = ?, purchase_price = ?, purchase_date = ?
        WHERE user_id = ? AND stock_id = ?
      `;
      connection.query(updateQuery, [updatedQuantity, updatedPurchasePrice, purchaseDate, userId, stockId], (error, results) => {
        if (error) {
          console.error('Error updating portfolio: ', error);
          res.status(500).json({ error: 'Error updating portfolio' });
          return;
        }

        res.json({ message: 'Portfolio updated successfully!' });
      });
    } else {
      // If the stock is not in the portfolio, insert it as a new entry
      const insertQuery = `
        INSERT INTO Portfolio (user_id, stock_id, quantity, purchase_price, purchase_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      connection.query(insertQuery, [userId, stockId, newQuantity, newPurchasePrice, purchaseDate], (error, results) => {
        if (error) {
          console.error('Error inserting into Portfolio: ', error);
          res.status(500).json({ error: 'Error adding stock to portfolio' });
          return;
        }

        res.json({ message: 'Stock added to portfolio successfully!' });
      });
    }
  });
}

// POST endpoint to add a new user
app.post('/users/add', (req, res) => {
  const { username, email } = req.body;

  const query = 'INSERT INTO Users (username, email) VALUES (?, ?)';

  connection.query(query, [username, email], (error, results) => {
    if (error) {
      console.error('Error adding new user: ', error);
      res.status(500).json({ error: 'Error adding new user' });
      return;
    }

    res.json({ message: 'User added successfully!' });
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
