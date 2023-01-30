;[
  {
    $match: {
      product: new ObjectId("63d77335cad8c7907e9e945f"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
]
