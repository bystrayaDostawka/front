/**
 * Утилита для работы с OneSignal в браузере
 * Отправляет Player ID на сервер для сохранения в БД
 */

// Инициализация OneSignal после загрузки
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  console.log('🚀 OneSignal SDK загружен');

  // Функция для получения и отправки Player ID
  async function getAndSendPlayerId() {
    try {
      console.log('🔍 Пытаемся получить Player ID...');

      // Ждем пока OneSignal полностью инициализируется
      await OneSignal.Session.getCurrentUser();

      // Получаем Player ID через User API
      const user = OneSignal.User.primary;
      console.log('👤 User:', user);

      if (user && user.id) {
        console.log('📱 OneSignal Player ID получен:', user.id);
        await sendPlayerIdToServer(user.id);
      } else {
        console.log('⚠️ Player ID не доступен, повтор через 3 секунды...');
        setTimeout(getAndSendPlayerId, 3000);
      }
    } catch (error) {
      console.error('❌ Ошибка получения Player ID:', error);
    }
  }

  // Ждем инициализации и пытаемся получить Player ID
  setTimeout(() => {
    getAndSendPlayerId();
  }, 3000);
});

/**
 * Отправка Player ID на сервер
 */
async function sendPlayerIdToServer(playerId) {
  try {
    const token = localStorage.getItem('token'); // Получаем токен из localStorage

    if (!token) {
      console.log('⚠️ Токен не найден, пропускаем отправку Player ID');
      return;
    }

    const response = await fetch('/api/mobile/push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ player_id: playerId }),
    });

    if (response.ok) {
      console.log('✅ Player ID успешно отправлен на сервер');
    } else {
      console.error('❌ Ошибка отправки Player ID:', response.status);
    }
  } catch (error) {
    console.error('❌ Ошибка отправки Player ID на сервер:', error);
  }
}

/**
 * Показать локальное уведомление в браузере
 */
function showBrowserNotification(title, message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/logo.png',
      badge: '/logo.png',
    });
  }
}

// Экспортируем функции для использования в компонентах
export { sendPlayerIdToServer, showBrowserNotification };

