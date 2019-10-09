var ctx = document.querySelector('#myChart');

function createNewChart(labels, data){
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Datos',
                data: data,
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

var myChart = new Chart(ctx, { 
    type: 'line',
    data: {
        labels: [...Array(9).keys()],
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