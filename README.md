# AWS EC2 CPU Monitor

Monitor AWS EC2 instance CPU usage over time.

## Setup

### Backend
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
PORT=3001
```

### Frontend
```bash
cd frontend
npm install
```

## Run

Terminal 1:
```bash
cd backend
npm start
```

Terminal 2:
```bash
cd frontend
npm start
```

## Usage

1. Open http://localhost:3000
2. Enter:
    - Time period: Select from dropdown
    - Period: Interval in seconds (must be multiple of 60, e.g., 300)
    - IP Address: Your EC2 instance IP
3. Click Load

## Notes

- Both servers must be running
- Period must be multiple of 60 (minimum 60)
- AWS basic monitoring provides 5-minute intervals