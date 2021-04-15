import * as gremlin from 'gremlin';
import { Friend } from './diningByFriendsTypes';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.WRITER

export async function addFriend(friend: Friend) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const userToOtherUser = await g.V(friend.userId).as("r").V(friend.friendId).coalesce(__.inE("friends").where(__.outV().as("r")), __.addE("friends").from_("r")).next()
    
    console.log("friend edge: ", userToOtherUser);
    
    dc.close()
    return `${friend.userId} → ${friend.friendId}`
}
