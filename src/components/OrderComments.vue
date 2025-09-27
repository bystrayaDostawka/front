<template>
  <div class="order-comments">
    <div class="comments-header">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Комментарии к заказу
      </h3>
      <button
        @click="showAddForm = !showAddForm"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <i class="fas fa-plus mr-1"></i>
        Добавить комментарий
      </button>
    </div>

    <!-- Форма добавления комментария -->
    <div v-if="showAddForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <form @submit.prevent="addComment">
        <div class="mb-4">
          <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
            Комментарий
          </label>
          <textarea
            id="comment"
            v-model="newComment"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите комментарий..."
            required
          ></textarea>
        </div>
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="cancelAddComment"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Добавление...' : 'Добавить' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Список комментариев -->
    <div v-if="comments.length > 0" class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white border border-gray-200 rounded-lg p-4"
        :class="{ 'opacity-75': comment.is_completed }"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900">
                {{ comment.user.name }}
              </span>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(comment.user.role)">
                {{ getRoleLabel(comment.user.role) }}
              </span>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatDate(comment.created_at) }}
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Чекбокс выполнения -->
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="comment.is_completed"
                @change="toggleCommentStatus(comment)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="text-sm text-gray-600">
                {{ comment.is_completed ? 'Выполнено' : 'Не выполнено' }}
              </span>
            </label>

            <!-- Кнопка удаления -->
            <button
              @click="deleteComment(comment)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Удалить комментарий"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="text-gray-800 mb-2">
          {{ comment.comment }}
        </div>

        <div v-if="comment.is_completed && comment.completed_at" class="text-sm text-green-600">
          ✓ Выполнено {{ formatDate(comment.completed_at) }}
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="text-center py-8 text-gray-500">
      <i class="fas fa-comments mx-auto text-4xl text-gray-400 mb-4 block"></i>
      <p>Комментариев пока нет</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// Убираем импорт Heroicons, используем Font Awesome
import OrdersController from '../api/OrdersController'

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true
  }
})

const ordersApi = new OrdersController()

// Состояние компонента
const comments = ref([])
const newComment = ref('')
const showAddForm = ref(false)
const loading = ref(false)

// Загрузка комментариев
const loadComments = async () => {
  try {
    const response = await ordersApi.getOrderComments(props.orderId)
    comments.value = response.comments || []
  } catch (error) {
    console.error('Ошибка загрузки комментариев:', error)
  }
}

// Добавление комментария
const addComment = async () => {
  if (!newComment.value.trim()) return

  loading.value = true
  try {
    const response = await ordersApi.createOrderComment(props.orderId, {
      comment: newComment.value.trim()
    })
    
    comments.value.unshift(response.comment)
    newComment.value = ''
    showAddForm.value = false
  } catch (error) {
    console.error('Ошибка добавления комментария:', error)
  } finally {
    loading.value = false
  }
}

// Отмена добавления
const cancelAddComment = () => {
  newComment.value = ''
  showAddForm.value = false
}

// Переключение статуса комментария
const toggleCommentStatus = async (comment) => {
  try {
    const response = await ordersApi.updateOrderComment(props.orderId, comment.id, {
      is_completed: !comment.is_completed
    })
    
    // Обновляем комментарий в списке
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value[index] = response.comment
    }
  } catch (error) {
    console.error('Ошибка обновления комментария:', error)
  }
}

// Удаление комментария
const deleteComment = async (comment) => {
  if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return

  try {
    await ordersApi.deleteOrderComment(props.orderId, comment.id)
    comments.value = comments.value.filter(c => c.id !== comment.id)
  } catch (error) {
    console.error('Ошибка удаления комментария:', error)
  }
}

// Вспомогательные функции
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Админ',
    manager: 'Менеджер',
    bank: 'Банк',
    courier: 'Курьер'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    bank: 'bg-green-100 text-green-800',
    courier: 'bg-yellow-100 text-yellow-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.order-comments {
  @apply space-y-4;
}

.comments-header {
  @apply flex items-center justify-between;
}
</style>
