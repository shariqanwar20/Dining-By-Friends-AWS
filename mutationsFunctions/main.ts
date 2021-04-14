import { addFriend } from "./addFriend";
import { addRestaurant } from "./addRestaurant";
import { addReview } from "./addReview";
import { addUser } from "./addUser";
import { rateReview } from "./rateReview";


exports.handler = async (event:any) => {
    console.log("Event Detail: ", event.detail);
    switch (event.source) {
      case "appsync-add-user":
        return await addUser(event.detail);
      case "appsync-add-restaurant":
        return await addRestaurant(event.detail)
      case "appsync-add-friend": 
        return await addFriend(event.detail)
      case "appsync-add-review": 
        return await addReview(event.detail)
      case "appsync-rate-review": 
        return await rateReview(event.detail)
      default:
        return null;
    }
}