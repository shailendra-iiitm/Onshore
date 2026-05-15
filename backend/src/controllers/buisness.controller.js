import { getBusinesses } from "../services/buisness.service.js";

export const fetchBusinesses = async (req, res) => {
  try {
    const businesses = await getBusinesses();

    res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};