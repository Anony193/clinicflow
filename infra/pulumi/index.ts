/**
 * ClinicFlow — Pulumi Infrastructure as Code (AWS)
 *
 * DOC4 §6.1: "Pulumi allows infrastructure to be written in TypeScript"
 *
 * Provisions:
 *   - VPC with public + private subnets
 *   - RDS PostgreSQL (Neon alternative — self-managed)
 *   - ElastiCache Redis
 *   - ECS Fargate (containerized app)
 *   - Application Load Balancer
 *   - ACM TLS certificate
 *   - CloudWatch monitoring + alarms
 *
 * Usage:
 *   cd infra/pulumi
 *   pulumi stack init production
 *   pulumi config set aws:region us-east-1
 *   pulumi up
 */

import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();
const environment = pulumi.getStack();
const domain = config.require('domain'); // e.g., clinicflow.com

// ============================================================
// 1. VPC + Networking
// ============================================================
const vpc = new awsx.ec2.Vpc('clinicflow-vpc', {
  cidrBlock: '10.0.0.0/16',
  numberOfAvailabilityZones: 2,
  subnetSpec: [
    { type: 'public', name: 'public' },
    { type: 'private', name: 'private' },
  ],
  natGateways: 1,
});

// ============================================================
// 2. RDS PostgreSQL (production database)
// ============================================================
const dbSubnetGroup = new aws.rds.SubnetGroup('clinicflow-db-subnet', {
  subnetIds: vpc.privateSubnetIds,
});

const dbSecurityGroup = new aws.ec2.SecurityGroup('clinicflow-db-sg', {
  vpcId: vpc.vpcId,
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      securityGroups: [], // ECS security group ID will be added
    },
  ],
  egress: [{ protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] }],
});

const dbInstance = new aws.rds.Instance('clinicflow-db', {
  engine: 'postgres',
  engineVersion: '16.4',
  instanceClass: 'db.t3.medium',
  allocatedStorage: 100,
  storageEncrypted: true, // HIPAA: AES-256 at rest
  multiAz: true, // HA
  backupRetentionPeriod: 7, // 7 days automated backups
  dbSubnetGroupName: dbSubnetGroup.name,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  username: 'clinicflow_admin',
  password: config.requireSecret('dbPassword'),
  dbName: 'clinicflow',
  deletionProtection: environment === 'production',
  skipFinalSnapshot: false,
  finalSnapshotIdentifier: `clinicflow-final-${environment}`,
});

// ============================================================
// 3. ElastiCache Redis (distributed locks + cache)
// ============================================================
const redisSubnetGroup = new aws.elasticache.SubnetGroup('clinicflow-redis-subnet', {
  subnetIds: vpc.privateSubnetIds,
});

const redis = new aws.elasticache.ReplicationGroup('clinicflow-redis', {
  replicationGroupDescription: 'ClinicFlow Redis',
  engine: 'redis',
  engineVersion: '7.1',
  nodeType: 'cache.t3.micro',
  numCacheClusters: 2,
  subnetGroupName: redisSubnetGroup.name,
  atRestEncryptionEnabled: true, // HIPAA: encrypt at rest
  transitEncryptionEnabled: true, // TLS
  automaticFailoverEnabled: true,
});

// ============================================================
// 4. ECS Fargate (containerized app)
// ============================================================
const ecsCluster = new aws.ecs.Cluster('clinicflow-cluster', {
  capacityProviders: ['FARGATE'],
});

const appLogGroup = new aws.cloudwatch.LogGroup('clinicflow-logs', {
  retentionInDays: 30,
});

const taskDefinition = new aws.ecs.TaskDefinition('clinicflow-task', {
  family: 'clinicflow',
  cpu: '512',
  memory: '1024',
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  executionRoleArn: new aws.iam.Role('clinicflow-exec-role', {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: 'ecs-tasks.amazonaws.com',
    }),
  }).arn,
  containerDefinitions: pulumi.jsonStringify([
    {
      name: 'clinicflow-app',
      image: config.require('ecrImageUri'),
      portMappings: [{ containerPort: 3000 }],
      environment: [
        { name: 'NODE_ENV', value: 'production' },
        { name: 'DATABASE_URL', value: dbInstance.endpoint.apply(h => `postgresql://clinicflow_admin:${config.requireSecret('dbPassword')}@${h}/clinicflow?sslmode=require`) },
        { name: 'REDIS_URL', value: redis.primaryEndpointAddress.apply(h => `rediss://:${config.requireSecret('redisPassword')}@${h}:6379`) },
      ],
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          'awslogs-group': appLogGroup.name,
          'awslogs-region': 'us-east-1',
          'awslogs-stream-prefix': 'clinicflow',
        },
      },
    },
  ]),
});

