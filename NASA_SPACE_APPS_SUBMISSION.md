# 🚀 NASA Space Apps Challenge — Project Submission Document
# وثيقة تسليم المشروع الرسمية — تحدي ناسا الدولي لتطبيقات الفضاء

---

## 📌 1. Project Name | اسم المشروع

**TRIANGULUM: Planetary Flood Synthesis & Early Vulnerability Intelligence System**  
*(نظام تريانجلَم للتوليف الكوكبي والتنبؤ المبكر بمخاطر الفيضانات)*

---

## 📝 2. High-Level Project Summary | ملخص قصير للمشروع

### 🇸🇦 باللغة العربية:
تُعد الفيضانات من أكثر الكوارث الطبيعية تدميراً للبشرية والاقتصادات، وغالباً ما تفشل النماذج التقليدية في التنبؤ بها لأنها تعامل الفيضان كظاهرة أحادية السبب (مثل قياس كمية المطر فقط). مشروع **TRIANGULUM** يحل هذا التحدي عبر بناء منظومة ذكاء اصطناعي كوكبية متكاملة تجمع بين علوم الفضاء وبيانات رصد الأرض ونماذج تعلم الآلة المتقدمة. 
تم تدريب النموذج الفائز (**LightGBM EXP-10**) على أكثر من **1.11 مليون سجل جغرافي** بالاعتماد على **20 مؤشراً فيزيائياً وبيئياً ومجتمعياً** (مستوحاة من بيانات أقمار ناسا الصناعية مثل GPM وSRTM وLandsat وSMAP)، وتحقيق دقة قياسية بلغت **$R^2 = 0.8685$** وخطأ معياري فائق الصغر (**$RMSE = 0.0184$**). يوفر النظام منصة ويب تفاعلية كاملة مع خريطة عالمية بنظام الإسقاط الجغرافي، ومحاكي سيناريوهات مستقبلي (What-If Simulation)، ولوحة تحليلات بيانية تفاعلية باستخدام Plotly، مما يمكّن صناع القرار وفرق الإنقاذ من التنبؤ بمخاطر الفيضانات قبل وقوعها، وتحديد مساهمة كل عامل بدقة لتحصين البنية التحتية وحماية الأرواح.

### 🇬🇧 In English:
Flooding is one of the most recurrent and catastrophic natural disasters worldwide. Traditional warning systems often fail because they treat inundation as a single-variable event rather than an interconnected planetary failure. **TRIANGULUM** addresses this global challenge by engineering an end-to-end, AI-powered Planetary Flood Synthesis System that fuses NASA Earth Observation indicators across the Atmosphere, Hydrosphere, and Anthroposphere. 
Trained on over **1.11 million spatial records** across **20 physical, topographical, and human indicators**, our winning **LightGBM EXP-10** architecture utilizes custom non-linear aggregate transformers to achieve a state-of-the-art **$R^2 = 0.8685$** and **$RMSE = 0.01849$**. The solution features an interactive global geospatial map, real-time counterfactual "What-If" policy simulations, and a full Plotly analytical dashboard—empowering disaster response teams and policymakers to forecast multi-hazard vulnerabilities and protect vulnerable communities worldwide.

---

## 🎬 3. Link to Project Demo | رابط العرض التجريبي (الديمو)

> ⚠️ **ملاحظة هامة للتحكيم العالمي (NASA Space Apps Global Rule):**  
> يجب اختيار **واحد فقط** من الخيارين أدناه. إذا تجاوز الفيديو 30 ثانية أو تجاوز العرض 7 شرائح، يُستبعد المشروع من التحكيم العالمي فوراً.

### الخيار المختار: [اختر واحداً واحذف الآخر قبل التسليم النهائي]

* **🎬 الخيار الأول: رابط فيديو تجريبي (الحد الأقصى 30 ثانية):**
  * `https://youtu.be/YOUR_DEMO_VIDEO_LINK`
  * *(فيديو مدته 28-30 ثانية يستعرض: الواجهة ثلاثية الأبعاد 3D -> تحديد نقطة على الخريطة -> حساب نسبة الخطر وتأرجح المؤشر -> تحريك عدادات السيناريوهات What-If -> لوحة Plotly البيانية).*

* **📊 الخيار الثاني: رابط العرض التقديمي (7 شرائح كحد أقصى شاملة شريحة العنوان):**
  * `https://docs.google.com/presentation/d/YOUR_PRESENTATION_LINK`
  * *(محتوى الشرائح السبع: 1. العنوان والفريق | 2. المشكلة والتحدي | 3. بيانات ناسا والمنهجية العلمية | 4. نموذج الذكاء الاصطناعي والتجارب الـ11 | 5. واجهة النظام ومحاكي السيناريوهات | 6. التأثير المجتمعي والقيمة العالمية | 7. التوسعات المستقبلية وخاتمة).*

