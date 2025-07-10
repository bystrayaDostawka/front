<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">
            <h2 class="text-2xl font-bold text-center mb-6 text-blue-700">Вход</h2>
            <form @submit.prevent="login" autocomplete="off">
                <div class="mb-4">
                    <input v-model="email" type="email" placeholder="Email" required
                        class="block w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autofocus />
                </div>
                <div class="mb-4">
                    <input v-model="password" type="password" placeholder="Пароль" required
                        class="block w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <button type="submit" :disabled="loading"
                    class="w-full py-2 mb-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-60">
                    Войти
                </button>
                <div v-if="error" class="text-red-600 text-center mt-3 animate-pulse">
                    {{ error }}
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
            error: '',
            loading: false,
        };
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = '';
            try {
                const res = await api.post('/login', {
                    email: this.email,
                    password: this.password,
                });
                localStorage.setItem('token', res.data.token);
                // Можно сохранить пользователя для Header, если нужно:
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
