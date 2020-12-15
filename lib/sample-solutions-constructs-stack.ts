import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { CognitoToApiGatewayToLambda } from '@aws-solutions-constructs/aws-cognito-apigateway-lambda';

export class SampleSolutionsConstructsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda用のcodeをGoのアセットから生成
    const cmdDir = `${__dirname}/../src/lambda/go/cmd`;
    const lambdaCode = lambda.Code.fromAsset(`${cmdDir}/hello`, {
      assetHashType: cdk.AssetHashType.OUTPUT,
      bundling: {
        image: lambda.Runtime.GO_1_X.bundlingDockerImage,
        command: [
          'bash',
          '-c',
          'GOOS=linux GOARCH=amd64 go build -o /asset-output/main main.go',
        ],
        user: 'root',
      },
    });

    // インフラのセットを作成
    const cognitoToApiGatewayToLambda = new CognitoToApiGatewayToLambda(this, 'sample-cognito-apigateway-lambda', {
      lambdaFunctionProps: {
        handler: 'main',
        runtime: lambda.Runtime.GO_1_X,
        code: lambdaCode,
      }
    });
  }
}
