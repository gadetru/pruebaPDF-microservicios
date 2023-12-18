// chartScript.js


// Esta función se ejecutará en el navegador
window.createChart = function(chartData) {
  // Configuración de la gráfica

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: false,
    },
    plugins: {
      colors: {
        forceOverride: true
      }
    }
  };

  // Crear una instancia de Chart.js
  const chartContainer = document.getElementById('myChartContainer');
  const ctx = chartContainer.getContext('2d');

  // Utilizamos Object.keys y Object.values para obtener dinámicamente las etiquetas y los datos
  const labels = Object.keys(chartData.financials.clients);
  const data = Object.values(chartData.financials.clients);

  const chartConfig = {
    labels: labels,
    datasets: [{
      label: 'Financials',
      data: data,
      backgroundColor: generateRandomColors(labels.length), // Utilizamos una función para generar colores aleatorios
      hoverOffset: 4
    }]
  };

  return new Chart(ctx, {
    type: 'doughnut',
    data: chartConfig,
    options: chartOptions
  });
}

// Función para generar colores aleatorios (puedes personalizar según tus necesidades)
function generateRandomColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    colors.push(color);
  }
  return colors;
}

