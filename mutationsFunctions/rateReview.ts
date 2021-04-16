import * as gremlin from 'gremlin';
import { RateReview } from './diningByFriendsTypes';

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph

const __ = gremlin.process.statics
const t = gremlin.process.t

const uri = process.env.WRITER

export async function rateReview(reviewInfo: RateReview) {
    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    const helpfulnessRating = await g.V(reviewInfo.reviewId).values("helpfulnessRating").next()
    console.log("helpfulnessRating: ", helpfulnessRating);
    
    const newRatingValue: number = reviewInfo.like? (helpfulnessRating.value + 1) : (helpfulnessRating.value - 1)
    console.log("New Review Rating", newRatingValue);
    
    const review = await g.V(reviewInfo.reviewId).property(gremlin.process.cardinality.single, "helpfulnessRating", newRatingValue).values("helpfulnessRating").next();
    console.log("reviewAfterHelpfulnessPropertyChanged: ", review);

    const d = new Date();
    const personToReview = await g.V(reviewInfo.userId).as("r").V(reviewInfo.reviewId).coalesce(__.inE("rates").where(__.outV().as("r")), __.addE("rates").property("timeStamp", new Date()).from_("r")).next()
    console.log("personToReview: ", personToReview);

    dc.close()
    return `${reviewInfo.userId} liked ${reviewInfo.reviewId}`
}