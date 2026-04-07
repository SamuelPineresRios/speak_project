const fetch = require('node-fetch');

async function testTutor() {
  console.log('🧪 Testing Tutor Endpoint...\n');
  
  try {
    const url = 'http://localhost:3000/api/guides/guide-001/chat';
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': 'student-123'
    };
    const body = JSON.stringify({
      content: 'Hola, ¿qué es el Present Perfect y cuando se usa?'
    });
    
    console.log(`📍 POST ${url}`);
    console.log(`📦 Body:`, JSON.parse(body));
    console.log(`\n⏳ Esperando respuesta...\n`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });
    
    console.log(`📊 Status: ${response.status}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ SUCCESS!\n');
      console.log('User Message:');
      console.log(result.userMessage.content);
      console.log('\nAssistant Response:');
      console.log(result.assistantMessage.content);
    } else {
      console.log('\n❌ FAILED!\n');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('\n💥 Exception:', error.message);
  }
}

testTutor();
