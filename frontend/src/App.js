import './App.css';

function App() {
    return (
        <div className="App">
            <h1>AWS Instance CPU Monitor</h1>

            <div className="form-container">
                <form>
                    <div className="form-row">
                        <label>Time period:</label>
                        <select>
                            <option>Last Day</option>
                            <option>Last 1 hour</option>
                            <option>Last 3 hours</option>
                            <option>Last 12 hours</option>
                            <option>Last 24 hours</option>
                            <option>Last 3 days</option>
                            <option>Last 7 days</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label>Period:</label>
                        <input type="text"/>
                    </div>

                    <div className="form-row">
                        <label>IP Address:</label>
                        <input type="text" placeholder="Enter IP Address"/>
                        <button type="submit">Load</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default App;