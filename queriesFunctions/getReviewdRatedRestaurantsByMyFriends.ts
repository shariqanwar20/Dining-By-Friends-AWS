import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.READER

export async function getReviewdRatedRestaurantsByMyFriends(userId: string, days: number) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const d = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    console.log("date from which to look: ", d);
    
    const data = await g.V(userId).out("friends").out("writes", "rates").has("timeStamp", gremlin.process.P.gte(d)).out("are_about").toList()
    
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