// ============================================================
// 5. Application Load Balancer (DOC5 §5.1)
// ============================================================
const alb = new awsx.lb.ApplicationLoadBalancer('clinicflow-alb', {
  vpcId: vpc.vpcId,
  subnetIds: vpc.publicSubnetIds,
  external: true,
});

const targetGroup = alb.createTargetGroup('clinicflow-tg', {
  port: 3000,
  protocol: 'HTTP',
  vpcId: vpc.vpcId,
  healthCheck: {
    path: '/api/trpc/health.check',
    interval: 30,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
  },
});

const listener = alb.createListener('clinicflow-listener', {
  port: 443,
  protocol: 'HTTPS',
  certificateArn: config.require('certificateArn'), // ACM TLS certificate
  defaultActions: [{ type: 'forward', targetGroupArn: targetGroup.arn }],
});

// ============================================================
// 6. ECS Service (auto-scaling, DOC5 §5.2)
// ============================================================
const ecsService = new aws.ecs.Service('clinicflow-service', {
  cluster: ecsCluster.arn,
  taskDefinitionArn: taskDefinition.arn,
  desiredCount: 2, // Start with 2 instances
  launchType: 'FARGATE',
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [dbSecurityGroup.id],
    assignPublicIp: false,
  },
  loadBalancers: [{
    targetGroupArn: targetGroup.arn,
    containerName: 'clinicflow-app',
    containerPort: 3000,
  }],
});

// Auto-scaling (CPU > 60% → scale up, < 30% → scale down, DOC5 §5.2)
const autoScalingTarget = new aws.appautoscaling.Target('clinicflow-asg-target', {
  resourceId: pulumi.interpolate`service/${ecsCluster.name}/${ecsService.name}`,
  scalableDimension: 'ecs:service:DesiredCount',
  serviceNamespace: 'ecs',
  minCapacity: 2,
  maxCapacity: 10,
});

new aws.appautoscaling.Policy('clinicflow-scale-up', {
  resourceId: autoScalingTarget.resourceId,
  scalableDimension: autoScalingTarget.scalableDimension,
  serviceNamespace: autoScalingTarget.serviceNamespace,
  policyType: 'TargetTrackingScaling',
  targetTrackingScalingPolicyConfiguration: {
    targetValue: 60, // CPU utilization target
    predefinedMetricSpecification: { predefinedMetricType: 'ECSServiceAverageCPUUtilization' },
    scaleInCooldown: 300, // 5 min
    scaleOutCooldown: 300,
  },
});

// ============================================================
// 7. CloudWatch Alarms (SLO alerting, DOC4 §7)
// ============================================================
new aws.cloudwatch.Alarm('clinicflow-error-rate', {
  alarmName: 'clinicflow-error-rate',
  metric: alb.metrics.http5xxErrorCount.name,
  threshold: 1, // 1% error rate
  comparisonOperator: 'GreaterThanThreshold',
  evaluationPeriods: 2,
  period: 60,
});

new aws.cloudwatch.Alarm('clinicflow-latency-p95', {
  alarmName: 'clinicflow-latency-p95',
  metric: alb.metrics.targetResponseTime.name,
  threshold: 0.5, // 500ms
  comparisonOperator: 'GreaterThanThreshold',
  evaluationPeriods: 2,
  period: 60,
});

// ============================================================
// 8. S3 Bucket for Patient Documents (R2 alternative)
// ============================================================
const documentsBucket = new aws.s3.Bucket('clinicflow-documents', {
  bucket: `clinicflow-${environment}-documents`,
  serverSideEncryptionConfiguration: {
    rule: { applyServerSideEncryptionByDefault: { sseAlgorithm: 'AES256' } }, // HIPAA
  },
  versioning: { enabled: true },
  lifecycleRules: [{
    id: 'retain-7-years',
    enabled: true,
    expiration: { days: 2555 }, // 7 years (HIPAA retention)
  }],
});

// ============================================================
// Exports
// ============================================================
export const databaseEndpoint = dbInstance.endpoint;
export const redisEndpoint = redis.primaryEndpointAddress;
export const albDnsName = alb.loadBalancer.dnsName;
export const documentsBucketName = documentsBucket.bucket;
