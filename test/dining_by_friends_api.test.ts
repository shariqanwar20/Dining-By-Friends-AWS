import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DiningByFriendsApi from '../lib/dining_by_friends_api-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DiningByFriendsApi.DiningByFriendsApiStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
