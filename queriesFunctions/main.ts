import { getFriends } from "./getFriends";
import { getFriendsOfFriends } from "./getFriendsOfFriends";
import { getHighestRatedResturantWithCuisine } from "./getHighestRatedResturantWithCuisine";
import { getRelationWithUser } from "./getRelationWithUser";
import { getUsers } from "./getUsers";

type AppSyncEvent = {
    info: {
      fieldName: string;
    },
    arguments: {
      userId: string;
      otherUserId: string;
      cuisineName: string;
    }
}

exports.handler = async (event: AppSyncEvent) => {
    console.log("Arguments in queries lambda: ", event.arguments);
    switch (event.info.fieldName) {
      case "getUsers": 
        return await getUsers();
      case "getFriends":
        return await getFriends(event.arguments.userId)
      case "getFriendsOfFriends":
        return await getFriendsOfFriends(event.arguments.userId)
      case "getRelationWithUser":
        return await getRelationWithUser(event.arguments.userId, event.arguments.otherUserId)
      case "getHighestRatedResturantWithCuisine":
        return await getHighestRatedResturantWithCuisine(event.arguments.userId, event.arguments.cuisineName)
      default:
        return null;
    }
  }