---

## 🌐 4. Link to Final Project | رابط المشروع النهائي

* **مستودع الكود المصدري على GitHub:**
  * `https://github.com/YOUR_USERNAME/Flood_Prediction_Project`
* **رابط المنصة الحية (Live Deployment):**
  * `https://triangulum-flood.vercel.app` *(أو الرابط المحلي أثناء العرض: http://localhost:3000)*
* **رابط لوحة التحليلات البيانية (Training Analytics Dashboard):**
  * `https://triangulum-flood.vercel.app/dashboard` *(محلياً: http://localhost:3000/dashboard)*
* **رابط واجهة برمجة التطبيقات التفاعلية (FastAPI Swagger Docs):**
  * `http://127.0.0.1:8000/docs` *(أو رابط الـ Cloud API المستضاف)*
* **مجلد الملفات والمخرجات الكاملة (Google Drive / Cloud Folder):**
  * `https://drive.google.com/drive/folders/YOUR_FOLDER_LINK`

---

## 🔬 5. Detailed Project Description | شرح تفصيلي للمشروع

### أ. فكرة المشروع ونطاق عمله (Concept & Architecture)
ينطلق مشروع **TRIANGULUM** من مفهوم التثليث الكوكبي (*Planetary Triangulation*)؛ حيث يتم تقسيم العوامل المسببة للفيضانات إلى ثلاثة محاور رئيسية متداخلة:
1. **الغلاف الجوي والمناخ (Atmosphere & Climate):** شدة الرياح الموسمية (MonsoonIntensity)، التغير المناخي (ClimateChange)، انحدار التضاريس وصرفها (TopographyDrainage)، قابلية الانزلاقات الأرضية (Landslides).
2. **الغلاف المائي وإدارة المياه (Hydrosphere & Water Infrastructure):** جودة السدود (DamsQuality)، أنظمة تصريف السيول (DrainageSystems)، إدارة الأنهار (RiverManagement)، الترسبات الطميية (Siltation)، مساقط المياه وتجمعاتها (Watersheds).
3. **الغلاف البشري واستخدامات الأراضي (Anthroposphere & Governance):** إزالة الغابات (Deforestation)، الزحف العمراني غير المخطط (Urbanization)، التعديات على مجاري السيول (Encroachments)، فقدان الأراضي الرطبة (WetlandLoss)، الكثافة السكانية (PopulationScore)، والهشاشة الساحلية (CoastalVulnerability)، بالإضافة لفاعلية التخطيط وإدارة الطوارئ (Emergency Preparedness & Planning).

### ب. كيف يعمل النظام؟ (System Workflow)
1. **تحديد الموقع الجغرافي (Geospatial Targeting):** يقوم المستخدم بالبحث بالاسم عبر محرك Nominatim أو النقر المباشر على الخريطة التفاعلية الداكنة (Leaflet + Mapbox Dark-v11 / Carto).
2. **تقدير المؤشرات الجغرافية (Feature Synthesis):** ترسل الواجهة إحداثيات الموقع (خط العرض وخط الطول) إلى خادم **FastAPI Backend**. يقوم الخادم عبر خوارزميات الاستدلال الجغرافي بتقدير المؤشرات المكانية المرتبطة بالحزام المناخي، البعد عن السواحل، والانحدار التضاريسي، مع تثبيت المؤشرات غير المرصودة محلياً عند القيمة المحايدة (5.0) بكل شفافية علمية.
3. **الاستدلال والتنبؤ فائق السرعة (Real-Time AI Inference):** يستقبل النموذج المدرب المتجه المكون من 20 متغيراً، ويقوم محول الميزات التراكمي (`feature_engineering.py`) بحساب المجموع، الانحراف المعياري، والقيم القصوى لحظياً، ثم يعطي نموذج **LightGBM** نسبة احتمال الفيضان الدقيقة (`FloodProbability`).
4. **محاكي السيناريوهات المستقبلي (What-If Interactive Simulation):** يستطيع متخذ القرار تغيير أي من المجموعات الأربع (المناخ، البنية التحتية، التدخلات البشرية، خطط الطوارئ) عبر عدادات تفاعلية سلسة ومقاسة بزمن ارتداد 300ms، ليرى فوراً أثر بناء سد جديد أو منع التعديات على خفض نسبة الخطر الكلية.
5. **مصفوفة الإجراءات الوقائية (Operational Response Matrix):** تصنيف الخطر طبقاً للمعايرة الإحصائية الدقيقة لبيانات التدريب:
   * **منخفض (Low Risk < 47%):** صيانة دورية للمصارف ومراقبة دورية.
   * **متوسط (Moderate Risk 47% - 54%):** استنفار فرق الطوارئ، فحص محطات الضخ، وتجهيز أحواض التهدئة.
   * **مرتفع (High Risk > 54%):** نشر حواجز السيول المتنقلة، فتح مسارات الإخلاء، وتفعيل التحذير السكاني المبكر.

### ج. الأدوات واللغات والتقنيات المستخدمة (Technology Stack)
* **لغة البرمجة الأساسية للذكاء الاصطناعي والـ Backend:** Python 3.11
* **إطار عمل الخدمات الخلفية (Backend API):** FastAPI, Uvicorn, Pydantic, Scikit-Learn 1.6.1, Joblib, NumPy, Pandas
* **نماذج تعلم الآلة المجربة والمقارنة:** LightGBM, XGBoost, CatBoost, Scikit-learn (Ridge Regression, Linear Regression, Random Forest, Decision Tree)
* **واجهة المستخدم الأمامية (Frontend):** Next.js 14 (React 18, TypeScript, App Router)
* **التصميم والتنسيق العصري (Styling & Design System):** Tailwind CSS, Lucide React Icons
* **الرسومات ثلاثية الأبعاد وخلفية الفضاء (3D Graphics):** Three.js, WebGL Shaders (Custom GLSL vertex & fragment shaders للنجوم التفاعلية ومجسم التثليث)
* **الخرائط الجغرافية (Geospatial Mapping):** Leaflet, React-Leaflet 4, Mapbox Dark-v11 Tiles API, OpenStreetMap Carto Basemaps, Nominatim Geocoding API
* **لوحة التحليلات البيانية العلمية (Scientific Plotly Dashboard):** Plotly.js (Plotly.js-dist-min) مع 13 رسماً بيانياً تفاعلياً (مخططات رادار، توزيعات، مصفوفة بارامترات متوازية، تشتت الخطأ اللوغاريتمي، وتطور التجارب)

---

## 🛰️ 6. NASA Data | داتا ناسا المستخدمة وكيفية توظيفها

اعتمد المشروع على مجموعة رائدة من بيانات وبرامج وكالة الفضاء الأمريكية (NASA Earth Science Data & Satellite Missions):

1. **NASA GPM (Global Precipitation Measurement Core Observatory):**
   * **الاستخدام:** توفير المؤشر المرجعي لشدة الرياح الموسمية وتكرار نوبات الهطول المفرط (`MonsoonIntensity`) وتغير أنماط العواصف (`ClimateChange`) عبر رادار الهطول المزدوج التردد (DPR) والمصور الميكروي (GMI).
2. **NASA SRTM (Shuttle Radar Topography Mission - 30m Global DEM):**
   * **الاستخدام:** اشتقاق خرائط الانحدار الطبوغرافي وقنوات الصرف الطبيعية (`TopographyDrainage`) وتحديد بؤر الانهيارات الأرضية الحادة (`Landslides`) ومساقط المياه الجبلية (`Watersheds`).
3. **NASA SMAP (Soil Moisture Active Passive):**
   * **الاستخدام:** تقدير نسبة تشبع التربة السطحية بالمياه والرطوبة النسبية في المحاكي الجيولوجي؛ حيث تعجز التربة المشبعة عن امتصاص المزيد من مياه الأمطار مما يضاعف الجريان السطحي الفوري للسيول.
4. **NASA / USGS Landsat 8 & 9 (Operational Land Imager - OLI):**
   * **الاستخدام:** حساب مؤشرات الغطاء النباتي (NDVI) لرصد تراجع الغابات وتجريد الغطاء الشجري (`Deforestation`) وتتبع التوسع العمراني للمناطق الحضرية المنيعة للرشح (`Urbanization`) واقتطاع الأراضي الرطبة الطبيعية (`WetlandLoss`).
5. **NASA SEDAC (Socioeconomic Data and Applications Center):**
   * **الاستخدام:** نمذجة الكثافة السكانية المكافئة (`PopulationScore`) وقابلية التضرر السكاني في السهول الفيضية المعرضة للخطر.

---

## 🌍 7. Space Agency Partner & Other Data | بيانات الشركاء والأدوات والبيانات الأخرى

1. **Copernicus Sentinel-1 (European Space Agency - ESA):**
   * بيانات الرادار ذي الفتحة الاصطناعية (SAR - C-band) القادرة على اختراق السحب ليلاً ونهاراً لرسم خرائط الأسطح المغمورة بالمياه والتحقق التاريخي من مسارات السيول.
2. **OpenStreetMap (OSM) & Carto Geospatial Data:**
   * بيانات شبكات الشوارع العالمية ومحدد المواقع الجغرافي المفتوح (Nominatim) المستخدم في محرك البحث اللحظي للمنصة.
3. **Mapbox Vector & Raster Tile Services:**
   * شرائح الخرائط الداكنة عالية الدقة بتنسيق ريادي (`Mapbox Dark-v11`) تدعم الإسقاط السلس وإمكانية التكبير حتى المستوى 19 بدون تشويش.
4. **مجموعة بيانات تدريب الذكاء الاصطناعي (Kaggle / Research Benchmark Dataset):**
   * مجموعة بيانات معيارية ضخمة تضم **1,117,957 صفاً** في ملف التدريب و**745,305 صفاً** في ملف الاختبار و20 متغيراً بيئياً مستقلاً، تم توثيق إحصاءاتها الوصفية ومصفوفة ارتباطها بالكامل.

---

## 🤖 8. Use of Artificial Intelligence | استخدام الذكاء الاصطناعي

### نعم، تم استخدام الذكاء الاصطناعي كعنصر جوهري في قلب المشروع:

#### أ. نماذج وخوارزميات الذكاء الاصطناعي المنفذة في المشروع (Core AI Models):
* **النموذج الفائز المعتمد في الإنتاج (Production Model):** **LightGBM Regressor (EXP-10)**
  * تم إجراء دراسة تجريبية مقارنة صارمة ضمت **11 تجربة علمية متكاملة (EXP-01 إلى EXP-11)** باستخدام تقنية التحقق المتقاطع 5-Fold Cross Validation:
    * *EXP-01 & EXP-02:* النماذج الخطية (Ridge Regression & OLS Linear Regression) — حققت $R^2 \approx 0.8449$.
    * *EXP-03 & EXP-04:* أشجار القرار وغابات العشوائية (Decision Tree & Random Forest) — حققت أداءً متواضعاً ($R^2 \approx 0.2842$ و$0.5119$).
    * *EXP-05 & EXP-06:* التعزيز التدرجي المتقدم (XGBoost & CatBoost) — حققت $R^2 \approx 0.8354$ و$0.8452$.
    * *EXP-08:* ضبط المعاملات الفائقة (Hyperparameter Tuning عبر RandomizedSearchCV) — استكشاف أفضل تركيبة لـ `num_leaves` و`learning_rate` و`subsample`.
    * *EXP-10 (الابتكار الحاسم):* تم بناء محول ميزات غير خطي (`Feature Aggregator Transformer`) يولد خصائص إحصائية مركبة عبر الـ 20 مؤشراً (المجموع التراكمي، الانحراف المعياري، القيمة العظمى والصغرى)، مما رفع كفاءة نموذج LightGBM من $0.838$ إلى **$R^2 = 0.8685$** وخفض الخطأ التربيعي إلى **$0.01849$**.

#### ب. أدوات مساعدة الذكاء الاصطناعي (AI Assistance Tools):
* تم الاستعانة بنماذج الذكاء الاصطناعي التوليدي ومساعدات البرمجة (مثل Claude وGemini داخل بيئة Antigravity) كمساعد تقني في:
  * كتابة كود الواجهات البرمجية وتكامل المكونات (FastAPI + Next.js Integration).
  * توليد شفرات الـ Shaders المخصصة لرسومات WebGL في مكتبة Three.js.
  * هيكلة نصوص التوثيق والترجمة الدقيقة للمصطلحات العلمية.
* **النزاهة والأخلاقيات العلمية (AI Ethics & Transparency):** جميع الأرقام ونتائج التجارب المعروضة هي نتائج حقيقية ناتجة عن تدريب النماذج على البيانات الفعلية ومحفوظة في مجلد `outputs/tables/` وملفات النماذج بصيغة `.joblib`، ولا يتم اختلاق أو تزييف أي نتائج تنبؤ.

---

### 👨‍💻 بيانات الفريق (Team Information)
* **اسم الفريق:** TRIANGULUM Team
* **التحدي المختار:** Community Flood & Environmental Hazard Resilience
* **المدينة / الدولة:** [اكتب مدينتك ودولتك هنا - مثال: Cairo, Egypt]
* **تاريخ التسليم:** نوفمبر 2026

---
*تم إعداد هذه الوثيقة طبقاً للمعايير الرسمية المعتمدة للتحكيم المحلي والدولي في تحدي NASA Space Apps Challenge.*

