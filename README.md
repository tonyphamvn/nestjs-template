# Nestjs Template

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- Node.js 22.x
- Yarn package manager
- PM2 process manager

### Environment Setup

1. Copy `.env` file from `.env.example` file in the root directory:

```bash
cp .env.example .env
```

2. Change these variables

```bash
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
NODE_ENV=production
```

### Deployment Steps

#### Using Docker Compose (Recommended)

1. Build and start the services:

```bash
docker-compose up -d
```

2. Build the application:

```bash
yarn install
yarn build
```

3. Initialize the database structure:
```bash
yarn db:up
yarn db:seed # run only one time when initializing the app
```

4. Start the application

To run with the dev mode:
```bash
yarn pm2:dev
```

To run with the production mode:
```bash
yarn pm2:prod
```

### Monitoring

- Use PM2 to monitor the application:

```bash
pm2 monit
```

- Check logs:

```bash
pm2 logs
```

### Health Checks

- API endpoint: `http://your-domain:8000/api/v1/health`
- Scanner service: Check PM2 status for 'scanner' process

### Backup and Recovery

- Database backups are stored in the Docker volume `pg_data`
- Redis data is stored in memory by default (configure persistence if needed)

### Scaling

- The application is designed to be horizontally scalable
- Use PM2 cluster mode for API scaling:

```bash
pm2 start ecosystem.config.js --env production -i max
```

### Security Considerations

- Ensure all environment variables are properly set
- Use strong passwords for database access
- Configure firewall rules to restrict access to necessary ports
- Regularly update dependencies and security patches

### Troubleshooting

1. Check PM2 logs for application errors
2. Verify database connection in logs
3. Ensure Redis is running and accessible
4. Check system resources (memory, CPU) using PM2 monit
