import { base44 } from "@/api/base44Client";

// AI features run on the server so integration credits are protected.
const run = async (op, params) => {
  const res = await base44.functions.invoke("aiAssist", { op, params });
  return res.data.result;
};

export const ai = {
  InvokeLLM: (params) => run("InvokeLLM", params),
  GenerateImage: (params) => run("GenerateImage", params),
  GenerateSpeech: (params) => run("GenerateSpeech", params),
  TranscribeAudio: (params) => run("TranscribeAudio", params),
};