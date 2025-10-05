import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";

// Create a new contribution (submitted by user)
export const createContribution = async (req, res) => {
  try {
    const { location, title, description, images } = req.body;

    const contribution = await Contribution.create({
      user: req.user.id,
      location,
      title,
      description,
      images,
      verified: false // default false until admin verifies
    });

    // Add contribution to location
    const loc = await Location.findById(location);
    loc.contributions.push(contribution._id);
    await loc.save();

    res.status(201).json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get verified contributions for a location (anyone)
export const getContributionsByLocation = async (req, res) => {
  try {
    const contributions = await Contribution.find({ 
        location: req.params.locationId, 
        verified: true
      })
      .populate("user", "name username profilePic")
      .populate("comments");

    res.status(200).json(contributions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single contribution (anyone)
export const getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate("user", "name username profilePic")
      .populate("comments");

    if (!contribution) return res.status(404).json({ message: "Contribution not found" });
    res.status(200).json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Verify a contribution
export const verifyContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ message: "Contribution not found" });

    contribution.verified = true;
    await contribution.save();

    res.status(200).json({ message: "Contribution verified", contribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
