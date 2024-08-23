document.getElementById('addUser').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
  
    if (!username || !email) {
      alert('Please fill out all fields');
      return;
    }
  
    // Send the new user data to the backend
    fetch('http://localhost:3000/users/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email }),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
      })
      .catch(error => console.error('Error adding user:', error));
  });
  