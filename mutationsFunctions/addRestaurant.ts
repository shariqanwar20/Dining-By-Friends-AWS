import * as gremlin from 'gremlin';
import { Restaurant } from './diningByFriendsTypes';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.WRITER

export async function addRestaurant(restaurantInfo: Restaurant) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const  restaurantVertex = g.V().has("restaurant", "name", restaurantInfo.name)
    const restaurant = await restaurantVertex.hasNext() ? await restaurantVertex.next() :  await g.addV('restaurant').property('name', restaurantInfo.name).property("rating", 0.0).next()

    console.log("Restaurant vertex: ", restaurant);

    const cityVertex = g.V().has("city", "name", restaurantInfo.location)
    const city = await cityVertex.hasNext() ?  await cityVertex.next() : await g.addV("city").property("name", restaurantInfo.location).next();
    
    console.log("City vertex: ", city);

    const cuisineVertex = g.V().has("cuisine", "name", restaurantInfo.cuisine)
    const cuisine = await cuisineVertex.hasNext() ? await cuisineVertex.next() : await g.addV("cuisine").property("name", restaurantInfo.cuisine).next();

    console.log("Cuisine vertex: ", cuisine);

    const restaurantToCity = await g.V(restaurant.value.id).as("r").V(city.value.id).coalesce(__.inE("located").where(__.outV().as("r")), __.addE("located").from_("r")).next()
    const restaurantToCuisine = await g.V(restaurant.value.id).as("r").V(cuisine.value.id).coalesce(__.inE("serves").where(__.outV().as("r")), __.addE("serves").from_("r")).next()
    
    console.log("restaurantToCity edge: ", restaurantToCity);
    console.log("restaurantToCuisine edge: ", restaurantToCuisine);

    dc.close()
    return {
        id: restaurant.value.id,
        name: restaurantInfo.name
    }
}