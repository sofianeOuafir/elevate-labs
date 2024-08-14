import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface RdsProps {
  vpc: ec2.IVpc;
  ec2SecurityGroup: ec2.SecurityGroup,
  securityGroupName: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export class RdsConstruct extends Construct {
  public readonly dbInstance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: RdsProps) {
    super(scope, id);

    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: props.securityGroupName,
      description: 'Security group for RDS',
      allowAllOutbound: true,
    });

    // Allow inbound traffic from ECS instances on port 5432
    rdsSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(props.ec2SecurityGroup.securityGroupId),
      ec2.Port.tcp(5432),
      'Allow inbound PostgreSQL traffic from ECS instances'
    );

    const rdsParameterGroup = new rds.ParameterGroup(this, 'RdsParameterGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      parameters: {
        'rds.force_ssl': '1',
      },
    });

    this.dbInstance = new rds.DatabaseInstance(this, 'RDS', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: props.vpc,
      credentials: rds.Credentials.fromPassword(props.dbUser, cdk.SecretValue.plainText(props.dbPassword)),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      securityGroups: [rdsSecurityGroup],
      databaseName: props.dbName,
      deletionProtection: false,
      publiclyAccessible: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      parameterGroup: rdsParameterGroup,
    });
  }
}
