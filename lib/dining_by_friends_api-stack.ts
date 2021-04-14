import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as neptune from '@aws-cdk/aws-neptune';
import * as lambda from '@aws-cdk/aws-lambda';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets'

export class DiningByFriendsApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const api = new appsync.GraphqlApi(this, "DiningByFriendsApi", {
      name: 'DiningByFriendsApi',
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(7))
          }
        }
      }
    })

    const vpc =  new ec2.Vpc(this, "NeptuneVpc")

    // const sg1 = new ec2.SecurityGroup(this, "mySecurityGroup1", {
    //   vpc,
    //   allowAllOutbound: true,
    //   description: "security group 1",
    //   securityGroupName: "mySecurityGroup",
    // });
    // cdk.Tags.of(sg1).add("Name", "mySecurityGroup");

    // sg1.addIngressRule(sg1, ec2.Port.tcp(8182), "MyRule");

    // const neptuneSubnet = new neptune.SubnetGroup(
    //   this,
    //   "neptuneSubnetGroup",
    //   {
    //     subnetGroupName: "neptuneSubnet",
    //     vpc,
    //     vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.ISOLATED })
    //   }
    // );

    const neptuneCluster = new neptune.DatabaseCluster(this, "DIningByFriendsCLuster", {
      vpc,
      instanceType: neptune.InstanceType.T3_MEDIUM
    })

    neptuneCluster.connections.allowDefaultPortFromAnyIpv4("Open to world")
  
    const writeAddress = neptuneCluster.clusterEndpoint.socketAddress
    const readAddress = neptuneCluster.clusterReadEndpoint.socketAddress
    
    const neptuneMutationLambda = new lambda.Function(this, "NeptuneMutationLambda", { 
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode("mutationsFunctions"),
      handler: "main.handler",
      vpc: vpc,
    });

    const neptuneQueriesLambda = new lambda.Function(this, "NeptuneQueryLambdas", { 
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode("queriesFunctions"),
      handler: "main.handler",
      vpc: vpc
    });

    neptuneMutationLambda.addEnvironment('WRITER', writeAddress)
    neptuneQueriesLambda.addEnvironment('READER', readAddress)

    const httpDataSource = api.addHttpDataSource("NeptuneHttpDataSource", `https://events.${this.region}.amazonaws.com/`, {
      name: "NeptuneHttpDataSource",
      description: "Appsync To EventBridge to lambda to neptune",
    authorizationConfig: {
      signingRegion: this.region,
      signingServiceName: "events"
    }
    })
    events.EventBus.grantAllPutEvents(httpDataSource);

    // const mutationLambdaDataSource = api.addLambdaDataSource("NeptuneMutationLambdaDataSource", neptuneMutationLambda)
    const queryLambdaDataSource = api.addLambdaDataSource("NeptuneLambdaQueryDataSource", neptuneQueriesLambda)

    httpDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "addUser",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addUser/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addUser/response.vtl")
    })

    
    httpDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "addRestaurant",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addRestaurant/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addRestaurant/response.vtl")
    })

    
    httpDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "addFriend",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addFriend/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/addFriend/response.vtl")
    })

    queryLambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getUsers"
    })

    queryLambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getFriends"
    })

    const rule = new events.Rule(this, "DiningByFriendsMutationRule", {
      eventPattern: {
        source: ["appsync-add-user", "appsync-add-friend", "appsync-add-restaurant", "appsync-add-review", "appsync-rate-review"]
      },
      targets: [new targets.LambdaFunction(neptuneMutationLambda)]
    })

    // The next two lines are not required, they just log out the endpoints to your terminal for reference
    new cdk.CfnOutput(this, 'readaddress', {
      value: readAddress
    })
    new cdk.CfnOutput(this, 'writeaddress', {
      value: writeAddress
    })
  }
}
