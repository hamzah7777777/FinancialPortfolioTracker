const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  document.body.innerHTML = `
    <input id="ticker" value="AAPL" />
    <button id="searchStock">Search Stock</button>
    <div id="stockInfoDisplay"></div>
  `;
  require('./search_stock');
});

test('should call fetch with correct URL when ticker is provided', () => {
  fetch.mockResponseOnce(JSON.stringify({ name: 'Apple Inc.', ticker: 'AAPL' }));

  document.getElementById('searchStock').click();

  expect(fetch).toHaveBeenCalledWith('https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=cr2sp31r01qgsq6mtv4gcr2sp31r01qgsq6mtv50');
});

test('should show an alert if ticker is missing', () => {
  document.getElementById('ticker').value = '';
  const alertMock = jest.spyOn(window, 'alert').mockImplementation();

  document.getElementById('searchStock').click();

  expect(alertMock).toHaveBeenCalledWith('Please enter a stock ticker');
  alertMock.mockRestore();
});

test('should display stock information correctly', () => {
  const mockData = {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    country: 'USA',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '1980-12-12',
    marketCapitalization: 2500,
    shareOutstanding: 16000,
    logo: 'https://logo.clearbit.com/apple.com',
  };
  fetch.mockResponseOnce(JSON.stringify(mockData));

  document.getElementById('searchStock').click();

  expect(document.getElementById('stockInfoDisplay').innerHTML).toContain('Apple Inc. (AAPL)');
  expect(document.getElementById('stockInfoDisplay').innerHTML).toContain('NASDAQ');
});
