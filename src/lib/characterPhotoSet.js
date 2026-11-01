import { ai } from "@/lib/ai";
import { PHOTO_SET, buildCharacterImagePrompt } from "@/components/book/characterImageStyles";

// Generates the requested photo-set shots, all locked to one identity.
// Returns the patch to merge into the character.
export async function generatePhotoSet(char, book, keys = PHOTO_SET.map((s) => s.key)) {
  const gen = (shot, ref) =>
    ai.GenerateImage({
      ...(ref ? { existing_image_urls: [ref] } : {}),
      prompt: buildCharacterImagePrompt(char, book, shot.prompt(char), !!ref),
    }).then((r) => r.url);

  let identity = char.identity_image_url;
  const next = { ...(char.photo_set || {}) };
  // The locked identity image can never be regenerated.
  if (identity) keys = keys.filter((k) => next[k] !== identity);
  if (!identity) {
    identity = await gen(PHOTO_SET[0], null); // headshot becomes the locked identity
    next.headshot = identity;
    keys = keys.filter((k) => k !== "headshot");
  }
  const shots = PHOTO_SET.filter((s) => keys.includes(s.key));
  const urls = await Promise.all(shots.map((s) => gen(s, identity)));
  shots.forEach((s, i) => (next[s.key] = urls[i]));
  const images = [...new Set([...Object.values(next), ...(char.images || [])])];
  return { identity_image_url: identity, photo_set: next, images, image_url: images[0] };
}