var graficas = [
    document.querySelector('#myChart'),
    document.querySelector('#myChart2'),
    document.querySelector('#myChart3')
]
var myChart;
var myChart2;
var myChart3;

function createNewChart(labels, sensor, freq, status){
    let contenedor = 0;
    if(myChart) myChart.destroy();
    if(sensor){
        myChart = new Chart(graficas[contenedor++], {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sensor',
                    data: sensor,
                    responsive: true,
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
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
    if(myChart2) myChart2.destroy();
    if(freq){
        myChart2 = new Chart(graficas[contenedor++], {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frecuencia',
                    data: freq,
                    responsive: true,
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
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
    if(myChart3) myChart3.destroy();
    if(status){
        myChart3 = new Chart(graficas[contenedor++], {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Status',
                    data: status,
                    responsive: true,
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
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
}
/* var myChart2 = new Chart(ctx2, { 
    type: 'line',
    data: {
        labels: [...Array(9).keys()],
        datasets: [{
            label: 'Frecuencia',
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
                },
                {
                    x: 6,
                    y: 10
                },
                {
                    x: 7,
                    y: 10
                },
                {
                    x: 8,
                    y: 10
                }
            ],
            responsive: true,
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
                    beginAtZero: true
                }
            }]
        }
    }
});

var myChart3 = new Chart(ctx3, { 
    type: 'bar',
    data: {
        labels: [...Array(9).keys()],
        datasets: [{
            label: 'Status',
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
                },
                {
                    x: 6,
                    y: 10
                },
                {
                    x: 7,
                    y: 10
                },
                {
                    x: 8,
                    y: 10
                }
            ],
            responsive: true,
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
                    beginAtZero: true
                }
            }]
        }
    }
});
var myChart = new Chart(ctx, { 
    type: 'line',
    data: {
        labels: [...Array(9).keys()],
        datasets: [{
            label: 'Sensor',
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
                },
                {
                    x: 6,
                    y: 10
                },
                {
                    x: 7,
                    y: 10
                },
                {
                    x: 8,
                    y: 10
                }
            ],
            responsive: true,
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
                    beginAtZero: true
                }
            }]
        }
    }
}); */