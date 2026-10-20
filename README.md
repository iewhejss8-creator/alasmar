# الأسمر — Al-Asmar

موقع تجريبي لـ **محلات الأسمر** في صنعاء: أكوات تركية وإيطالية، شيلان صوف وبشمينا، وقسم VIP.
A demo website for **Al-Asmar** stores in Sana'a, Yemen: Turkish & Italian coats, wool and pashmina shawls, and a VIP section.

## 🔗 الموقع / Live demo
- https://alasmar-demo.sites.tab.bot/
- GitHub Pages: https://iewhejss8-creator.github.io/alasmar/

## 📞 أرقام التواصل / Contact
| الفرع / Branch | العنوان / Address | الرقم / Phone |
|---|---|---|
| جولة الثقافة — Al-Thaqafa | شارع الأربعين – جولة الثقافة – شارع النهدين، جوار معرض اللورد | [783 669 665](tel:+967783669665) · [واتساب / WhatsApp](https://wa.me/967783669665) |
| جولة الرويشان — Al-Ruwaishan | جولة الرويشان – مول العرب (الفرع الجديد) | [784 669 665](tel:+967784669665) · [واتساب / WhatsApp](https://wa.me/967784669665) |

(+967 Yemen)

## ✏️ كيف تعدّل الموقع بنفسك (بدون برمجة)
كل المحتوى اللي يتغيّر موجود في ملف واحد: **`data.js`**. افتحه في GitHub واضغط ✏️ (Edit)، عدّل، ثم **Commit changes**. الموقع يتحدث خلال دقيقة تقريباً.

**تغيير اسم المحل أو رقم الواتساب:** غيّر `shopName` أو `whatsapp` (الرقم بدون صفر وبدون 967، مثال `783669665`).

**إضافة فيديو جديد في «شوف بنفسك» (السحب يمين/يسار):**
1. في المستودع افتح مجلد `videos` ← **Add file** ← **Upload files** وارفع الفيديو (mp4، أقل من 25 ميجا).
2. افتح `data.js` وانسخ سطر من قائمة `films` والصقه قبل علامة `]`.
3. غيّر `video: "videos/اسم-الفيديو.mp4"` و `title` (العنوان) و `length` (المدة). إذا الفيديو مربع خلّ `square: true`.
4. احفظ (Commit). الفيديو يظهر كشريحة جديدة تلقائياً، والنقاط والأسهم تتعدّل لحالها.

**إضافة فرع جديد:**
1. في `data.js` داخل `branches` انسخ فرع كامل من `{` إلى `}` والصقه بعد آخر فرع (لا تنسى الفاصلة `,` بينهم).
2. غيّر `name` (اسم الفرع) و `address` (العنوان) و `phone` (الرقم).
3. الموقع على الخريطة: `lat` و `lng` (افتح خرائط Google واضغط مطوّلاً على المكان، تطلع الأرقام). أو حط رابط مشاركة الخريطة في `mapLink`.
4. احفظ. الفرع يظهر بالخريطة وأزرار الاتصال والواتساب والاتجاهات، والعنوان «فرعين / ٣ فروع» يتغير لحاله.

**حذف شي:** احذف سطره (أو الفرع من `{` إلى `}`) من `data.js`.

> ⚠️ عدّل فقط النصوص بين علامات التنصيص `"..."` وخلّ الفواصل والأقواس كما هي.

## 🎬 الفيديوهات
الفيديوهات محفوظة داخل هذا المستودع في مجلد `videos/` بجودتها الأصلية كاملة (720p، بدون أي ضغط إضافي)، مقسّمة لقطع صغيرة (HLS) تشتغل على أي جوال أو كمبيوتر وتبدأ بسرعة حتى على النت الضعيف. ولو صار أي خلل، الموقع يشغّل تلقائياً نسخة احتياطية من موقع العرض.
The videos live inside this repo (`videos/`, original 720p quality, split into small HLS chunks — played natively on iPhone and with `vendor/hls.light.min.js` elsewhere), with an automatic mp4 fallback on the demo host.

## 🗂️ الملفات / Files
- `data.js` — كل المحتوى: الاسم، الفيديوهات، الفروع، الأرقام / all editable content
- `index.html`, `styles.css`, `script.js` — الموقع / the site (static, no build step)
- `img/` — الصور والشعار / images & logo
- `videos/` — الفيديوهات / videos
- `media/hero5/` — صور واجهة الدخول / hero images
- `vendor/` — مشغّل الفيديو / video player library (hls.js, Apache-2.0)

افتح الموقع على GitHub Pages أو أي استضافة ثابتة. / Serve the folder with any static host.

---

**صُنع بواسطة وهج | Made by Wahaj** — The company of the new century
📲 https://wa.me/967775904946
