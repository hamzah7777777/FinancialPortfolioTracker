const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  document.body.innerHTML = `
    <input id="username" value="testuser" />
    <input id="ticker" value="AAPL" />
    <input id="quantity" value="10" />
    <input id="purchasePrice" value="150" />
    <input id="purchaseDate" value="2024-08-01" />
    <button id="addStock">Add Stock</button>
  `;
  require('./add_stock');
});

test('should call fetch with correct parameters when all fields are filled', () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'Stock added to portfolio successfully!' }));

  document.getElementById('addStock').click();

  expect(fetch).toHaveBeenCalledWith('http://localhost:3000/portfolio/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'testuser',
      ticker: 'AAPL',
      quantity: '10',
      purchasePrice: '150',
      purchaseDate: '2024-08-01',
    }),
  });
});

test('should show an alert if fields are missing', () => {
  document.getElementById('ticker').value = '';
  const alertMock = jest.spyOn(window, 'alert').mockImplementation();

  document.getElementById('addStock').click();

  expect(alertMock).toHaveBeenCalledWith('Please fill out all fields');
  alertMock.mockRestore();
});
