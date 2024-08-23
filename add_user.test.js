const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  document.body.innerHTML = `
    <input id="username" value="testuser" />
    <input id="email" value="testuser@example.com" />
    <button id="addUser">Add User</button>
  `;
  require('./add_user');
});

test('should call fetch with correct parameters when all fields are filled', () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'User added successfully!' }));

  document.getElementById('addUser').click();

  expect(fetch).toHaveBeenCalledWith('http://localhost:3000/users/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: 'testuser', email: 'testuser@example.com' }),
  });
});

test('should show an alert if fields are missing', () => {
  document.getElementById('username').value = '';
  const alertMock = jest.spyOn(window, 'alert').mockImplementation();

  document.getElementById('addUser').click();

  expect(alertMock).toHaveBeenCalledWith('Please fill out all fields');
  alertMock.mockRestore();
});
