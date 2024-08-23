document.getElementById('searchStock').addEventListener('click', function() {
    const ticker = document.getElementById('ticker').value.trim();
  
    if (!ticker) {
      alert('Please enter a stock ticker');
      return;
    }
  
    // Fetch stock information from the Finnhub API
    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=cr2sp31r01qgsq6mtv4gcr2sp31r01qgsq6mtv50`)
      .then(response => response.json())
      .then(data => displayStockInfo(data))
      .catch(error => console.error('Error fetching stock information:', error));
  });
  
  function displayStockInfo(data) {
    const stockInfoDisplay = document.getElementById('stockInfoDisplay');
    stockInfoDisplay.innerHTML = ''; // Clear any previous content
  
    if (Object.keys(data).length === 0) {
      stockInfoDisplay.textContent = 'No information found for this stock.';
      return;
    }
  
    const companyName = data.name || 'N/A';
    const ticker = data.ticker || 'N/A';
    const country = data.country || 'N/A';
    const currency = data.currency || 'N/A';
    const exchange = data.exchange || 'N/A';
    const ipo = data.ipo || 'N/A';
    const marketCapitalization = data.marketCapitalization || 'N/A';
    const shareOutstanding = data.shareOutstanding || 'N/A';
    const logo = data.logo || '';
  
    // Construct the HTML for displaying the stock information
    const stockInfoHTML = `
      <div class="card">
        <div class="card-body">
          <h2>${companyName} (${ticker})</h2>
          <img src="${logo}" alt="${companyName} logo" style="width:100px; height:100px;">
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Currency:</strong> ${currency}</p>
          <p><strong>Exchange:</strong> ${exchange}</p>
          <p><strong>IPO Date:</strong> ${ipo}</p>
          <p><strong>Market Capitalization:</strong> ${marketCapitalization} million</p>
          <p><strong>Shares Outstanding:</strong> ${shareOutstanding} million</p>
        </div>
      </div>
    `;
  
    stockInfoDisplay.innerHTML = stockInfoHTML;
  }
  