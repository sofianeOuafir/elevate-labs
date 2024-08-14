import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface AlbSecurityGroupProps {
  vpc: ec2.IVpc;
  securityGroupName: string;
}

export class AlbSecurityGroup extends Construct {
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: AlbSecurityGroupProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: props.securityGroupName,
      description: 'Security group for ALB with inbound rules for HTTP and HTTPS',
      allowAllOutbound: true,
    });

    // Allow inbound HTTP and HTTPS traffic from any IP
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic from any IP');
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic from any IP');
  }
}
