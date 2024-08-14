import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, vpcId: string) {
    super(scope, id);

    this.vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: vpcId,
    });
  }
}
