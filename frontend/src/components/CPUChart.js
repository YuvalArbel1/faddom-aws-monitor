import React from 'react';
import {Line} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function CPUChart({datapoints, instanceId}) {
    const cpuValues = datapoints.map(point => point.Average);

    const minValue = Math.min(...cpuValues);
    const maxValue = Math.max(...cpuValues);

    const yMin = Math.floor(minValue);
    const yMax = Math.ceil(maxValue) + 0.5;

    console.log('CPU values range:', minValue, '-', maxValue);
    console.log('Y axis range:', yMin, '-', yMax);

    const chartData = {
        labels: datapoints.map(point => {
            const date = new Date(point.Timestamp);
            const hours = date.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            return `${hour12}${ampm}`;
        }),
        datasets: [
            {
                label: 'Metric Data',
                data: cpuValues,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 15,
                    padding: 20,
                    usePointStyle: false,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'AWS Instance CPU usage',
                align: 'start',
                font: {
                    size: 14,
                    weight: 'normal'
                },
                padding: {
                    bottom: 20
                }
            }
        },
        scales: {
            y: {
                min: yMin,
                max: yMax,
                title: {
                    display: true,
                    text: 'Percentage',
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: true
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    stepSize: 0.5
                }
            },
            x: {
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: true
                },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 15,
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    return (
        <div style={{height: '300px', marginTop: '30px', width: '100%'}}>
            <Line data={chartData} options={options}/>
        </div>
    );
}

export default CPUChart;