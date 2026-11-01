export const IMAGE_STYLES = {
  portrait: { label: "Headshot Portrait", prompt: "Close-up head-and-shoulders portrait with a neutral expression that reveals their personality." },
  full_body: { label: "Full Body", prompt: "Full-body standing pose showing physique, posture and complete outfit." },
  action: { label: "Action Scene", prompt: "Dynamic action scene using their skills or special training in a setting that fits the story." },
  profession: { label: "Profession / Training", prompt: "Shown in their work, field of study or training environment, with relevant tools and attire reflecting their education and skills." },
  casual: { label: "Everyday Life", prompt: "Relaxed candid moment in daily life, casual clothing, natural setting that reflects their lifestyle." },
  formal: { label: "Formal Attire", prompt: "Dressed for a formal occasion, elegant outfit consistent with their culture, status and personality." },
  emotional: { label: "Emotional Moment", prompt: "Expressive close-up capturing a defining emotion tied to their backstory." },
};

// The four required photos every character gets.
export const PHOTO_SET = [
  { key: "headshot", label: "Headshot", prompt: () => "Professional close-up headshot, head and shoulders, plain softly lit studio background, looking at camera." },
  { key: "full_body", label: "Full Body", prompt: () => "Full-body photo from head to toe, standing naturally, showing physique, posture and complete outfit." },
  { key: "professional", label: "Professional", prompt: (c) => `Professional portrait at work as ${c.occupation || "their profession"}, in a realistic workplace with attire and tools of that job.` },
  { key: "casual", label: "Casual / Hobby", prompt: (c) => `Relaxed candid casual photo enjoying their hobby: ${c.hobbies || "a favorite pastime"}, casual clothing, natural setting.` },
];

export const buildIdentityContext = (char) =>
  [
    ["Gender identity", char.gender],
    ["Sexual orientation", char.sexual_orientation],
    ["Occupation", char.occupation],
    ["Hobbies", char.hobbies],
    ["Education", char.education],
    ["Skills", char.skills],
    ["Special training", char.special_training],
    ["Backstory", char.backstory],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export const IDENTITY_LOCK_RULE = `IDENTITY LOCK (mandatory): The attached reference image is this character's permanent physical identity. Reproduce the exact same person: identical face, facial features, skin tone, eye color, hair color and style, body type, height, age, and any distinguishing marks. Do NOT alter the identity in any way. ONLY the clothing, pose and setting may change.`;

export const buildCharacterImagePrompt = (char, book, shotPrompt, locked) => `Professional character image for a ${book.category} book:${locked ? `\n\n${IDENTITY_LOCK_RULE}` : ""}

Shot type: ${shotPrompt}
${buildIdentityContext(char)}
Represent the character's identity respectfully and authentically, without stereotypes or caricature.

Character: ${char.name}
Role: ${char.role}
Age: ${char.age || "unspecified"}
Gender: ${char.gender || "unspecified"}
Appearance: ${char.appearance || char.description}
Traits: ${char.traits?.join(", ")}

Book: "${book.title}"${book.subtitle ? ` — ${book.subtitle}` : ""}. Setting and tone must match this story: ${book.plot_summary || book.book_summary || book.category}. Clothing, props and backgrounds must fit the book's world and time period.

Style: Photorealistic, high quality, consistent character, appropriate for ${book.target_audience?.age_range || "general"} audience.`;