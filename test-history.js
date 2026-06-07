const WebSocket = require('ws');

async function testHistoryAPI() {
  console.log('🧪 Тестируем API истории игр...');
  
  // Сначала получаем пользователя через WebSocket
  const ws = new WebSocket('ws://localhost:4001');
  
  return new Promise((resolve) => {
    ws.on('open', () => {
      console.log('✅ WebSocket соединение установлено');
      
      // Авторизация в DEV режиме
      ws.send(JSON.stringify({
        type: 'auth',
        initData: ''
      }));
    });

    ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'auth-success') {
        console.log('✅ Авторизация успешна, telegramId:', message.user.telegramId);
        
        // Тестируем API истории игр
        try {
          const response = await fetch(`http://localhost:3000/api/profile/games?telegram_id=${message.user.telegramId}`);
          console.log('📊 API ответ:', response.status, response.statusText);
          
          if (response.ok) {
            const history = await response.json();
            console.log('📈 История игр:', history.length, 'записей');
            console.log('📋 Первые 3 записи:', history.slice(0, 3));
          } else {
            const errorText = await response.text();
            console.error('❌ Ошибка API:', errorText);
          }
        } catch (error) {
          console.error('❌ Ошибка запроса:', error.message);
        }
        
        ws.close();
        resolve();
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket ошибка:', error.message);
      resolve();
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket соединение закрыто');
    });
  });
}

// Запускаем тест
testHistoryAPI().then(() => {
  console.log('🏁 Тест завершен');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Ошибка теста:', error);
  process.exit(1);
}); 