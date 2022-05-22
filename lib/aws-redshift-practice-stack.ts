import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnSubnet, CfnVPC } from 'aws-cdk-lib/aws-ec2';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsRedshiftPracticeStack extends Stack {
  private static VPC_CIDR = '10.0.0.0/16';
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const systemName = this.node.tryGetContext('systemName');
    const envType = this.node.tryGetContext('envType');

    const vpc = new CfnVPC(this, 'redshiftVpc', {
      cidrBlock: AwsRedshiftPracticeStack.VPC_CIDR,
      tags: [
        {
          key: 'Name',
          value: `${systemName}-${envType}-vpc`,
        },
      ],
    });

    const subnetRedshift1a = new CfnSubnet(this, 'redshiftSubnet1a', {
      cidrBlock: '10.0.0.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [
        {
          key: 'Name',
          value: `${systemName}-${envType}-redshift-subnet-1a`,
        },
      ],
    });
  }
}
