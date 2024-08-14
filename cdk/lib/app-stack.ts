import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcConstruct } from './vpc/vpc';
import { EcsClusterConstruct } from './ecs/ecs-cluster';
import { EcsTaskConstruct } from './ecs/ecs-task';
import { EcsServiceConstruct } from './ecs/ecs-service';
import { Ec2SecurityGroup } from './ecs/ec2-security-group';
import { RdsConstruct } from './rds/rds';
import { AlbConstruct } from './network/alb';
import { AlbSecurityGroup } from './network/alb-security-group';
import { EcrRepository } from './ecr/ecr-repository'

interface AppStackProps extends cdk.StackProps {
  stage: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    // VPC
    const vpcId = 'vpc-0a50fbaf6f830e52b';
    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct', vpcId);

    // ALB Security Group
    const albSecurityGroup = new AlbSecurityGroup(this, 'AlbSecurityGroup', {
      vpc: vpcConstruct.vpc,
      securityGroupName: 'alb-security-group',
    });

    // EC2 Security Group
    const ec2SecurityGroup = new Ec2SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc: vpcConstruct.vpc,
      albSecurityGroup: albSecurityGroup.securityGroup,
    });

    // ECS Cluster
    const ecsCluster = new EcsClusterConstruct(this, 'EcsClusterConstruct', {
      vpc: vpcConstruct.vpc,
      clusterName: 'elevateLabsAppCluster'
    });

    // DO NOT store values in clear
    // TODO: move these values in AWS secret manager or AWS parameter store
    const dbUser = 'user123'
    const dbPassword = 'admin123'
    const dbName = 'playersapp'
    // RDS Database
    const rdsConstruct = new RdsConstruct(this, 'RdsConstruct', {
      vpc: vpcConstruct.vpc,
      ec2SecurityGroup: ec2SecurityGroup.securityGroup,
      securityGroupName: 'rds-security-group',
      dbUser,
      dbPassword,
      dbName,
    });

    const ecrRepository = new EcrRepository(this, 'EcrRepository', { repositoryName: 'elevate-labs-app_node-backend' });

    // ECS Task Definition
    const ecsTask = new EcsTaskConstruct(this, 'EcsTaskConstruct', {
      cluster: ecsCluster.cluster,
      dbEndpoint: rdsConstruct.dbInstance.dbInstanceEndpointAddress,
      repositoryUri: ecrRepository.repositoryUri,
      dbPort: '5432',
      dbUser,
      dbPassword,
      dbName,
      nodeEnv: props?.stage || 'production',
      taskDefinitionFamily: 'elevate-labs-app-task-family',
      loggingStreamPrefix: 'elevate-labs-app-node-backend',
      containerName: 'elevate-labs-app-container-3000-tcp',
      ecsTaskExecutionRoleArn: 'arn:aws:iam::381491975528:role/ecsTaskExecutionRole'
    });

    // ECS Service
    const ecsService = new EcsServiceConstruct(this, 'EcsServiceConstruct', {
      vpc: vpcConstruct.vpc,
      cluster: ecsCluster.cluster,
      taskDefinition: ecsTask.taskDefinition,
      securityGroup: ec2SecurityGroup.securityGroup,
      keyName: 'my-first-web-app-beanstalk-ec2-key-pair',
      instanceType: 't2.micro',
      autoScalingGroupName: 'elevate-labs-app-asg',
      capacityProviderName: 'elevate-labs-app-capacity-provider',
      serviceName: 'elevate-labs-app-backend-service'
    });

    // Allow ECS Service to connect to RDS
    rdsConstruct.dbInstance.connections.allowFrom(
      ecsService.service.connections,
      ec2.Port.tcp(5432),
      'Allow ECS containers to connect to RDS'
    );

    // Load Balancer
    new AlbConstruct(this, 'AlbConstruct', {
      vpc: vpcConstruct.vpc,
      service: ecsService.service,
      securityGroup: albSecurityGroup.securityGroup,
      loadBalancerName: 'elevate-labs-app-alb',
    });
  }
}
