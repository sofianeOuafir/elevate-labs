import * as cdk from 'aws-cdk-lib';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

interface AlbProps {
  vpc: ec2.IVpc;
  service: ecs.Ec2Service;
  securityGroup: ec2.SecurityGroup;
  loadBalancerName: string;
}

export class AlbConstruct extends Construct {
  public readonly loadBalancer: elb.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AlbProps) {
    super(scope, id);

    this.loadBalancer = new elb.ApplicationLoadBalancer(this, 'LB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.securityGroup,
      loadBalancerName: props.loadBalancerName,
    });

    const listener = this.loadBalancer.addListener('PublicListener', {
      port: 80,
      open: true,
    });

    listener.addTargets('ECS', {
      port: 80,
      targets: [props.service],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.minutes(1),
      },
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'The DNS name of the Application Load Balancer',
      exportName: 'LoadBalancerDNS',
    });
  }
}
