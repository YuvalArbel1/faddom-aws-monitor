const awsService = require('../services/awsService');

/**
 * Get CPU metrics for an EC2 instance
 * Handles the HTTP request and response
 */
async function getMetrics(req, res) {
    try {
        // Extract query parameters
        const {ip, startTime, endTime, interval} = req.query;

        console.log('Received request:', {ip, startTime, endTime, interval});

        // Check if all params are provided
        if (!ip || !startTime || !endTime || !interval) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: ip, startTime, endTime, interval'
            });
        }

        // Convert interval to number
        const period = parseInt(interval);

        // Step 1: Find instance ID by IP
        console.log(`Looking up instance ID for IP: ${ip}`);
        const instanceId = await awsService.getInstanceIdByIP(ip);

        if (!instanceId) {
            return res.status(404).json({
                success: false,
                error: `No EC2 instance found with IP address: ${ip}`
            });
        }

        // Step 2: Get CPU metrics
        console.log(`Fetching CPU metrics for instance: ${instanceId}`);
        const metrics = await awsService.getCPUMetrics(
            instanceId,
            startTime,
            endTime,
            period
        );

        // Return success response
        res.json({
            success: true,
            instanceId: instanceId,
            datapoints: metrics,
            count: metrics.length
        });

    } catch (error) {
        console.error('Error in getMetrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    getMetrics
};