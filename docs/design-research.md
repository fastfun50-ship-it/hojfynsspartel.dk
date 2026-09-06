# HFS design-research (GRØN) — Match kan genbruge
## 1) 5 trends der holder
- **Layout:** luft + 1-kol mobil→bred case-grid; CTA/tlf early over fold.
- **Type:** fluid `clamp()`; ≤2 families; stærk H1; body ~16–18px.
- **Photo:** ægte projekt/før-efter/detail; fuld bredde; alt — ingen stock.
- **Motion:** CSS micro-fade; `prefers-reduced-motion`; ingen loop-video.
- **Perf:** LCP≤2.5s; WebP/AVIF+srcset; lazy below-fold; WOFF2 selvhost.
## 2) 5 trends vi SPRINGER over
Tung 3D; auto-carousel; 12 MB hero-video; ulæselig tekst på foto; infinite parallax/scroll-jack.
## 3) 3 nordiske i ligaen (håndværk/interior/studio)
1. [Norm Architects](https://normcph.com/) — projekt-første grid, materialefotos, rolig type.
2. [St. Leo](https://stleointeriors.com/) — CPH paint/plaster; taktile overflader, klar stemme.
3. [Reform](https://www.reformcph.com/en/) — craft CTA (samples/showroom/pris) + ærlige fotos.
## 4) 3 kode-ting Execution (Astro/MDN verified)
1. **Images:** Astro `Image`/`Picture` → WebP + auto srcset/sizes; compress før upload.
2. **Fluid type:** `font-size: clamp(min, preferred-vw, max)` (MDN).
3. **375-first:** design/test fra 375px; min-width MQ; touch ≥44px.
## 5) Ét HFS-forslag
**Gør** case-grid + før/efter + «Ring/Få tilbud» over fold. **Drop** hero-video, carousel, dekorativ 3D.
Sources: https://docs.astro.build/en/guides/images/ · https://developer.mozilla.org/en-US/docs/Web/CSS/clamp · https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images · https://normcph.com/ · https://stleointeriors.com/