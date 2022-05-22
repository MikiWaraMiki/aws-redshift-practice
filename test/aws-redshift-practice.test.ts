import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as AwsRedshiftPractice from '../lib/aws-redshift-practice-stack';

const app = new cdk.App();
const stack = new AwsRedshiftPractice.AwsRedshiftPracticeStack(
  app,
  'AwsRedshiftPracticeStack',
);
const template = Template.fromStack(stack);

test('created vpc', () => {
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResource('AWS::EC2::VPC', {
    Properties: {
      CidrBlock: '10.0.0.0/16',
    },
  });
});

test('have redshift subnet', () => {
  template.resourceCountIs('AWS::EC2::Subnet', 1);
  template.hasResource('AWS::EC2::Subnet', {
    Properties: {
      CidrBlock: '10.0.0.0/24',
      AvailabilityZone: 'ap-northeast-1a',
    },
  });
});
