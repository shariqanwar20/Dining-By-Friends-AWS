import * as gremlin from 'gremlin';
import { Review } from './diningByFriendsTypes';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.WRITER

export async function addReview(reviewInfo: Review) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const d = new Date();
    const review = await g.addV('review').property('name', reviewInfo.text).property("rating", reviewInfo.rating).property("timeStamp", `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`).property("helpfulnessRating", 0).next()
    
    console.log("Review Vertex: ", review);
    
    const previousRatingsOfRestaurant = await g.V(reviewInfo.restaurantId).values("rating").next();
    
    console.log("previousRatings: ", previousRatingsOfRestaurant);
    
    const currentTotalReviews = await g.V(reviewInfo.restaurantId).in_("are_about").toList();
    console.log("currentTotalReviews: ", currentTotalReviews);

    const updatedRestaurantRating = await g.V(reviewInfo.restaurantId).property("rating", ((previousRatingsOfRestaurant.value + parseInt(reviewInfo.rating)) / (currentTotalReviews.length + 1))).next()
    console.log("updatedRestaurantRating: ", updatedRestaurantRating);

    const userToReview = await g.addE("writes").from_(g.V().has("person", "id", reviewInfo.userId)).to(g.V(review.value.id)).next();
    console.log("userToReviewEdge: ", userToReview);

    const reviewToRestaurant = await g.addE("are_about").from_(g.V(review.value.id)).to(g.V(reviewInfo.restaurantId)).next();
    console.log("reviewToRestaurantEdge: ", reviewToRestaurant);

    const reviewToCuisine = await g.addE("is_about").from_(g.V(review.value.id)).to(g.V().has("cuisine", "name", reviewInfo.cuisineId)).next();
    console.log("reviewToCuisineEdge: ", reviewToCuisine);

    dc.close()
    return {
        id: review.value.id,
        text: reviewInfo.text,
        rating: reviewInfo.rating,
        timeStamp: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        helpfulnessRating: 0
    }
}