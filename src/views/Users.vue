<template>
    <div class="max-w-6xl mx-auto py-10">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">Пользователи</h1>
            <button @click="showCreate = true"
                class="bg-blue-600 text-white font-semibold px-5 py-2 rounded hover:bg-blue-700 transition">
                + Новый пользователь
            </button>
        </div>

        <div v-if="loading" class="text-gray-500 py-12 text-center">Загрузка...</div>
        <div v-else>
            <table class="min-w-full bg-white shadow rounded-xl overflow-hidden">
                <thead>
                    <tr class="bg-gray-100 text-gray-600 uppercase ">
                        <th class="p-3 text-left">ID</th>
                        <th class="p-3 text-left">Имя</th>
                        <th class="p-3 text-left">Email</th>
                        <th class="p-3 text-left">Телефон</th>
                        <th class="p-3 text-left">Роль</th>
                        <th class="p-3 text-left">Банк</th>
                        <th class="p-3 text-left">Статус</th>
                        <th class="p-3 text-left">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id" class="border-b last:border-b-0 hover:bg-blue-50">
                        <td class="p-3">{{ user.id }}</td>
                        <td class="p-3">{{ user.name }}</td>
                        <td class="p-3">{{ user.email }}</td>
                        <td class="p-3">{{ user.phone || '-' }}</td>
                        <td class="p-3">
                            <span class="px-2 py-1 rounded text-xs font-semibold" :class="{
                                'bg-blue-100 text-blue-700': user.role === 'admin',
                                'bg-green-100 text-green-700': user.role === 'courier',
                                'bg-yellow-100 text-yellow-800': user.role === 'manager',
                                'bg-purple-100 text-purple-700': user.role === 'bank'
                            }">
                                {{ roles[user.role] || user.role }}
                            </span>
                        </td>
                        <td class="p-3">{{ user.bank?.name || '-' }}</td>
                        <td class="p-3">
                            <span :class="user.is_active
                                ? 'bg-green-200 text-green-700'
                                : 'bg-red-100 text-red-600'
                                " class="px-2 py-1 rounded text-xs font-semibold">
                                {{ user.is_active ? 'Активен' : 'Отключен' }}
                            </span>
                        </td>
                        <td class="p-3 flex gap-2">
                            <button @click="editUser(user)"
                                class="bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-xs">✎</button>
                            <button @click="deleteUser(user)"
                                class="bg-red-100 hover:bg-red-200 rounded px-3 py-1 text-xs text-red-700">✕</button>
                        </td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="8" class="p-6 text-center text-gray-400">Нет пользователей</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<script>
import api from '@/api/api';

export default {
    name: 'Users',
    data() {
        return {
            users: [],
            loading: false,
            error: null,
            showCreate: false,
            roles: {
                admin: 'Админ',
                manager: 'Менеджер',
                courier: 'Курьер',
                bank: 'Банк',
            }
        }
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            this.loading = true;
            this.error = null;
            try {
                const res = await api.get('/users?with[]=bank'); 
                this.users = res.data;
            } catch (e) {
                this.error = 'Ошибка загрузки пользователей';
            } finally {
                this.loading = false;
            }
        },
        editUser(user) {
            // Здесь откроется модалка/форма редактирования
            alert('Открыть форму редактирования пользователя (реализуй по своему усмотрению)');
        },
        async deleteUser(user) {
            if (!confirm(`Удалить пользователя "${user.name}"?`)) return;
            try {
                await api.delete(`/users/${user.id}`);
                this.fetchUsers();
            } catch (e) {
                alert('Ошибка при удалении');
            }
        }
    }
}
</script>
