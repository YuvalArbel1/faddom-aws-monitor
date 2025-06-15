import './App.css';
import {useState} from 'react';
import axios from 'axios';
import CPUChart from './components/CPUChart';

function App() {
    // State for form inputs
    const [timePeriod, setTimePeriod] = useState('Last Day');
    const [period, setPeriod] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [data, setData] = useState(null);
    const [submittedInterval, setSubmittedInterval] = useState(null);

    // Get start and end time for the selected period
    const getTimeRange = (timePeriod) => {
        const now = new Date();
        const endTime = new Date(now);
        let startTime = new Date(now);

        // Calculate start time
        if (timePeriod === 'Last 1 hour') {
            startTime.setHours(now.getHours() - 1);
        } else if (timePeriod === 'Last 3 hours') {
            startTime.setHours(now.getHours() - 3);
        } else if (timePeriod === 'Last 12 hours') {
            startTime.setHours(now.getHours() - 12);
        } else if (timePeriod === 'Last Day') {
            startTime.setDate(now.getDate() - 1);
        } else if (timePeriod === 'Last 3 days') {
            startTime.setDate(now.getDate() - 3);
        } else if (timePeriod === 'Last 7 days') {
            startTime.setDate(now.getDate() - 7);
        }

        return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        };
    };

    // Check if interval is valid
    const validateInterval = (timePeriod, interval) => {
        // Check if interval is a valid number
        if (interval <= 0 || isNaN(interval)) {
            return {error: 'Please enter a valid interval (minimum 60 seconds)'};
        }

        // Check if interval is multiple of 60
        if (interval % 60 !== 0) {
            return {error: 'Interval must be a multiple of 60'};
        }

        // Max allowed interval for each time period
        const maxIntervals = {
            'Last 1 hour': 3600,
            'Last 3 hours': 10800,
            'Last 12 hours': 43200,
            'Last Day': 86400,
            'Last 3 days': 259200,
            'Last 7 days': 604800
        };

        const maxInterval = maxIntervals[timePeriod];
        if (interval > maxInterval) {
            return {error: `Interval cannot be larger than the time period (max: ${maxInterval} seconds)`};
        }

        // Calculate number of data points
        const dataPoints = maxInterval / interval;

        // AWS allows max 1440 data points
        if (dataPoints > 1440) {
            return {error: `Too many data points (${Math.floor(dataPoints)}). Maximum is 1440. Try increasing the interval.`};
        }

        // Warning for AWS behavior
        let warning = null;

        if (interval < 300) {
            warning = "Note: Basic monitoring collects data every 5 minutes. AWS will return data at 300 second intervals.";
        }

        return {error: null, warning: warning};
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setWarning('');
        setData(null);

        // Check if all fields are filled
        if (!ipAddress || !period) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        // Check IP address format
        const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (!ipPattern.test(ipAddress)) {
            setError('Please enter a valid IP address');
            setLoading(false);
            return;
        }

        // Validate interval
        const validation = validateInterval(timePeriod, parseInt(period));
        if (validation.error) {
            setError(validation.error);
            setLoading(false);
            return;
        }

        // Show warning if needed
        if (validation.warning) {
            setWarning(validation.warning);
        }

        try {
            // Get time range
            const timeRange = getTimeRange(timePeriod);

            // Create URL parameters
            const params = new URLSearchParams({
                ip: ipAddress,
                startTime: timeRange.startTime,
                endTime: timeRange.endTime,
                interval: period
            });

            // Call the API
            const response = await axios.get(`http://localhost:3001/api/metrics?${params}`);

            if (response.data.success) {
                setData(response.data);
                setSubmittedInterval(parseInt(period));
            } else {
                setError(response.data.error || 'Failed to fetch metrics');
            }

        } catch (err) {
            console.error('Error:', err);

            // Handle different error types
            if (err.response && err.response.status === 404) {
                setError('Could not find AWS instance with this IP address');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Is it running?');
            } else {
                setError('Something went wrong!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>AWS Instance CPU Monitor</h1>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Time period selection */}
                    <div className="form-row">
                        <label>Time period:</label>
                        <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                            <option>Last 1 hour</option>
                            <option>Last 3 hours</option>
                            <option>Last 12 hours</option>
                            <option>Last Day</option>
                            <option>Last 3 days</option>
                            <option>Last 7 days</option>
                        </select>
                    </div>

                    {/* Period input */}
                    <div className="form-row">
                        <label>Period:</label>
                        <input
                            type="text"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            placeholder="seconds (e.g. 300)"
                        />
                    </div>

                    {/* IP address input */}
                    <div className="form-row">
                        <label>IP Address:</label>
                        <input
                            type="text"
                            placeholder="Enter IP Address"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Loading...' : 'Load'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Status messages and chart */}
            {loading && <p>Fetching CPU metrics...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {warning && <p style={{color: 'orange'}}>{warning}</p>}
            {data && data.datapoints && data.datapoints.length > 0 && (
                <CPUChart
                    datapoints={data.datapoints}
                    instanceId={data.instanceId}
                    requestedInterval={submittedInterval}
                />
            )}
        </div>
    );
}

export default App;