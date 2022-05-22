import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Peer, Port, SecurityGroup, Subnet, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as redshift from 'aws-cdk-lib/aws-redshift';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsRedshiftPracticeStack extends Stack {
  private static VPC_CIDR = '10.0.0.0/16';
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const systemName = this.node.tryGetContext('systemName');
    const envType = this.node.tryGetContext('envType');

    const vpc = new Vpc(this, 'redshiftVpc', {
      cidr: AwsRedshiftPracticeStack.VPC_CIDR,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: `${systemName}-${envType}-vpc`,
    });

    const subnetRedshift1a = new Subnet(this, 'redshiftSubnet1a', {
      vpcId: vpc.vpcId,
      cidrBlock: '10.0.0.0/24',
      availabilityZone: 'ap-northeast-1a',
    });
    // Security Group for Redshift
    const redshiftSg = new SecurityGroup(this, 'redshiftSg', {
      vpc: vpc,
      securityGroupName: `${systemName}-${envType}-redshift-sg`,
      allowAllOutbound: true,
    });
    redshiftSg.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(5439),
      'allow redshift anywhere',
    );

    // IAM Role for Redshift
    const redshiftIamRole = new Role(this, 'redshiftIamRole', {
      roleName: `${systemName}-${envType}-redshift-role`,
      assumedBy: new ServicePrincipal('redshift.amazonaws.com'),
    });
    redshiftIamRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    );

    // Redshift Cluster
    const redshiftClusterSubnetGroup = new redshift.CfnClusterSubnetGroup(
      this,
      'redshiftClusterSubnetGroup',
      {
        description: 'sample redshift cluster subnet group',
        subnetIds: [subnetRedshift1a.subnetId],
      },
    );
    const redShiftCluster = new redshift.CfnCluster(
      this,
      'redshiftClusterSecurityGroup',
      {
        clusterType: 'single-node',
        dbName: 'sample-dev',
        masterUsername: 'admin',
        masterUserPassword: 'admin1234!',
        clusterSubnetGroupName: redshiftClusterSubnetGroup.ref,
        nodeType: 'dc2.large',
      },
    );

    // S3 bucket
    const bucket = new Bucket(this, 'redshiftdatabucket', {
      bucketName: `${systemName}-${envType}-dokkoi-redshift`,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    // Cfn Output
    new CfnOutput(this, 'VPC CIDR', {
      value: vpc.vpcCidrBlock,
    });
    new CfnOutput(this, 'VPC ID', {
      value: vpc.vpcId,
    });
  }
}
