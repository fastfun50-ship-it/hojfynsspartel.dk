from PIL import Image
import os
w,h=4500,3200
img=Image.new("RGB",(w,h))
px=img.load()
for y in range(0,h,4):
  for x in range(0,w,4):
    c=((x*37+y*17)%256,(x*13+y*53)%200+30,(x+y)%180+40)
    for dy in range(4):
      for dx in range(4):
        if x+dx<w and y+dy<h: px[x+dx,y+dy]=c
out="/workspace/hfs-version2.0/evidence/test-upload-9mb.jpg"
os.makedirs("/workspace/hfs-version2.0/evidence",exist_ok=True)
img.save(out,"JPEG",quality=95,optimize=False)
print(out, os.path.getsize(out))
