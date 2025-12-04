import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-4BX5SQY7M7",{ debug_mode: true }); 
};

export const trackGAView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackGAEvent = (name, params = {}) => {
  ReactGA.event(name, params);
};
