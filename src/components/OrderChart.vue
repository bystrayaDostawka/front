<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
    </div>
    <div class="relative" style="height: 300px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'OrderChart',
  props: {
    title: {
      type: String,
      default: 'Статистика заказов'
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.createChart();
    });
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  methods: {
    createChart() {
      if (!this.$refs.chartCanvas) return;

      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Создаем простые данные для демонстрации
      const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
      const data = [12, 19, 3, 5, 2, 3];

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Выполненные заказы',
            data: data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },

    updateChart() {
      if (!this.chart) return;

      // Если есть данные из API, используем их, иначе демо-данные
      if (this.data && this.data.length > 0) {
        const labels = this.data.map(item => {
          if (item.date) return this.formatDate(item.date);
          if (item.week) return `Неделя ${item.week}`;
          if (item.month) return this.formatMonth(item.month);
          if (item.year) return item.year;
          return '';
        });
        const values = this.data.map(item => parseInt(item.count) || 0);

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
      } else {
        // Демо-данные
        const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
        const data = [12, 19, 3, 5, 2, 3];

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
      }

      this.chart.update();
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit'
        });
      } catch {
        return dateString;
      }
    },

    formatMonth(monthString) {
      try {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('ru-RU', {
          month: 'long',
          year: 'numeric'
        });
      } catch {
        return monthString;
      }
    }
  }
};
</script>
