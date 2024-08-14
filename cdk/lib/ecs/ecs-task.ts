import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

interface EcsTaskProps {
  cluster: ecs.Cluster;
  repositoryUri: string;
  dbEndpoint: string;
  dbPort: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  nodeEnv: string;
  taskDefinitionFamily: string;
  loggingStreamPrefix: string;
  containerName: string;
  ecsTaskExecutionRoleArn: string;
}

export class EcsTaskConstruct extends Construct {
  public readonly taskDefinition: ecs.TaskDefinition;

  constructor(scope: Construct, id: string, props: EcsTaskProps) {
    super(scope, id);

    const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'EcsTaskExecutionRole', props.ecsTaskExecutionRoleArn);

    this.taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef', {
      family: props.taskDefinitionFamily,
      executionRole: ecsTaskExecutionRole,
    });

    const container = this.taskDefinition.addContainer('NodeContainer', {
      image: ecs.ContainerImage.fromRegistry(`${props.repositoryUri}:latest`),
      memoryLimitMiB: 256,
      cpu: 256,
      environment: {
        DB_HOST: props.dbEndpoint,
        DB_PORT: props.dbPort,
        DB_USER: props.dbUser,
        DB_PASSWORD: props.dbPassword,
        DB_NAME: props.dbName,
        PGSSLMODE: 'require',
        NODE_ENV: props.nodeEnv,
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: props.loggingStreamPrefix,
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
      name: props.containerName,
    });
  }
}
