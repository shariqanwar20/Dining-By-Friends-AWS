import listPosts from "./getUsers";

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
      case "listPosts": 
        return await listPosts();
      default:
        return null;
    }
  }