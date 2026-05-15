import { getReviews } from "../services/review.service.js";

export const fetchReviews = async (req, res) => {
  try {
    const reviews = await getReviews();

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};