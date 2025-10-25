/**
 * Утилита для работы с OneSignal в браузере
 * Отправляет Player ID на сервер для сохранения в БД
 */

// Инициализация OneSignal после загрузки
if (window.OneSignalDeferred) {
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      // Ждем полной инициализации OneSignal
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Получаем Player ID
      const subscription = OneSignal.User.pushSubscription;
      const playerId = subscription?.id;

      if (playerId) {
        console.log('📱 OneSignal Player ID:', playerId);

        // Отправляем Player ID на сервер
        await sendPlayerIdToServer(playerId);
      } else {
        console.log('⚠️ Player ID пока не доступен, OneSignal еще инициализируется');

        // Ждем появления Player ID через observer
        OneSignal.User.pushSubscription.addEventListener('change', async () => {
          const newPlayerId = OneSignal.User.pushSubscription.id;
          if (newPlayerId) {
            console.log('📱 OneSignal Player ID получен:', newPlayerId);
            await sendPlayerIdToServer(newPlayerId);
          }
        });
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

