<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Статистика по курьерам</h3>
    </div>
    <div class="relative" style="height: 400px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'CourierChart',
  props: {
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

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Курьер 1',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: 'rgb(59, 130, 246)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1
            },
            {
              label: 'Курьер 2',
              data: [8, 15, 7, 12, 9, 6],
              backgroundColor: 'rgb(16, 185, 129)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
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
        // Получаем уникальные даты из всех данных курьеров
        const allDates = new Set();
        this.data.forEach(courierData => {
          if (courierData.data && Array.isArray(courierData.data)) {
            courierData.data.forEach(item => {
              if (item.date) allDates.add(item.date);
              if (item.week) allDates.add(`week_${item.week}`);
              if (item.month) allDates.add(`month_${item.month}`);
              if (item.year) allDates.add(`year_${item.year}`);
            });
          }
        });

        const sortedDates = Array.from(allDates).sort();

        // Создаем датасеты для каждого курьера
        const datasets = this.data.map((courierData, index) => {
          const colors = [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(34, 197, 94)'
          ];

          const color = colors[index % colors.length];

          return {
            label: courierData.courier?.name || `Курьер ${index + 1}`,
            data: sortedDates.map(date => {
              const courierItem = courierData.data?.find(item => {
                if (item.date) return item.date === date;
                if (item.week) return `week_${item.week}` === date;
                if (item.month) return `month_${item.month}` === date;
                if (item.year) return `year_${item.year}` === date;
                return false;
              });
              return courierItem ? (parseInt(courierItem.count) || 0) : 0;
            }),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1
          };
        });

        // Форматируем метки
        const labels = sortedDates.map(date => {
          if (date.startsWith('week_')) {
            return `Неделя ${date.replace('week_', '')}`;
          }
          if (date.startsWith('month_')) {
            return this.formatMonth(date.replace('month_', ''));
          }
          if (date.startsWith('year_')) {
            return date.replace('year_', '');
          }
          return this.formatDate(date);
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets;
      } else {
        // Демо-данные
        const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
        const datasets = [
          {
            label: 'Курьер 1',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgb(59, 130, 246)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Курьер 2',
            data: [8, 15, 7, 12, 9, 6],
            backgroundColor: 'rgb(16, 185, 129)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1
          }
        ];

        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets;
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
