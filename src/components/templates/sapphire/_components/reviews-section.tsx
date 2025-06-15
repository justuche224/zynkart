import { useState } from "react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const ReviewsSection = () => {
  const [activeTab, setActiveTab] = useState("reviews");

  // Mock data
  const mockReviews = [
    {
      id: 1,
      author: "Sarah Johnson",
      rating: 5,
      date: "January 15, 2024",
      content:
        "Absolutely love this product! The quality is outstanding and it arrived earlier than expected. Would definitely recommend to others.",
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      author: "Michael Chen",
      rating: 4,
      date: "January 10, 2024",
      content:
        "Great product overall. Only giving 4 stars because the color is slightly different from what I expected, but the quality is excellent.",
      helpful: 12,
      verified: true,
    },
    {
      id: 3,
      author: "Emma Williams",
      rating: 5,
      date: "December 30, 2023",
      content:
        "Perfect fit for my needs. The customer service was also exceptional when I had questions about the product.",
      helpful: 8,
      verified: true,
    },
  ];

  const ratingStats = {
    total: 147,
    average: 4.5,
    distribution: [
      { stars: 5, count: 89 },
      { stars: 4, count: 35 },
      { stars: 3, count: 15 },
      { stars: 2, count: 5 },
      { stars: 1, count: 3 },
    ],
  };
  //@ts-expect-error TODO
  const RatingStars = ({ rating }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="pt-8 border-t">
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "reviews" ? "default" : "outline"}
          onClick={() => setActiveTab("reviews")}
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          Reviews ({ratingStats.total})
        </Button>
        <Button
          variant={activeTab === "questions" ? "default" : "outline"}
          onClick={() => setActiveTab("questions")}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Questions (12)
        </Button>
      </div>

      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold">{ratingStats.average}</div>
              <RatingStars rating={ratingStats.average} />
              <div className="text-sm text-muted-foreground mt-1">
                Based on {ratingStats.total} reviews
              </div>
            </div>

            <div className="space-y-2">
              {ratingStats.distribution.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="text-sm w-6">{stars}</div>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Progress
                    value={(count / ratingStats.total) * 100}
                    className="flex-1"
                  />
                  <div className="text-sm w-8">{count}</div>
                </div>
              ))}
            </div>

            <Button className="w-full">Write a Review</Button>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {mockReviews.map((review) => (
              <div
                key={review.id}
                className="space-y-2 pb-6 border-b last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <div className="bg-primary/10 h-full w-full flex items-center justify-center">
                        {review.author.charAt(0)}
                      </div>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {review.verified && "Verified Purchase • "}
                        {review.date}
                      </div>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>

                <p className="text-sm">{review.content}</p>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button variant="ghost" size="sm">
                    Report
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              Load More Reviews
            </Button>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="text-center py-8 text-muted-foreground">
          No questions have been asked yet. Be the first to ask a question!
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
