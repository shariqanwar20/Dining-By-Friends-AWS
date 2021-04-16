import { getFriends } from "./getFriends";
import { getFriendsOfFriends } from "./getFriendsOfFriends";
import { getHighestRatedResturantWithCuisine } from "./getHighestRatedResturantWithCuisine";
import { getRecentReviews } from "./getRecentReviews";
import { getRecommendedRestaurants } from "./getRecommendedRestaurants";
import { getRelationWithUser } from "./getRelationWithUser";
import { getRestaurantsForMeBasedOnFriendsRatings } from "./getRestaurantsForMeBasedOnFriendsRatings";
import { getReviewdRatedRestaurantsByMyFriends } from "./getReviewdRatedRestaurantsByMyFriends";
import { getTopTenRestaurantsNearMe } from "./getTopTenRestaurantsNearMe";
import { getUsers } from "./getUsers";

type AppSyncEvent = {
    info: {
      fieldName: string;
    },
    arguments: {
      userId: string;
      otherUserId: string;
      cuisineName: string;
      restaurantId: string;
      days: number;
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
      case "getTopTenRestaurantsNearMe":
        return await getTopTenRestaurantsNearMe(event.arguments.userId)
      case "getRecentReviews":
        return await getRecentReviews(event.arguments.restaurantId)
      case "getReviewdRatedRestaurantsByMyFriends":
        return await getReviewdRatedRestaurantsByMyFriends(event.arguments.userId, event.arguments.days)
      case "getRestaurantsForMeBasedOnFriendsRatings":
        return await getRestaurantsForMeBasedOnFriendsRatings(event.arguments.userId)
      case "getRecommendedRestaurants":
        return await getRecommendedRestaurants(event.arguments.userId)
      default:
        return null;
    }
  }