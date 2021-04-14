import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getHighestRatedResturantWithCuisine(userId: string, cuisineName: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const data = await g.V().has("person", "id", userId).out("lives_in").in_("located").filter(__.out("serves").has("cuisine", "name", cuisineName)).order().by("rating", gremlin.process.order.desc).limit(1).toList()
    
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
    console.log("restaurants: ", restaurants[0]);
    
    dc.close()
    return restaurants[0];
}