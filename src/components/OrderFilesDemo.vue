<template>
  <div class="order-files-demo p-6">
    <h2 class="text-2xl font-bold mb-4">Демонстрация OrderFiles</h2>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        ID заказа для тестирования
      </label>
      <input
        v-model="testOrderId"
        type="number"
        class="w-32 px-3 py-2 border border-gray-300 rounded-md"
        placeholder="1"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Роль пользователя
      </label>
      <select v-model="testUserRole" class="px-3 py-2 border border-gray-300 rounded-md">
        <option value="admin">Администратор</option>
        <option value="manager">Менеджер</option>
        <option value="bank">Банк</option>
        <option value="courier">Курьер</option>
      </select>
    </div>

    <div class="bg-gray-100 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Компонент OrderFiles</h3>
      <OrderFiles
        :order-id="testOrderId"
        :can-upload="testUserRole !== 'courier'"
        :current-user="{ id: 1, name: 'Тестовый пользователь', role: testUserRole }"
        @error="showError"
        @file-uploaded="onFileUploaded"
        @file-deleted="onFileDeleted"
      />
    </div>

    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>

    <div class="mt-4 text-sm text-gray-600">
      <h4 class="font-semibold">Возможности:</h4>
      <ul class="list-disc list-inside space-y-1">
        <li>Загрузка файлов (все роли кроме курьера)</li>
        <li>Просмотр списка файлов с информацией</li>
        <li>Скачивание файлов</li>
        <li>Удаление файлов (только загрузивший или админ)</li>
        <li>Поддержка различных типов файлов (PDF, документы, изображения, архивы)</li>
        <li>Валидация размера файла (до 10MB)</li>
      </ul>
    </div>
  </div>
</template>

<script>
import OrderFiles from './OrderFiles.vue';

export default {
  name: 'OrderFilesDemo',
  components: {
    OrderFiles
  },
  data() {
    return {
      testOrderId: 1,
      testUserRole: 'admin',
      errorMessage: ''
    };
  },
  methods: {
    showError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
    onFileUploaded(file) {
      console.log('Файл загружен:', file);
    },
    onFileDeleted(fileId) {
      console.log('Файл удален:', fileId);
    }
  }
};
</script>
