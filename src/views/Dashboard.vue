<template>
    <div class="max-w-4xl mx-auto py-10">
        <h1 class="text-2xl font-bold mb-8">Дашборд</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Заявки</span>
                <span class="text-4xl font-bold text-blue-600">{{ stats.orders }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Курьеры</span>
                <span class="text-4xl font-bold text-green-600">{{ stats.couriers }}</span>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span class="text-gray-500 mb-2">Банки</span>
                <span class="text-4xl font-bold text-purple-600">{{ stats.banks }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/api/api';

export default {
    name: 'Dashboard',
    data() {
        return {
            stats: {
                orders: 0,
                couriers: 0,
                banks: 0,
            },
            loading: false,
            error: null,
        };
    },
    mounted() {
        this.fetchStats();
    },
    methods: {
        async fetchStats() {
            this.loading = true;
            this.error = null;
            try {
                const [ordersRes, usersRes, banksRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/users'),
                    api.get('/banks'),
                ]);

                this.stats.orders = Array.isArray(ordersRes.data) ? ordersRes.data.length : 0;
                this.stats.couriers = Array.isArray(usersRes.data)
                    ? usersRes.data.filter(u => u.role === 'courier').length
                    : 0;
                this.stats.banks = Array.isArray(banksRes.data) ? banksRes.data.length : 0;
            } catch (e) {
                this.error = 'Ошибка загрузки данных';
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
