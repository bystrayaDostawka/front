/**
 * Утилита для работы с OneSignal в браузере
 * Отправляет Player ID на сервер для сохранения в БД
 */

// Инициализация OneSignal после загрузки
if (window.OneSignalDeferred) {
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      // Получаем Player ID через OneSignal API
      const playerId = await OneSignal.getUserId();

      if (playerId) {
        console.log('📱 OneSignal Player ID:', playerId);
        await sendPlayerIdToServer(playerId);
      } else {
        console.log('⚠️ Player ID пока не доступен');
      }
    } catch (error) {
      console.error('❌ Ошибка получения Player ID:', error);
    }
  });
}

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

