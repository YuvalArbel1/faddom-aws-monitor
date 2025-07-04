const {EC2Client, DescribeInstancesCommand} = require("@aws-sdk/client-ec2");
const {CloudWatchClient, GetMetricStatisticsCommand} = require("@aws-sdk/client-cloudwatch");

// Init the AWS EC2 Client
const ec2Client = new EC2Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Init the AWS CloudWatch Client
const cloudWatchClient = new CloudWatchClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})

/**
 * Find EC2 instance ID by IP address
 * AWS Doc: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html
 *
 * @param {string} ipAddress - The IP address to search for
 * @returns {string|null} - Instance ID or null if not found
 */
async function getInstanceIdByIP(ipAddress) {
    console.log(`Searching for instance with IP: ${ipAddress}`);

    try {
        // First try: Search by private IP
        let params = {
            Filters: [
                {
                    Name: 'private-ip-address',
                    Values: [ipAddress]
                }
            ]
        };

        let command = new DescribeInstancesCommand(params);
        let response = await ec2Client.send(command);

        // Check if we found any instances
        if (response.Reservations && response.Reservations.length > 0) {
            const instance = response.Reservations[0].Instances[0];
            console.log(`Found instance by private IP: ${instance.InstanceId}`);
            return instance.InstanceId;
        }

        // Second try: Search by public IP
        params = {
            Filters: [
                {
                    Name: 'ip-address',
                    Values: [ipAddress]
                }
            ]
        };

        command = new DescribeInstancesCommand(params);
        response = await ec2Client.send(command);

        if (response.Reservations && response.Reservations.length > 0) {
            const instance = response.Reservations[0].Instances[0];
            console.log(`Found instance by public IP: ${instance.InstanceId}`);
            return instance.InstanceId;
        }
        console.log('No instance found with IP:', ipAddress);
        return null;

    } catch (error) {
        console.error('Error finding instance:', error);
        throw error;
    }
}

/**
 * Get CPU utilization metrics from CloudWatch
 * AWS Doc: https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_GetMetricStatistics.html
 *
 * @param {string} instanceId - EC2 instance ID
 * @param {Date} startTime - Start time for metrics
 * @param {Date} endTime - End time for metrics
 * @param {number} period - Period in seconds (must be multiple of 60)
 * @returns {Array} - Array of datapoints
 */
async function getCPUMetrics(instanceId, startTime, endTime, period) {
    console.log(`Getting CPU metrics for instance: ${instanceId}`);
    console.log(`Time range: ${startTime} to ${endTime}`);
    console.log(`Period: ${period} seconds`);

    const params = {
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [
            {
                Name: 'InstanceId',
                Value: instanceId
            }
        ],
        StartTime: new Date(startTime),
        EndTime: new Date(endTime),
        Period: period,
        Statistics: ['Average']
    };

    try {
        const command = new GetMetricStatisticsCommand(params);
        const response = await cloudWatchClient.send(command);

        // Sort datapoints by timestamp
        if (response.Datapoints) {
            response.Datapoints.sort((a, b) =>
                new Date(a.Timestamp) - new Date(b.Timestamp)
            );
        }

        const datapoints = response.Datapoints || [];
        return datapoints;

    } catch (error) {
        console.error('Error getting CPU metrics:', error);
        throw error;
    }
}

module.exports = {
    getInstanceIdByIP,
    getCPUMetrics
};