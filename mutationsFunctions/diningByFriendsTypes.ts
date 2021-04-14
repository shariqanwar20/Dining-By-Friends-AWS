export type Person = {
    userId: string;
    name: string;
    location: string;
}

export type Restaurant = {
  name: string;
  location: string;
  cuisine: string;
}

export type Friend = {
  userId: string;
  friendId: string;
}

export type Review = {
  userId: string;
  text: string;
  rating: string;
  restaurantId: string;
  cuisineId: string;
}

export type RateReview = {
  userId: string;
  like: boolean;
  reviewId: string;
}