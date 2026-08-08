export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
] as const;

export const MAX_AUDIO_UPLOAD_BYTES = (() => {
  const mb = Number(process.env.MAX_AUDIO_UPLOAD_MB ?? 100);
  return mb * 1024 * 1024;
})();