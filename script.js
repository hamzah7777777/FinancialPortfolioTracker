document.getElementById('fetchPortfolio').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    if (!username) {
      alert('Please enter a username');
      return;
    }
  
    // Fetch the portfolio data from the backend
    fetch(`http://localhost:3000/portfolio/${username}`)
      .then(response => response.json())
      .then(data => displayPortfolio(data))
      .catch(error => console.error('Error fetching portfolio:', error));
  });
  
  document.getElementById('addStock').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const ticker = document.getElementById('ticker').value;
    const quantity = document.getElementById('quantity').value;
    const purchasePrice = document.getElementById('purchasePrice').value;
    const purchaseDate = document.getElementById('purchaseDate').value;
  
    if (!username || !ticker || !quantity || !purchasePrice || !purchaseDate) {
      alert('Please fill out all fields');
      return;
    }
  
    // Send the new stock data to the backend
    fetch('http://localhost:3000/portfolio/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, ticker, quantity, purchasePrice, purchaseDate }),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        // Optionally, refresh the portfolio display after adding the stock
        fetchPortfolio(username);
      })
      .catch(error => console.error('Error adding stock:', error));
  });
  
  function fetchPortfolio(username) {
    fetch(`http://localhost:3000/portfolio/${username}`)
      .then(response => response.json())
      .then(data => displayPortfolio(data))
      .catch(error => console.error('Error fetching portfolio:', error));
  }
  
  function displayPortfolio(portfolio) {
    const portfolioDisplay = document.getElementById('portfolioDisplay');
    portfolioDisplay.innerHTML = ''; // Clear any previous content
  
    if (portfolio.length === 0) {
      portfolioDisplay.textContent = 'No portfolio found for this user.';
      return;
    }
  
    portfolio.forEach(item => {
      const stockDiv = document.createElement('div');
      stockDiv.classList.add('stock');
  
      // Calculate percentage change formatted as a string with 2 decimal places
      const percentageChange = item.percentageChange !== null ? item.percentageChange.toFixed(2) : 'N/A';
  
      // Display portfolio information including current stock price and percentage change
      const portfolioInfo = `
        <h2>${item.company} (${item.ticker})</h2>
        <p>Quantity: ${item.quantity}</p>
        <p>Purchase Price: $${item.purchasePrice}</p>
        <p>Current Price: $${item.currentPrice !== null ? item.currentPrice.toFixed(2) : 'N/A'}</p>
        <p>Percentage Gain/Loss: ${percentageChange}%</p>
        <p>Purchase Date: ${item.purchaseDate}</p>
      `;
      stockDiv.innerHTML = portfolioInfo;
  
      // Display transactions if they exist
      if (item.transactions.length > 0) {
        const transactionsTable = document.createElement('table');
        transactionsTable.border = "1";
  
        const headerRow = document.createElement('tr');
        const headers = ['Transaction Date', 'Type', 'Amount'];
        headers.forEach(headerText => {
          const header = document.createElement('th');
          header.textContent = headerText;
          headerRow.appendChild(header);
        });
        transactionsTable.appendChild(headerRow);
  
        item.transactions.forEach(transaction => {
          const row = document.createElement('tr');
  
          const dateCell = document.createElement('td');
          dateCell.textContent = transaction.transactionDate || 'N/A';
          row.appendChild(dateCell);
  
          const typeCell = document.createElement('td');
          typeCell.textContent = transaction.transactionType || 'N/A';
          row.appendChild(typeCell);
  
          const amountCell = document.createElement('td');
          amountCell.textContent = transaction.transactionAmount || 'N/A';
          row.appendChild(amountCell);
  
          transactionsTable.appendChild(row);
        });
  
        stockDiv.appendChild(transactionsTable);
      } else {
        const noTransactions = document.createElement('p');
        noTransactions.textContent = 'No transactions available for this stock.';
        stockDiv.appendChild(noTransactions);
      }
  
      portfolioDisplay.appendChild(stockDiv);
      portfolioDisplay.appendChild(document.createElement('hr'));
    });
  }
  