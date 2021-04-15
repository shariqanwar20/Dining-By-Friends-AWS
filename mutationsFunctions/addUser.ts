import * as gremlin from "gremlin"
import { Person } from "./diningByFriendsTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.WRITER

const __ = gremlin.process.statics

export async function addUser(person: Person) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const  userVertex = g.V(person.userId)
    const user = await userVertex.hasNext() ? await userVertex.next() : await g.addV('person').property(gremlin.process.t.id, person.userId).property('name', person.name).next()

    const  cityVertex = g.V().has("city", "name", person.location)
    const city = await cityVertex.hasNext() ?  await cityVertex.next() : await g.addV("city").property("name", person.location).next();
    
    const userToCity = await g.V(user.value.id).as("r").V(city.value.id).coalesce(__.inE("lives_in").where(__.outV().as("r")), __.addE("lives_in").from_("r")).next()    
    dc.close()

    console.log("User Added: ", user);
    console.log("City Added: ", city);
    console.log("User to city edge: ", userToCity);

    return {
        id: user.value.id,
        name: person.name
    }
}

// const gremlin = require('gremlin')
// import Post from './diningByFriendsTypes'

// const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
// const Graph = gremlin.structure.Graph
// const uri = process.env.WRITER

// async function createPost(post: Post) {
//     let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
//     const graph = new Graph()
//     const g = graph.traversal().withRemote(dc)

//     const data = await g.addV('posts').property('title',post.title).property('content', post.content).next()
//     post.id = data.value.id
//     dc.close()
//     return post
// }
// export default createPost