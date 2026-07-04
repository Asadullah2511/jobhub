const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'testuser',
            password: 'testpassword'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testLogin();
