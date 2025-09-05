<template>
  <div class="order-photos">
    <div class="photos-header">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Фотографии посылки
        <span v-if="photos.length > 0" class="text-sm text-gray-500">
          ({{ photos.length }})
        </span>
      </h3>
    </div>

    <!-- Загрузка фотографий (только для курьеров) -->
    <div v-if="canUpload" class="upload-section mb-6">
      <div class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileUpload"
          class="hidden"
        />
        <button
          @click="$refs.fileInput.click()"
          class="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            Нажмите для загрузки фотографий
          </p>
          <p class="text-xs text-gray-500">
            PNG, JPG, JPEG до 5MB
          </p>
        </button>
      </div>
    </div>

    <!-- Список фотографий -->
    <div v-if="photos.length > 0" class="photos-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="photo-item relative group"
      >
        <img
          :src="photo.url"
          :alt="`Фотография заказа ${orderId}`"
          class="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="openModal(photo)"
        />

        <!-- Кнопка удаления (только для курьеров) -->
        <button
          v-if="canUpload"
          @click="deletePhoto(photo.id)"
          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Дата загрузки -->
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {{ formatDate(photo.created_at) }}
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="empty-state text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-2 text-sm text-gray-500">
        Фотографии не загружены
      </p>
    </div>

    <!-- Модальное окно для просмотра -->
    <div
      v-if="modalPhoto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div class="max-w-4xl max-h-full p-4" @click.stop>
        <img
          :src="modalPhoto.url"
          :alt="`Фотография заказа ${orderId}`"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <button
          @click="closeModal"
          class="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-600">Загрузка...</p>
    </div>
  </div>
</template>

<script>
import OrderPhotosController from '../api/OrderPhotosController.js';

export default {
  name: 'OrderPhotos',
  props: {
    orderId: {
      type: [String, Number],
      required: true
    },
    canUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      photos: [],
      loading: false,
      modalPhoto: null
    };
  },
  async mounted() {
    await this.loadPhotos();
  },
  methods: {
    async loadPhotos() {
      this.loading = true;
      try {
        this.photos = await OrderPhotosController.getOrderPhotos(this.orderId);
      } catch (error) {
        console.error('Ошибка загрузки фотографий:', error);
        this.$emit('error', 'Не удалось загрузить фотографии');
      } finally {
        this.loading = false;
      }
    },

    async handleFileUpload(event) {
      const files = Array.from(event.target.files);

      for (const file of files) {
        if (this.validateFile(file)) {
          await this.uploadPhoto(file);
        }
      }

      // Очищаем input
      event.target.value = '';
    },

    validateFile(file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (file.size > maxSize) {
        this.$emit('error', 'Файл слишком большой. Максимальный размер: 5MB');
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        this.$emit('error', 'Неподдерживаемый формат файла. Разрешены: JPEG, PNG, JPG');
        return false;
      }

      return true;
    },

    async uploadPhoto(file) {
      try {
        const newPhoto = await OrderPhotosController.uploadPhoto(this.orderId, file);
        this.photos.unshift(newPhoto);
        this.$emit('photo-uploaded', newPhoto);
      } catch (error) {
        console.error('Ошибка загрузки фотографии:', error);
        this.$emit('error', 'Не удалось загрузить фотографию');
      }
    },

    async deletePhoto(photoId) {
      if (!confirm('Удалить фотографию?')) {
        return;
      }

      try {
        await OrderPhotosController.deletePhoto(this.orderId, photoId);
        this.photos = this.photos.filter(photo => photo.id !== photoId);
        this.$emit('photo-deleted', photoId);
      } catch (error) {
        console.error('Ошибка удаления фотографии:', error);
        this.$emit('error', 'Не удалось удалить фотографию');
      }
    },

    openModal(photo) {
      this.modalPhoto = photo;
    },

    closeModal() {
      this.modalPhoto = null;
    },

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
.photos-grid {
  display: grid;
  gap: 1rem;
}

.photo-item {
  position: relative;
}

.upload-area {
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #9ca3af;
}

.empty-state {
  padding: 2rem 0;
}

.modal-backdrop {
  backdrop-filter: blur(2px);
}
</style>
