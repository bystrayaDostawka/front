<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
            <!-- Логотип и заголовок -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                    <i class="fas fa-truck text-white text-2xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Быстрая доставка</h1>
                <p class="text-gray-600">Панель администратора</p>
            </div>

            <form @submit.prevent="login" autocomplete="off" class="space-y-6">
                <!-- Переключатель ролей в одну строку -->
                <div class="bg-gray-100 rounded-lg p-1">
                    <div class="grid grid-cols-4 gap-1">
                        <button 
                            v-for="role in availableRoles" 
                            :key="role.value"
                            type="button"
                            @click="selectedRole = role.value"
                            :class="[
                                'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                                selectedRole === role.value 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                            ]"
                        >
                            {{ role.label }}
                        </button>
                    </div>
                </div>

                <!-- Поля ввода -->
                <div class="space-y-4">
                    <div>
                        <input 
                            v-model="email" 
                            type="email" 
                            placeholder="Email" 
                            required
                            class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            autofocus 
                        />
                    </div>

                    <div>
                        <input 
                            v-model="password" 
                            type="password" 
                            placeholder="Пароль" 
                            required
                            class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    
                    <!-- Поле для банковского ключа -->
                    <div v-if="selectedRole === 'bank'" class="animate-fadeIn">
                        <input 
                            v-model="bankAccessKey" 
                            type="text" 
                            placeholder="Ключ доступа" 
                            required
                            class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                        />
                    </div>
                </div>

                <!-- Кнопка входа -->
                <button 
                    type="submit" 
                    :disabled="loading"
                    class="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {{ loading ? 'Вход...' : 'Войти' }}
                </button>

                <!-- Сообщение об ошибке -->
                <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 animate-fadeIn">
                    <span class="text-red-700 text-sm">{{ error }}</span>
                </div>
            </form>

        </div>
    </div>
</template>

<script>
import api from '@/api/api';

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            bankAccessKey: '',
            selectedRole: 'admin',
            error: '',
            loading: false,
            availableRoles: [
                { value: 'admin', label: 'Админ' },
                { value: 'manager', label: 'Менеджер' },
                { value: 'bank', label: 'Банк' },
                { value: 'courier', label: 'Курьер' }
            ]
        };
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = '';
            try {
                const loginData = {
                    email: this.email,
                    password: this.password,
                };

                // Добавляем банковский ключ только для банковских пользователей
                if (this.selectedRole === 'bank') {
                    loginData.bank_access_key = this.bankAccessKey;
                }

                const res = await api.post('/login', loginData);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                this.$router.push('/');
            } catch (e) {
                this.error = e.response?.data?.message || 'Ошибка входа';
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
}

/* Дополнительные стили для переключателя ролей */
.grid button {
    position: relative;
    overflow: hidden;
}

.grid button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.grid button:hover::before {
    left: 100%;
}

/* Стили для полей ввода */
input:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Стили для кнопки */
button[type="submit"]:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

button[type="submit"]:active:not(:disabled) {
    transform: translateY(0);
}
</style>
