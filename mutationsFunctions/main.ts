// import { addUser } from "./addUser";
import createPost from "./addUser";


exports.handler = async (event:any) => {
    console.log("Event Detail: ", event.detail);
    switch (event.source) {
      case "appsync-add-user":
        return await createPost(event.detail);
      default:
        return null;
    }
  }

// import createPost from "./addUser";
// import Post from "./diningByFriendsTypes";

// type AppSyncEvent = {
//     info: {
//       fieldName: string;
//     },
//     arguments: {
//       post: Post;
//     }
// }

// exports.handler = async (event: AppSyncEvent) => {
//     console.log("Arguments in queries lambda: ", event.arguments);
//     switch (event.info.fieldName) {
//       case "createPost": 
//         return await createPost(event.arguments.post);
//       default:
//         return null;
//     }
//   }