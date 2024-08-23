const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  document.body.innerHTML = `
    <input id="username" value="testuser" />
    <button id="fetchPortfolio">Get Portfolio</button>
    <div id="portfolioDisplay"></div>
  `;
  require('./script');
});

test('should call fetch with correct URL when username is provided', () => {
  fetch.mockResponseOnce(JSON.stringify([]));

  document.getElementById('fetchPortfolio').click();

  expect(fetch).toHaveBeenCalledWith('http://localhost:3000/portfolio/testuser');
});

test('should show an alert if username is missing', () => {
  document.getElementById('username').value = '';
  const alertMock = jest.spyOn(window, 'alert').mockImplementation();

  document.getElementById('fetchPortfolio').click();

  expect(alertMock).toHaveBeenCalledWith('Please enter a username');
  alertMock.mockRestore();
});

test('should display "No portfolio found" message if portfolio is empty', () => {
  fetch.mockResponseOnce(JSON.stringify([]));

  document.getElementById('fetchPortfolio').click();

  expect(document.getElementById('portfolioDisplay').textContent).toBe('No portfolio found for this user.');
});

test('should display portfolio information correctly', () => {
  const mockPortfolio = [
    {
      company: 'Apple Inc.',
      ticker: 'AAPL',
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 170,
      percentageChange: 13.33,
      purchaseDate: '2024-08-01',
      transactions: [],
    },
  ];
  fetch.mockResponseOnce(JSON.stringify(mockPortfolio));

  document.getElementById('fetchPortfolio').click();

  expect(document.getElementById('portfolioDisplay').innerHTML).toContain('Apple Inc. (AAPL)');
  expect(document.getElementById('portfolioDisplay').innerHTML).toContain('13.33%');
});
