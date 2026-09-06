from PIL import Image
import os
src="/workspace/hfs-version2.0/evidence/test-upload-9mb.jpg"
img=Image.open(src)
w,h=img.size
long=max(w,h)
scale=2400/long if long>2400 else 1
nw,nh=int(w*scale),int(h*scale)
img=img.resize((nw,nh), Image.Resampling.LANCZOS)
out="/workspace/hfs-version2.0/evidence/test-upload-compressed.jpg"
img.save(out,"JPEG",quality=82,optimize=True)
print(out, os.path.getsize(out), nw, nh)
