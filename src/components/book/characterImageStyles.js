export const IMAGE_STYLES = {
  portrait: { label: "Headshot Portrait", prompt: "Close-up head-and-shoulders portrait with a neutral expression that reveals their personality." },
  full_body: { label: "Full Body", prompt: "Full-body standing pose showing physique, posture and complete outfit." },
  action: { label: "Action Scene", prompt: "Dynamic action scene using their skills or special training in a setting that fits the story." },
  profession: { label: "Profession / Training", prompt: "Shown in their work, field of study or training environment, with relevant tools and attire reflecting their education and skills." },
  casual: { label: "Everyday Life", prompt: "Relaxed candid moment in daily life, casual clothing, natural setting that reflects their lifestyle." },
  formal: { label: "Formal Attire", prompt: "Dressed for a formal occasion, elegant outfit consistent with their culture, status and personality." },
  emotional: { label: "Emotional Moment", prompt: "Expressive close-up capturing a defining emotion tied to their backstory." },
};

export const buildIdentityContext = (char) =>
  [
    ["Gender identity", char.gender],
    ["Sexual orientation", char.sexual_orientation],
    ["Education", char.education],
    ["Skills", char.skills],
    ["Special training", char.special_training],
    ["Backstory", char.backstory],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");