import './App.css';
import {useState} from 'react';
import axios from 'axios';
import CPUChart from './components/CPUChart';

function App() {
    const [timePeriod, setTimePeriod] = useState('Last Day');
    const [period, setPeriod] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    const getTimeRange = (timePeriod) => {
        const now = new Date();
        const endTime = new Date(now);
        let startTime = new Date(now);

        switch (timePeriod) {
            case 'Last 1 hour':
                startTime.setHours(now.getHours() - 1);
                break;
            case 'Last 3 hours':
                startTime.setHours(now.getHours() - 3);
                break;
            case 'Last 12 hours':
                startTime.setHours(now.getHours() - 12);
                break;
            case 'Last Day':
            case 'Last 24 hours':
                startTime.setDate(now.getDate() - 1);
                break;
            case 'Last 3 days':
                startTime.setDate(now.getDate() - 3);
                break;
            case 'Last 7 days':
                startTime.setDate(now.getDate() - 7);
                break;
            default:
                startTime.setHours(now.getHours() - 1);
        }

        return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted!');

        setLoading(true);
        setError('');
        setData(null);

        try {
            const timeRange = getTimeRange(timePeriod);

            const params = new URLSearchParams({
                ip: ipAddress,
                startTime: timeRange.startTime,
                endTime: timeRange.endTime,
                interval: period
            });

            console.log('API URL:', `http://localhost:3001/api/metrics?${params}`);

            const response = await axios.get(`http://localhost:3001/api/metrics?${params}`);

            console.log('API Response:', response.data);

            if (response.data.success) {
                setData(response.data);
            } else {
                setError(response.data.error || 'Failed to fetch metrics');
            }

        } catch (err) {
            console.error('Error:', err);
            setError('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>AWS Instance CPU Monitor</h1>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
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

                    <div className="form-row">
                        <label>Period:</label>
                        <input
                            type="text"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>

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

            {loading && <p>Fetching CPU metrics...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {data && data.datapoints && data.datapoints.length > 0 && (
                <CPUChart datapoints={data.datapoints} instanceId={data.instanceId}/>
            )}
        </div>
    );
}

export default App;