import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface EcsClusterProps {
  vpc: ec2.IVpc;
  clusterName: string;
}

export class EcsClusterConstruct extends Construct {
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: EcsClusterProps) {
    super(scope, id);

    this.cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: props.vpc,
      clusterName: props.clusterName,
    });
  }
}
