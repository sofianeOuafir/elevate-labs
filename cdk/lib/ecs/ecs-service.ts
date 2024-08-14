import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface EcsServiceProps {
  vpc: ec2.IVpc;
  cluster: ecs.Cluster;
  taskDefinition: ecs.TaskDefinition;
  securityGroup: ec2.SecurityGroup;
  keyName: string;
  instanceType: string;
  autoScalingGroupName: string;
  capacityProviderName: string;
  serviceName: string;
}

export class EcsServiceConstruct extends Construct {
  public readonly service: ecs.Ec2Service;

  constructor(scope: Construct, id: string, props: EcsServiceProps) {
    super(scope, id);

    // Auto Scaling Group
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: props.vpc,
      autoScalingGroupName: props.autoScalingGroupName,
      instanceType: new ec2.InstanceType(props.instanceType),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      minCapacity: 1,
      maxCapacity: 3,
      securityGroup: props.securityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      keyName: props.keyName,
    });

    // ECS Capacity Provider
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      capacityProviderName: props.capacityProviderName,
    });

    // Attach the Capacity Provider to the Cluster
    props.cluster.addAsgCapacityProvider(capacityProvider);

    // ECS Service
    this.service = new ecs.Ec2Service(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      desiredCount: 1,
      serviceName: props.serviceName,
    });
  }
}
