import * as gremlin from 'gremlin';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.READER

const __ = gremlin.process.statics

export const getUsers = async () => {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    try {
      let data = await g.V().hasLabel('person').toList()

      console.log("List of users: ", data)

      let users = Array()

      let v: any;
      for (v of data) {
        const _properties = await g.V(v.id).properties().toList()
        let user = _properties.reduce((acc: any, next: any) => {
          acc[next.label] = next.value
          return acc
        }, {})
        user.id = v.id
        users.push(user)
      }

      console.log("Users Array: ", users);
    
      dc.close()
      return users
    } catch (err) {
        console.log('ERROR', err)
        return null
    }
}

// const gremlin = require('gremlin')

// const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
// const Graph = gremlin.structure.Graph
// const uri = process.env.READER

// const listPosts = async () => {
//     let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
//     const graph = new Graph()
//     const g = graph.traversal().withRemote(dc)
//     try {
//       let data = await g.V().hasLabel('posts').toList()
//       let posts = Array()

//       for (const v of data) {
//         const _properties = await g.V(v.id).properties().toList()
//         let post = _properties.reduce((acc: any, next: any) => {
//           acc[next.label] = next.value
//           return acc
//         }, {})
//         post.id = v.id
//         posts.push(post)
//       }

//       dc.close()
//       return posts
//     } catch (err) {
//         console.log('ERROR', err)
//         return null
//     }
// }

// export default listPosts