import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getRelationWithUser(userId: string, otherUserId: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const user = await g.V(userId).properties().next()

    console.log("userValue: ", user);

    const data = await g.V(userId).repeat(__.out("friends")).emit().until(__.hasId(otherUserId)).toList()
    
    console.log("getRelationWithUser: ", data);

    let prefix = user.value.value;

    let v: any;
    for (v of data) {
      const _properties = await g.V(v.id).properties().toList()
      let user = _properties.reduce((acc: any, next: any) => {
        acc[next.label] = next.value
        return acc
      }, {})
      prefix += ` → ${user.name} `
    }
    dc.close()
    return prefix;
}