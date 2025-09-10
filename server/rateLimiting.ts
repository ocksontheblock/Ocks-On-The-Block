// Rate limiting middleware for scalability
// Protects against abuse and ensures fair resource usage

import rateLimit from "express-rate-limit";

export const emailSignupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 signups per IP per hour
  message: "Too many signup attempts, please try again later."
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: "Too many login attempts. Please try again in 15 minutes."
});

export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  max: 5, // 5 signups per hour
  message: "Too many signup attempts. Please try again later."
});

export const apiRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 API calls per 5 minutes
  message: "API rate limit exceeded. Please slow down."
});