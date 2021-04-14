import { getFriends } from "./getFriends";
import { getUsers } from "./getUsers";

type AppSyncEvent = {
    info: {
      fieldName: string;
    },
    arguments: {
      userId: string;
    }
}

exports.handler = async (event: AppSyncEvent) => {
    console.log("Arguments in queries lambda: ", event.arguments);
    switch (event.info.fieldName) {
      case "getUsers": 
        return await getUsers();
      case "getFriends":
        return await getFriends(event.arguments.userId)
      default:
        return null;
    }
  }