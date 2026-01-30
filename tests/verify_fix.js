const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const http = require('http');

// Test 1: Crypto
console.log('Testing Crypto State Generation...');
const state = crypto.randomBytes(32).toString('hex');
if (state.length === 64 && /^[0-9a-f]+$/.test(state)) {
  console.log('✅ Crypto State Generation Passed: ' + state);
} else {
  console.error('❌ Crypto State Generation Failed');
  process.exit(1);
}

// Test 2: Cookie Parser
console.log('Testing Cookie Parser...');
const app = express();
app.use(cookieParser());

app.get('/test-cookie', (req, res) => {
  if (req.cookies && req.cookies.test_cookie === 'test_value') {
    res.send('Cookie Parsed Successfully');
  } else {
    res.status(400).send('Cookie Not Found');
  }
});

const server = app.listen(0, () => {
  const port = server.address().port;
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/test-cookie',
    method: 'GET',
    headers: {
      'Cookie': 'test_cookie=test_value'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200 && data === 'Cookie Parsed Successfully') {
        console.log('✅ Cookie Parser Passed');
        server.close();
        process.exit(0);
      } else {
        console.error('❌ Cookie Parser Failed. Status: ' + res.statusCode + ', Data: ' + data);
        server.close();
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
    server.close();
    process.exit(1);
  });

  req.end();
});
