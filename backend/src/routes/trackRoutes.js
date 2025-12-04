import express from "express";
import { trackVisit, getStats, recordExit, getUserStats, getUserDetails, getLocationStats, getLocationDetails, getTopHotels, getHotelDetails, getHotelStats, getGeoStats, getAllLocationGeoStats, getAllVisits, getLiveUsers } from "../controllers/trackController.js";

const router = express.Router();

// Track a page visit
router.post("/", trackVisit);

// Optional: Analytics endpoint
router.get("/stats", getStats);


router.get("/user-stats", getUserStats);
router.get("/user-details/:userId", getUserDetails);
router.get("/location-stats", getLocationStats);
router.get("/location-details/:location", getLocationDetails);
router.get("/top-hotels",getTopHotels);
router.get("/hotel-details/:hotelId",getHotelDetails);
router.get("/hotel-stats",getHotelStats);
router.get("/geo-stats", getGeoStats);
router.get("/geo-stats/locations", getAllLocationGeoStats);
router.get("/all-visits", getAllVisits);
router.get("/live", getLiveUsers);


router.post("/exit", recordExit);

export default router;
