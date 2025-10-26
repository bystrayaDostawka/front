/**
 * Утилита для работы с OneSignal в браузере
 * Отправляет Player ID на сервер для сохранения в БД
 */

// Глобальная переменная для хранения функции показа уведомлений
let notificationCallback = null;

// Функция для сохранения уведомления в localStorage
function saveNotification(notification) {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      title: notification.title || 'Уведомление',
      message: notification.body || '',
      data: notification.data || {},
      read: false,
      created_at: new Date().toISOString()
    });

    // Оставляем только последние 50 уведомлений
    const limitedNotifications = notifications.slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(limitedNotifications));

    return limitedNotifications;
  } catch (error) {
    console.error('Ошибка сохранения уведомления:', error);
    return [];
  }
}

// Инициализация OneSignal после загрузки
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  console.log('🚀 OneSignal SDK загружен');

  // Обработчик входящих уведомлений
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('🔔 Уведомление кликнуто:', event);

    const notification = event.notification;

    // Сохраняем уведомление в localStorage
    saveNotification(notification);

    // Если есть callback для показа Vue уведомления, вызываем его
    if (notificationCallback) {
      notificationCallback({
        title: notification.title || 'Уведомление',
        message: notification.body || '',
        data: notification.data || {}
      });
    }
  });

  // Обработчик получения уведомления в фоне
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    console.log('📬 Получено уведомление (foreground):', event);

    const notification = event.notification;

    // Сохраняем уведомление в localStorage
    saveNotification(notification);
  });

  // Функция для получения и отправки Player ID
  async function getAndSendPlayerId() {
    try {
      console.log('🔍 Пытаемся получить Player ID...');

      // Получаем Player ID из PushSubscription
      const subscription = OneSignal.User?.PushSubscription;
      const playerId = subscription?.id;

      console.log('🆔 Player ID:', playerId);

      if (playerId) {
        console.log('📱 OneSignal Player ID получен:', playerId);
        await sendPlayerIdToServer(playerId);
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

// Функция для установки callback уведомлений
function setNotificationCallback(callback) {
  notificationCallback = callback;
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
export { sendPlayerIdToServer, showBrowserNotification, setNotificationCallback };

