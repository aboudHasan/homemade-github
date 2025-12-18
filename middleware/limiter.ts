import rateLimit from "express-rate-limit";

export const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2,
  message: { message: "Too many login attempts" },
  standardHeaders: true,
});

export const createLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: "Too many creation attempts" },
  standardHeaders: true,
});

export const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: { message: "Too many request attempts" },
  standardHeaders: true,
});

export const viewLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Too many view attempts" },
  standardHeaders: true,
});
