export function attachTeachingVideo(panel, source, label) {
  const video = document.createElement('video');
  video.className = 'teaching-video';
  video.src = source;
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('aria-label', label);
  video.textContent = 'Pelayar ini tidak menyokong video.';
  panel.append(video);
  return video;
}
