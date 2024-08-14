import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface Ec2SecurityGroupProps {
  vpc: ec2.IVpc;
  albSecurityGroup: ec2.SecurityGroup;
}

export class Ec2SecurityGroup extends Construct {
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: Ec2SecurityGroupProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for EC2 instances in ECS cluster',
    });

    // Allow inbound HTTP and HTTPS traffic from ALB
    this.securityGroup.addIngressRule(
      ec2.Peer.securityGroupId(props.albSecurityGroup.securityGroupId),
      ec2.Port.tcp(3000),
      'Allow HTTP traffic from ALB'
    );

    // Allow inbound SSH traffic
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH traffic'
    );

    // Allow dynamic port range from the ALB security group
    this.securityGroup.addIngressRule(
      ec2.Peer.securityGroupId(props.albSecurityGroup.securityGroupId),
      ec2.Port.tcpRange(32768, 65535),
      'Allow dynamic ports from ALB'
    );
  }
}
