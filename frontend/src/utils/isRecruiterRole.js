// utils/isRecruiterRole.js

const recruiterKeywords = ["recruiter", "Recruiter", "recuriter", "hr head", "hr-head", "hrhead", "hr manager", "hr lead", "talent acquisition"];

export const isRecruiterRole = (headValue = "") => {
  const normalized = headValue.toLowerCase().trim();
  return recruiterKeywords.some((keyword) => normalized.includes(keyword));
};