import React, { useRef, useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import { IconArrowRight, IconArrowLeft } from "./Icons";

/* =======================
   CACHE CONFIG (FIX)
======================= */
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes

const safeStorage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

/* =======================
   ARROW BUTTON
======================= */
const ArrowButton = ({ direction = "right", onClick, className = "" }) => {
  const Icon = direction === "right" ? IconArrowLeft : IconArrowRight;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`w-[35px] h-[35px] rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all ${className}`}
    >
      <Icon hover={hover} />
    </button>
  );
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* =======================
   TOP DESTINATIONS
======================= */
export const TopDestinations = ({ userCoords }) => {
  const [destinations, setDestinations] = useState([]);
  const [nearestCode, setNearestCode] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef(null);
  const scrollEndTimeout = useRef(null);
  const centeredIndexRef = useRef(null);

  const DESKTOP_CARD_WIDTH = 285;
  const MOBILE_CARD_WIDTH = 230;

  const [CARD_WIDTH, setCARD_WIDTH] = useState(DESKTOP_CARD_WIDTH);
  const GAP = 24;

  const [activeIndex, setActiveIndex] = useState(null);

  /* =======================
     MOBILE DETECTION
  ======================= */
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      setIsMobile(mobile);
      setCARD_WIDTH(mobile ? MOBILE_CARD_WIDTH : DESKTOP_CARD_WIDTH);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* =======================
     FETCH DESTINATIONS (FIXED)
  ======================= */
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!userCoords) return;

      const fullLat = userCoords.latitude;
      const fullLon = userCoords.longitude;

      const keyLat = fullLat.toFixed(3);
      const keyLon = fullLon.toFixed(3);

      const cacheKey = `nearest_district_${keyLat}_${keyLon}`;
      const cached = safeStorage.get(cacheKey);

      if (cached?.data && Date.now() < cached.expiry) {
        setDestinations(cached.data.orderedDistricts || []);
        setNearestCode(
          cached.data.nearestDistrict?.DistrictCode || null
        );
        return;
      }

      try {
        const res = await fetch(
          `${BACKEND_URL}/districts/nearest/${fullLat}/${fullLon}`
        );
        const data = await res.json();

        if (data?.orderedDistricts) {
          setDestinations(data.orderedDistricts);
          setNearestCode(data.nearestDistrict?.DistrictCode || null);
        }

        safeStorage.set(cacheKey, {
          data,
          expiry: Date.now() + CACHE_TTL,
        });
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };

    fetchDestinations();
  }, [userCoords]);

  /* =======================
     CLEAN OLD CACHE
  ======================= */
  useEffect(() => {
    const now = Date.now();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("nearest_district_")) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (!item?.expiry || now > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }, []);

  /* =======================
     INFINITE LIST SAFE FIX
  ======================= */
  const fullList =
    destinations.length > 0
      ? [...destinations, ...destinations, ...destinations]
      : [];

  const middleIndex = destinations.length;

  /* =======================
     INITIAL CENTERING (FIXED)
  ======================= */
  useEffect(() => {
    if (!scrollRef.current || destinations.length === 0) return;

    const cardSize = CARD_WIDTH + GAP;
    const containerWidth = scrollRef.current.offsetWidth;

    const nearestIndex = nearestCode
      ? destinations.findIndex(
          (d) => d.DistrictCode === nearestCode
        )
      : 0;

    const indexToCenter =
      nearestIndex >= 0 ? middleIndex + nearestIndex : middleIndex;

    const cardCenter = indexToCenter * cardSize + CARD_WIDTH / 2;
    const startScroll =
      cardCenter - containerWidth / 2 + (isMobile ? 30 : 0);

    scrollRef.current.scrollLeft = startScroll;

    setActiveIndex(indexToCenter);
    centeredIndexRef.current = indexToCenter;
  }, [destinations, CARD_WIDTH, nearestCode, isMobile]);

  /* =======================
     CENTER DETECTION
  ======================= */
  const detectCenteredCard = () => {
    if (!scrollRef.current) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const containerWidth = scrollRef.current.offsetWidth;
    const center = scrollLeft + containerWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    fullList.forEach((_, index) => {
      const cardCenter =
        index * (CARD_WIDTH + GAP) + CARD_WIDTH / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
    centeredIndexRef.current = closestIndex;
  };

  /* =======================
     SNAP TO CENTER
  ======================= */
  const snapToCenteredCard = () => {
    if (!scrollRef.current || centeredIndexRef.current == null)
      return;

    const cardSize = CARD_WIDTH + GAP;
    const index = centeredIndexRef.current;
    const containerWidth = scrollRef.current.offsetWidth;

    const cardCenter =
      index * cardSize + CARD_WIDTH / 2;
    const targetScroll =
      cardCenter - containerWidth / 2 + (isMobile ? 30 : 0);

    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  /* =======================
     INFINITE SCROLL HANDLER
  ======================= */
  const handleInfiniteScroll = () => {
    if (!scrollRef.current || destinations.length === 0) return;

    const cardSize = CARD_WIDTH + GAP;
    const batchWidth = destinations.length * cardSize;
    const scrollLeft = scrollRef.current.scrollLeft;

    if (scrollLeft >= batchWidth * 2 - batchWidth / 2)
      scrollRef.current.scrollLeft = scrollLeft - batchWidth;

    if (scrollLeft <= batchWidth / 2)
      scrollRef.current.scrollLeft = scrollLeft + batchWidth;

    detectCenteredCard();

    if (scrollEndTimeout.current)
      clearTimeout(scrollEndTimeout.current);

    scrollEndTimeout.current = setTimeout(() => {
      snapToCenteredCard();
    }, 120);
  };

  /* =======================
     ARROW SCROLL
  ======================= */
  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = CARD_WIDTH + GAP;

    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });

    setTimeout(() => {
      detectCenteredCard();
      snapToCenteredCard();
    }, 350);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <section
      className="lg:w-[100vw] md:ml-[-60px] w-full bg-cover bg-center text-white py-20 md:mr-[-60px]"
      style={{ backgroundImage: `url(/TopDestinationBG.png)` }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 lg:px-0 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="font-schoolbell text-[#F2B024] text-3xl md:text-4xl">
              Top Destination
            </h2>
            <p className="font-poppins text-white text-4xl md:text-5xl mt-2">
              Explore Top Destinations
            </p>
          </div>

          {!isMobile && (
            <>
              <ArrowButton
                direction="left"
                onClick={() => scroll("left")}
                className="absolute left-4 top-[55%] -translate-y-1/2 z-50"
              />
              <ArrowButton
                direction="right"
                onClick={() => scroll("right")}
                className="absolute right-4 top-[55%] -translate-y-1/2 z-50"
              />
            </>
          )}
        </div>

        {isMobile && (
          <>
            <ArrowButton
              direction="left"
              onClick={() => scroll("left")}
              className="absolute left-2 top-[55%] -translate-y-1/2 z-50"
            />
            <ArrowButton
              direction="right"
              onClick={() => scroll("right")}
              className="absolute right-2 top-[55%] -translate-y-1/2 z-50"
            />
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={handleInfiniteScroll}
          className="flex gap-6 overflow-x-scroll hide-scrollbar pt-16 pb-20"
        >
          {fullList.map((dest, i) => {
            const isCenter = activeIndex === i;

            return (
              <div
                key={i}
                className="flex-shrink-0 transition-all duration-300"
                style={{
                  width: CARD_WIDTH,
                  zIndex: isCenter ? 20 : 10,
                  transform: isCenter
                    ? "scale(1.12)"
                    : "translateY(10px) scale(0.9)",
                  opacity: isCenter ? 1 : 0.85,
                }}
              >
                <DestinationCard
                  destination={dest}
                  isNearest={
                    dest.DistrictCode === nearestCode
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
