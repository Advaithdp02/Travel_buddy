import Location from "../models/Location.js";
import Contribution from "../models/Contribution.js";

// @desc    Get total number of locations
// @access  Protected (Staff)
export const getLocationCount = async (req, res) => {
  try {
    const count = await Location.countDocuments();

    res.status(200).json({
      success: true,
      totalLocations: count,
    });
  } catch (error) {
    console.error("Error fetching location count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location count",
    });
  }
};
// @desc    Get total number of locations
// @access  Protected (Staff)
export const getContributionCount = async (req, res) => {
  try {
    const count = await Contribution.countDocuments();

    res.status(200).json({
      success: true,
      totalContributions: count,
    });
  } catch (error) {
    console.error("Error fetching contribution count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contribution count",
    });
  }
};
export const getTopContributors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contributors = await Contribution.aggregate([
      {
        $group: {
          _id: "$user",
          totalContributions: { $sum: 1 }
        }
      },
      {
        $sort: { totalContributions: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalContributions: 1
        }
      }
    ]);

    const totalContributors = await Contribution.distinct("user");

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalContributors.length / limit),
      totalContributors: totalContributors.length,
      data: contributors
    });
  } catch (error) {
    console.error("Top contributor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top contributors"
    });
  }
};
