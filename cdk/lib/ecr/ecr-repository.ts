import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

interface EcrRepositoryProps {
  repositoryName: string;
}

export class EcrRepository extends Construct {
  public readonly repositoryUri;

  constructor(scope: Construct, id: string, props: EcrRepositoryProps) {
    super(scope, id);

    // Create Elastic Container Repository
    const repositoryName = props.repositoryName;
    const ecrRepository = ecr.Repository.fromRepositoryName(this, 'ElevateLabsAppEcrRepository', repositoryName);


    this.repositoryUri = ecrRepository.repositoryUri
  }
}
