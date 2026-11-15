# One-off: main.mp4 -> public/frames/fNNN.webp (cropped to character+laptop, background levelled to white)
# Usage: python -I scripts/extract_frames.py main.mp4 public/frames   (needs opencv-python-headless, numpy)
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
X0, X1, Y0, Y1 = 280, 1000, 80, 720  # crop in 1280x720 source: head, waving hand, laptop all inside
cap = cv2.VideoCapture(src); i = 0; gain = None
while True:
    ok, f = cap.read()
    if not ok: break
    c = f[Y0:Y1, X0:X1].astype(np.float32)
    if gain is None:  # background colour sampled from the empty top corners of frame 0
        bg = np.median(np.concatenate([c[:60, :80].reshape(-1, 3), c[:60, -80:].reshape(-1, 3)]), axis=0)
        gain = 255.0 / bg; print('bg', bg)
    c = np.clip(c * gain, 0, 255).astype(np.uint8)
    cv2.imwrite(f'{out}/f{i:03d}.webp', c, [cv2.IMWRITE_WEBP_QUALITY, 80]); i += 1
print('frames', i)
