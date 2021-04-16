import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getTopTenRestaurantsNearMe(userId: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const data = await g.V(userId).out("lives_in").in_("located").order().by("rating", gremlin.process.order.desc).limit(10).toList()
    
    console.log("Restaurants vertex: ", data);
    
    let restaurants = Array()

    let v: any;
    for (v of data) {
      const _properties = await g.V(v.id).properties().toList()
      let restaurant = _properties.reduce((acc: any, next: any) => {
        acc[next.label] = next.value
        return acc
      }, {})
      restaurant.id = v.id
      restaurants.push(restaurant)
    }
    console.log("restaurants: ", restaurants);
    
    dc.close()
    return restaurants;
}