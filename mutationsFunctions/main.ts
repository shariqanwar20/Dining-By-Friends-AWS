import { addFriend } from "./addFriend";
import { addRestaurant } from "./addRestaurant";
import { addUser } from "./addUser";


exports.handler = async (event:any) => {
    console.log("Event Detail: ", event.detail);
    switch (event.source) {
      case "appsync-add-user":
        return await addUser(event.detail);
      case "appsync-add-restaurant":
        return await addRestaurant(event.detail)
      case "appsync-add-friend": 
        return await addFriend(event.detail)
      default:
        return null;
    }
}