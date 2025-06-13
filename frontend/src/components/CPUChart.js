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
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register chart components
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function CPUChart({datapoints, requestedInterval}) {
    console.log('Total data points:', datapoints.length);
    console.log('Requested interval:', requestedInterval);

    // Get CPU values from data
    const cpuValues = datapoints.map(point => point.Average);

    const minValue = Math.min(...cpuValues);
    const maxValue = Math.max(...cpuValues);

    // Calculate Y axis min value
    let yMin;
    if (minValue < 0.5) {
        yMin = 0;
    } else if (minValue >= 0.5 && minValue <= 1) {
        yMin = 0.5;
    } else {
        yMin = Math.floor(minValue * 2) / 2 - 0.5;
    }

    // Calculate Y axis max value
    let yMax;
    if (maxValue < 2) {
        yMax = Math.ceil(maxValue) + 1;
    } else if (maxValue < 10) {
        yMax = Math.ceil(maxValue) + 2;
    } else if (maxValue < 50) {
        yMax = Math.ceil(maxValue / 5) * 5 + 5;
    } else {
        yMax = Math.ceil(maxValue / 10) * 10 + 5;
    }

    // Get actual interval from the data
    let actualInterval = 300;
    if (datapoints.length > 1) {
        const t1 = new Date(datapoints[0].Timestamp).getTime();
        const t2 = new Date(datapoints[1].Timestamp).getTime();
        actualInterval = (t2 - t1) / 1000;
    }

    // Get start and end times
    const firstTime = new Date(datapoints[0].Timestamp);
    const lastTime = new Date(datapoints[datapoints.length - 1].Timestamp);

    // Function to round down time to clean interval
    const roundDownToInterval = (date, intervalSeconds) => {
        const d = new Date(date);
        if (intervalSeconds >= 3600) {
            // Round to hour
            d.setMinutes(0, 0, 0);
        } else if (intervalSeconds >= 60) {
            // Round to clean minutes
            const minutes = d.getMinutes();
            const intervalMinutes = intervalSeconds / 60;
            const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
            d.setMinutes(roundedMinutes, 0, 0);
        }
        return d;
    };

    // Function to round up time to clean interval
    const roundUpToInterval = (date, intervalSeconds) => {
        const d = new Date(date);
        if (intervalSeconds >= 3600) {
            // Round up to next hour
            d.setMinutes(0, 0, 0);
            if (date.getMinutes() > 0 || date.getSeconds() > 0) {
                d.setHours(d.getHours() + 1);
            }
        } else if (intervalSeconds >= 60) {
            // Round up to next clean minute
            const minutes = d.getMinutes();
            const intervalMinutes = intervalSeconds / 60;
            const roundedMinutes = Math.ceil(minutes / intervalMinutes) * intervalMinutes;
            d.setMinutes(roundedMinutes, 0, 0);
        }
        return d;
    };

    // Determine tick interval
    let tickInterval = requestedInterval;
    if (requestedInterval < 300) {
        tickInterval = 300; // 5 minutes minimum
    } else if (requestedInterval === 900) {
        tickInterval = 900; // 15 minutes
    } else if (requestedInterval === 1800) {
        tickInterval = 1800; // 30 minutes
    }

    // Calculate clean start and end times for axis
    const cleanStartTime = roundDownToInterval(firstTime, tickInterval);
    const cleanEndTime = roundUpToInterval(lastTime, tickInterval);

    // Calculate chart width based on data points
    const chartWidth = Math.max(1200, datapoints.length * 25);

    // Prepare data for chart
    const chartData = {
        datasets: [
            {
                label: 'CPU Utilization %',
                data: datapoints.map(point => ({
                    x: new Date(point.Timestamp),
                    y: point.Average
                })),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                clip: false // Don't clip points at edges
            }
        ]
    };

    // Set time unit and display format
    let timeUnit = 'minute';
    let stepSize = 5;
    let displayFormat = 'HH:mm';

    // Check requested interval and set display accordingly
    if (requestedInterval >= 86400) {
        // 1 day or more
        timeUnit = 'day';
        stepSize = Math.max(1, Math.round(requestedInterval / 86400));
        displayFormat = 'MMM d';
    } else if (requestedInterval >= 3600) {
        // 1 hour or more
        timeUnit = 'hour';
        stepSize = Math.max(1, Math.round(requestedInterval / 3600));
        displayFormat = 'h a';
    } else if (requestedInterval >= 60) {
        // Minutes based on interval
        timeUnit = 'minute';
        const intervalMinutes = requestedInterval / 60;

        if (intervalMinutes <= 5) {
            stepSize = 5;
        } else if (intervalMinutes <= 10) {
            stepSize = 10;
        } else if (intervalMinutes <= 15) {
            stepSize = 15;
        } else if (intervalMinutes <= 20) {
            stepSize = 20;
        } else if (intervalMinutes <= 30) {
            stepSize = 30;
        } else {
            stepSize = 60;
        }
        displayFormat = 'HH:mm';
    } else {
        // Less than 1 minute - show 5 min intervals
        timeUnit = 'minute';
        stepSize = 5;
        displayFormat = 'HH:mm';
    }

    // Chart configuration
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
                type: 'time',
                time: {
                    unit: timeUnit,
                    stepSize: stepSize,
                    displayFormats: {
                        minute: displayFormat,
                        hour: displayFormat,
                        day: displayFormat
                    },
                    round: false,
                    tooltipFormat: 'MMM d, h:mm a'
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: true
                },
                ticks: {
                    source: 'auto',
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 9
                    },
                    major: {
                        enabled: true
                    }
                },
                // Add padding to prevent clipping
                grace: '2%',
                min: cleanStartTime.getTime(),
                max: cleanEndTime.getTime()
            }
        }
    };

    return (
        <div style={{marginTop: '30px'}}>
            <div style={{overflowX: 'auto', overflowY: 'hidden', border: '1px solid #ddd', borderRadius: '4px'}}>
                <div style={{height: '400px', width: `${chartWidth}px`, padding: '10px'}}>
                    <Line data={chartData} options={options}/>
                </div>
            </div>
            <p style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                {datapoints.length} data points
            </p>
        </div>
    );
}

export default CPUChart;