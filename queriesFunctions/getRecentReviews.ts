import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getRecentReviews(restaurantId: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const d = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const data = await g.V(restaurantId).in_("are_about").has("timeStamp", gremlin.process.P.gte(d)).toList()
    
    console.log("Reviews vertex: ", data);
    
    let reviews = Array()

    let v: any;
    for (v of data) {
      const _properties = await g.V(v.id).properties().toList()
      let review = _properties.reduce((acc: any, next: any) => {
        if(next.label === "name")
          acc["text"] = next.value
        else if(next.label === "timeStamp")
          acc["timeStamp"] = "" + next.value
        acc[next.label] = next.value
        return acc
      }, {})
      review.id = v.id
      reviews.push(review)
    }
    console.log("reviews: ", reviews);
    
    dc.close()
    return reviews;
}