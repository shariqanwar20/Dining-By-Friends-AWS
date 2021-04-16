import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getRecommendedRestaurants(userId: string) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const data = await g.V(userId).out("friends").out("writes", "rates").out("are_about").toList()
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

    const restaurantsList = Array.from(new Set(restaurants.map(s => s.id))).map(id => {
        return {
          id: id,
          name: restaurants.find(s => s.id === id).name
        }
    });
    
    dc.close()
    return restaurantsList;
}