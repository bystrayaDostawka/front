<template>
  <div class="order-files">
    <div class="files-header">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Информационная анкета
          <span v-if="files.length > 0" class="text-sm text-gray-500">
            ({{ files.length }} файлов)
          </span>
        </h3>
        <button
          v-if="files.length > 0"
          @click="downloadAllFiles"
          :disabled="downloadingAll"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!downloadingAll" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ downloadingAll ? 'Скачивание...' : 'Скачать все' }}
        </button>
      </div>
    </div>

    <!-- Загрузка файлов (только для не-курьеров) -->
    <div v-if="canUpload" class="upload-section mb-6">
      <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref="fileInput"
          type="file"
          multiple
          @change="handleFileUpload"
          class="hidden"
          :disabled="uploading"
        />
        <button
          @click="$refs.fileInput.click()"
          :disabled="uploading"
          class="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!uploading" class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else class="mx-auto h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            {{ uploading ? 'Загрузка файлов...' : 'Нажмите для загрузки файлов' }}
          </p>
          <p class="text-xs text-gray-500">
            Документы, изображения, PDF и другие файлы до 10MB
          </p>
        </button>
      </div>

      <!-- Индикатор прогресса загрузки -->
      <div v-if="uploading && uploadQueue.length > 0" class="mt-4 space-y-3">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-900">
              Загрузка файлов ({{ completedUploads }}/{{ totalUploads }})
            </span>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-blue-700">
                {{ Math.round(uploadProgress) }}%
              </span>
              <button
                @click="cancelUpload"
                class="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Отменить
              </button>
            </div>
          </div>
          <div class="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Список загружаемых файлов -->
        <div class="space-y-2">
          <div
            v-for="(uploadItem, index) in uploadQueue"
            :key="index"
            class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ uploadItem.file.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(uploadItem.file.size) }}
              </p>
            </div>
            <div class="flex items-center ml-3">
              <!-- Прогресс отдельного файла -->
              <div v-if="!uploadItem.completed && !uploadItem.error" class="w-16 bg-gray-200 rounded-full h-1.5 mr-3">
                <div 
                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: uploadItem.progress + '%' }"
                ></div>
              </div>
              <!-- Статус -->
              <div v-if="uploadItem.uploading" class="text-xs text-blue-600 font-medium">
                {{ uploadItem.progress }}%
              </div>
              <div v-else-if="uploadItem.completed" class="text-xs text-green-600 font-medium">
                ✓ Загружен
              </div>
              <div v-else-if="uploadItem.error" class="text-xs text-red-600 font-medium">
                {{ uploadCancelled ? '✗ Отменено' : '✗ Ошибка' }}
              </div>
              <div v-else class="text-xs text-gray-500">
                В очереди
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список файлов -->
    <div v-if="files.length > 0" class="files-list space-y-2">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ file.file_name }}
            </p>
            <div class="flex items-center space-x-3 text-xs text-gray-500 mt-1">
              <span>{{ file.formatted_size }}</span>
              <span>{{ file.file_type }}</span>
              <span>{{ formatDate(file.created_at) }}</span>
              <span>{{ file.uploaded_by.name }}</span>
            </div>
          </div>

          <!-- Действия с файлом -->
          <div class="flex items-center space-x-1 ml-3">
            <!-- Скачивание -->
            <button
              @click="downloadFile(file)"
              class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Скачать файл"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            <!-- Удаление (только для загрузившего или админа) -->
            <button
              v-if="canDeleteFile(file)"
              @click="deleteFile(file.id)"
              class="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Удалить файл"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="empty-state text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-2 text-sm text-gray-500">
        Файлы не загружены
      </p>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading && files.length === 0" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-600">Загрузка...</p>
    </div>
  </div>
</template>

<script>
import OrderFilesController from '../api/OrderFilesController.js';

