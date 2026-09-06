from PIL import Image, ImageDraw
from pathlib import Path
w,h=4200,3200
img=Image.new("RGB",(w,h),(40,40,40))
d=ImageDraw.Draw(img)
for i in range(0,w,3):
  d.line([(i,0),(i,h)], fill=(i%255,(i*3)%255,(i*7)%255))
for j in range(0,h,5):
  d.line([(0,j),(w,j)], fill=((j*5)%255,(j*2)%255,j%255))
out=Path("evidence/test-upload-large.jpg")
img.save(out,"JPEG",quality=98)
print(out.stat().st_size)
