var ctx = document.querySelector('#myChart');

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [...Array(6).keys()],
        datasets: [{
            label: 'Datos',
            data: [
                {
                    x: 0,
                    y: 5
                },
                {
                    x: 1,
                    y: 26
                },
                {
                    x: 2,
                    y: 10
                },
                {
                    x: 3,
                    y: 2
                },
                {
                    x: 4,
                    y: 7
                },
                {
                    x: 5,
                    y: 5
                } 
            ],
            lineTension: 0.2,
            pointStyle: 'circle',
            pointRadius: 5,
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            borderColor: '#ffdde1',
            borderWidth: 3,
            pointHoverBorderWidth: 8,
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
            xAxes: [{
                ticks: {
                    callback: function(value, index, values) {
                        return index === 0 || index === values.length - 1 ? value : '';
                    }
                }
            }]
        }
    }
});