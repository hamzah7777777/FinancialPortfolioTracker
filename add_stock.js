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
      })
      .catch(error => console.error('Error adding stock:', error));
  });
  