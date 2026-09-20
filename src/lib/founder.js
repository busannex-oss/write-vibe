/** The Founder & CEO — the only person who may see or interact with the Personal Executive Assistant. */
export const FOUNDER_EMAIL = "busannex@gmail.com";

export const isFounder = (user) =>
  !!user?.email && user.email.toLowerCase() === FOUNDER_EMAIL;