export default {
  name: 'OrderFiles',
  props: {
    orderId: {
      type: [String, Number],
      required: true
    },
    canUpload: {
      type: Boolean,
      default: false
    },
    currentUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      files: [],
      loading: false,
      pendingFiles: [],
      downloadingAll: false,
      uploading: false,
      uploadQueue: [],
      uploadProgress: 0,
      uploadCancelled: false
    };
  },
  computed: {
    completedUploads() {
      return this.uploadQueue.filter(item => item.completed).length;
    },
    failedUploads() {
      return this.uploadQueue.filter(item => item.error).length;
    },
    totalUploads() {
      return this.uploadQueue.length;
    }
  },
  async mounted() {
    console.log('OrderFiles mounted, orderId:', this.orderId);
    await this.loadFiles();
  },
  methods: {
    // ЗАГРУЗКА ФАЙЛОВ
    async loadFiles() {
      console.log('OrderFiles loadFiles start, loading:', this.loading, 'files.length:', this.files.length);
      this.loading = true;
      try {
        this.files = await OrderFilesController.getOrderFiles(this.orderId);
        console.log('OrderFiles loadFiles success, files:', this.files);
      } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        this.$emit('error', 'Не удалось загрузить файлы');
      } finally {
        this.loading = false;
        console.log('OrderFiles loadFiles end, loading:', this.loading, 'files.length:', this.files.length);
      }
    },

    // ОБРАБОТКА ЗАГРУЗКИ ФАЙЛОВ
    async handleFileUpload(event) {
      const files = Array.from(event.target.files);

      if (files.length === 0) return;

      // Валидация файлов
      const validFiles = files.filter(file => this.validateFile(file));

      if (validFiles.length === 0) return;

      // Подготавливаем очередь загрузки
      this.uploadQueue = validFiles.map(file => ({
        file: file,
        progress: 0,
        uploading: false,
        completed: false,
        error: false
      }));

      this.uploading = true;
      this.uploadProgress = 0;
      this.uploadCancelled = false;

      // Загружаем файлы с прогрессом
      for (let i = 0; i < this.uploadQueue.length; i++) {
        // Проверяем, не была ли отменена загрузка
        if (this.uploadCancelled) {
          break;
        }

        const uploadItem = this.uploadQueue[i];
        uploadItem.uploading = true;
        
        try {
          await this.uploadPhotoWithProgress(uploadItem, i);
          uploadItem.completed = true;
          uploadItem.uploading = false;
        } catch (error) {
          if (!this.uploadCancelled) {
            uploadItem.error = true;
            uploadItem.uploading = false;
            console.error('Ошибка загрузки файла:', error);
          }
        }
        
        // Обновляем общий прогресс
        this.updateOverallProgress();
      }

      // Завершаем загрузку
      this.uploading = false;
      
      // Показываем уведомления о результатах
      if (!this.uploadCancelled) {
        if (this.completedUploads > 0) {
          this.$emit('success', `Успешно загружено ${this.completedUploads} файлов`);
        }
        if (this.failedUploads > 0) {
          this.$emit('error', `Не удалось загрузить ${this.failedUploads} файлов`);
        }
      } else {
        this.$emit('info', 'Загрузка файлов отменена');
      }
      
      // Очищаем очередь через 3 секунды
      setTimeout(() => {
        this.uploadQueue = [];
        this.uploadProgress = 0;
      }, 3000);

      // Очищаем input
      event.target.value = '';
    },

    // ВАЛИДАЦИЯ ФАЙЛА
    validateFile(file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-rar-compressed',
        'application/x-7z-compressed'
      ];

      if (file.size > maxSize) {
        this.$emit('error', `Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        this.$emit('error', `Неподдерживаемый формат файла "${file.name}"`);
        return false;
      }

      return true;
    },

    // ЗАГРУЗКА ФАЙЛА (старый метод для совместимости)
    async uploadPhoto(file) {
      try {
        const newFile = await OrderFilesController.uploadFile(this.orderId, file);
        this.files.unshift(newFile);
        this.$emit('file-uploaded', newFile);
      } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        this.$emit('error', `Не удалось загрузить файл "${file.name}"`);
        throw error;
      }
    },

    // ЗАГРУЗКА ФАЙЛА С ПРОГРЕССОМ
    async uploadPhotoWithProgress(uploadItem, index) {
      try {
        const newFile = await OrderFilesController.uploadFile(
          this.orderId, 
          uploadItem.file,
          (progress) => {
            uploadItem.progress = progress;
            this.updateOverallProgress();
          }
        );
        
        this.files.unshift(newFile);
        this.$emit('file-uploaded', newFile);
      } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        this.$emit('error', `Не удалось загрузить файл "${uploadItem.file.name}"`);
        throw error;
      }
    },

    // ОБНОВЛЕНИЕ ОБЩЕГО ПРОГРЕССА
    updateOverallProgress() {
      if (this.uploadQueue.length === 0) {
        this.uploadProgress = 0;
        return;
      }

      const totalProgress = this.uploadQueue.reduce((sum, item) => {
        if (item.completed) return sum + 100;
        if (item.error) return sum + 0;
        return sum + item.progress;
      }, 0);

      this.uploadProgress = totalProgress / this.uploadQueue.length;
    },

    // ФОРМАТИРОВАНИЕ РАЗМЕРА ФАЙЛА
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // ОТМЕНА ЗАГРУЗКИ
    cancelUpload() {
      this.uploadCancelled = true;
      this.uploading = false;
      
      // Помечаем все незавершенные файлы как отмененные
      this.uploadQueue.forEach(item => {
        if (!item.completed && !item.error) {
          item.error = true;
          item.uploading = false;
        }
      });
      
      // Очищаем очередь через 2 секунды
      setTimeout(() => {
        this.uploadQueue = [];
        this.uploadProgress = 0;
        this.uploadCancelled = false;
      }, 2000);
    },

    // СКАЧИВАНИЕ ФАЙЛА
    async downloadFile(file) {
      try {
        const response = await OrderFilesController.downloadFile(this.orderId, file.id);

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.file_name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка скачивания файла:', error);
        this.$emit('error', 'Не удалось скачать файл');
      }
    },

    // СКАЧИВАНИЕ ВСЕХ ФАЙЛОВ В АРХИВЕ
    async downloadAllFiles() {
      this.downloadingAll = true;
      try {
        const response = await OrderFilesController.downloadAll(this.orderId);

        // Создаем ссылку для скачивания архива
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Получаем имя файла из заголовка Content-Disposition или используем дефолтное
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'files.zip';
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка скачивания архива:', error);
        this.$emit('error', 'Не удалось скачать архив файлов');
      } finally {
        this.downloadingAll = false;
      }
    },

    // УДАЛЕНИЕ ФАЙЛА
    async deleteFile(fileId) {
      try {
        await OrderFilesController.deleteFile(this.orderId, fileId);
        this.files = this.files.filter(file => file.id !== fileId);
        this.$emit('file-deleted', fileId);
      } catch (error) {
        console.error('Ошибка удаления файла:', error);
        this.$emit('error', 'Не удалось удалить файл');
      }
    },

    // ПРОВЕРКА ПРАВ НА УДАЛЕНИЕ
    canDeleteFile(file) {
      if (!this.canUpload) return false;
      if (this.currentUser.role === 'admin') return true;
      return file.uploaded_by.id === this.currentUser.id;
    },

    // ФОРМАТИРОВАНИЕ ДАТЫ
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.files-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  transition: box-shadow 0.2s ease;
}

.file-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-area {
  transition: border-color 0.2s ease;
}

.upload-area:hover {
  border-color: #9ca3af;
}

.empty-state {
  padding: 2rem 0;
}
</style>
