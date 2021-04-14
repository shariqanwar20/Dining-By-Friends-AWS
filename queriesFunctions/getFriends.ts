import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getFriends(userId: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const data = await g.V().has("person", "id", userId).out("friends").toList()

    console.log("Friends list: ", data);

    let friends = Array()

    let v: any;
    for (v of data) {
      const _properties = await g.V(v.id).properties().toList()
      let friend = _properties.reduce((acc: any, next: any) => {
        acc[next.label] = next.value
        return acc
      }, {})
      friend.id = v.id
      friends.push(friend)

      console.log("friends: ", friends);
    }
    dc.close()
    return friends;
}