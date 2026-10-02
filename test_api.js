const http = require('http');

const data = JSON.stringify({
  organizationName: 'Test',
  organizationCode: 'TST',
  email: 'test@test.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
