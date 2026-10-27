'use client';

import StorefrontFooter from '@/components/StorefrontFooter';
import StorefrontHeader from '@/components/StorefrontHeader';
import { useLocale } from '@/components/LocaleProvider';

type PolicySection = { title: string; clauses: string[] };

const arabicSections: PolicySection[] = [
  { title: '1. مقدمة ونطاق السياسة', clauses: [
    'توضح هذه السياسة كيفية تعامل AYOUBIA HOME مع المعلومات عند زيارة الموقع أو التواصل معنا أو تقديم طلب شراء.',
    'تسري السياسة على البيانات التي تقدمها مباشرة وعلى بعض المعلومات التقنية اللازمة لتشغيل الموقع.',
    'نستخدم المعلومات لأغراض محددة مرتبطة بالمتجر والخدمة، ونسعى إلى جمع القدر اللازم فقط.',
    'يرجى قراءة هذه الصفحة قبل إنشاء حساب أو إرسال طلب أو التقدم إلى وظيفة.',
  ] },
  { title: '2. الجهة المسؤولة وطرق الاتصال', clauses: [
    'الجهة المسؤولة عن معالجة بيانات المتجر هي AYOUBIA HOME.',
    'لأسئلة الخصوصية أو طلبات الوصول والتصحيح، تواصل مع فريق الدعم عبر Ayoubia.Support@gmail.com.',
    'للاستفسارات المتعلقة بالتوصيل، استخدم Ayoubia.Delivery@gmail.com.',
    'يمكنك التواصل هاتفياً مع Linge على 0655791424 أو مع المتجر والموظفين على 0666404303.',
  ] },
  { title: '3. البيانات التي تقدمها عند الشراء', clauses: [
    'نجمع الاسم واللقب ورقم الهاتف لتسجيل الطلب والتواصل بشأنه.',
    'نجمع الولاية والدائرة والعنوان أو أقرب نقطة دالة لتنظيم التوصيل.',
    'قد نسجل المنتجات والكميات والألوان المختارة وقيمة الطلب وحالته.',
    'يمكنك تقديم رقم هاتف ثانٍ أو ملاحظات إضافية اختيارياً عندما يكون الحقل متاحاً.',
  ] },
  { title: '4. بيانات الحساب والملف الشخصي', clauses: [
    'عند إنشاء حساب قد نعالج بريدك الإلكتروني واسمك ورقم هاتفك ومعلومات الملف الشخصي.',
    'إذا اخترت تسجيل الدخول عبر مزود خارجي، نتلقى بيانات الحساب الأساسية التي يسمح بها ذلك المزود.',
    'يمكنك إضافة صورة شخصية أو تعديل معلومات ملفك من صفحة الحساب.',
    'لا نطلب كلمة مرور حسابك الخارجي ولا نطّلع عليها.',
  ] },
  { title: '5. معلومات التوظيف والسيرة الذاتية', clauses: [
    'إذا تقدمت لوظيفة، نجمع الاسم الكامل والبريد الإلكتروني ورقم الهاتف والوظيفة المطلوبة.',
    'تُرفع السيرة الذاتية بصيغة PDF إلى مساحة تخزين مخصصة وخاصة.',
    'تستخدم بيانات التوظيف لتقييم الطلب والتواصل مع المتقدم بشأن الفرص المهنية.',
    'لا تستخدم بيانات التوظيف لأغراض التسويق أو لإكمال طلبات الشراء.',
  ] },
  { title: '6. المعلومات التقنية وملفات السجل', clauses: [
    'قد يعالج الموقع معلومات تقنية مثل نوع المتصفح والجهاز والصفحات التي تمت زيارتها.',
    'قد تُسجل بيانات أساسية عن الزيارة للمساعدة على تشغيل الموقع وقياس استخدامه.',
    'قد تُستخدم سجلات الحماية لتحديد النشاط غير المعتاد ومعالجة الأعطال.',
    'نحد من الوصول إلى السجلات ونستخدمها للأغراض التشغيلية والأمنية.',
  ] },
  { title: '7. كيف نستخدم بيانات الطلب', clauses: [
    'نستخدم بيانات الاتصال لتأكيد تفاصيل الطلب والرد على استفساراتك.',
    'نستخدم بيانات العنوان والولاية والدائرة لإرسال الطلب إلى وجهته.',
    'نستخدم سجل الطلب لتحديث حالته وتمكين خدمة التتبع.',
    'قد نحتفظ بمعلومات الطلب اللازمة لمعالجة المرتجعات أو الشكاوى أو الالتزامات المحاسبية.',
  ] },
  { title: '8. تحسين الخدمات وتجربة الموقع', clauses: [
    'نراجع بيانات الاستخدام المجمعة لفهم الصفحات والمنتجات الأكثر اهتماماً.',
    'نستخدم ملاحظاتك لتحسين عرض المنتجات وسهولة الطلب وخدمة العملاء.',
    'قد نحلل الأعطال التقنية كي نرفع استقرار الموقع وسرعة الاستجابة.',
    'لا يعني التحليل الآلي اتخاذ قرار مؤثر بحقك دون مراجعة مناسبة.',
  ] },
  { title: '9. الأساس والغرض من المعالجة', clauses: [
    'نعالج البيانات لتنفيذ طلبك والخطوات التي تسبق التسليم أو تليه.',
    'نعالج بعض البيانات لتقديم خدمات الحساب والتتبع التي تطلبها.',
    'قد نعالج بيانات محدودة لحماية الموقع ومنع إساءة الاستخدام أو الاحتيال.',
    'عندما يتطلب الأمر موافقتك، نطلبها قبل تنفيذ الغرض المعني ويمكنك سحبها للمستقبل.',
  ] },
  { title: '10. الدفع والبيانات المالية', clauses: [
    'يعتمد المتجر حالياً على الدفع عند الاستلام ما لم يُذكر خلاف ذلك بوضوح.',
    'لا نطلب بيانات البطاقة البنكية ولا نخزن رقمها أو رمزها في نموذج الطلب الحالي.',
    'إذا أضيفت وسيلة دفع إلكترونية مستقبلاً، فسوف تُعرض معلوماتها ومزودها قبل الدفع.',
    'لا ترسل بيانات بطاقة أو رمز تحقق عبر الهاتف أو البريد الإلكتروني إلى فريق المتجر.',
  ] },
  { title: '11. ملفات تعريف الارتباط والتخزين المحلي', clauses: [
    'قد يستخدم الموقع ملفات تعريف ارتباط أو تخزيناً محلياً لحفظ تفضيلات اللغة ومحتوى السلة.',
    'قد تكون بعض تقنيات التخزين ضرورية لتسجيل الدخول أو حماية الجلسة.',
    'يمكنك إدارة ملفات الارتباط من إعدادات المتصفح، وقد يؤدي تعطيل بعضها إلى توقف وظائف معينة.',
    'لا نستخدم هذه التقنيات لقراءة ملفاتك الشخصية خارج نطاق الموقع.',
  ] },
  { title: '12. خدمات الاستضافة ومقدمو الخدمات', clauses: [
    'يستعين الموقع بمزودي خدمات تقنية لاستضافة الموقع وقاعدة البيانات وتخزين الملفات.',
    'قد تتم معالجة البيانات لدى مزود الخدمة بالقدر اللازم لتقديم الاستضافة أو التخزين.',
    'نختار الخدمات بما يتناسب مع احتياجات التشغيل، ونقيد الوصول إلى بيانات العملاء داخل المتجر.',
    'تخضع معالجة مزودي الخدمات لشروطهم الفنية والتعاقدية وسياساتهم المنشورة.',
  ] },
  { title: '13. مشاركة المعلومات', clauses: [
    'نشارك بيانات التوصيل مع العاملين أو الشركاء المكلفين بإيصال طلبك فقط بالقدر الضروري.',
    'لا نبيع قوائم العملاء أو بياناتهم الشخصية لأطراف أخرى.',
    'قد نكشف معلومات محدودة عند وجود طلب قانوني واجب التطبيق أو لحماية الحقوق والسلامة.',
    'قد تُنقل بيانات تشغيلية عند إعادة تنظيم النشاط، مع مراعاة استمرار الحماية المناسبة.',
  ] },
  { title: '14. التحويلات ومكان المعالجة', clauses: [
    'قد يستضيف مزود تقني بيانات الموقع في مراكز بيانات خارج الولاية التي تقيم فيها.',
    'نقصر هذا النقل على ما يلزم لتشغيل الخدمات التقنية التي يعتمد عليها الموقع.',
    'تطبق مزودات الخدمة تدابير حماية مختلفة بحسب الخدمة وموقع البنية التحتية.',
    'يمكنك مراسلتنا لمعرفة مزود الخدمة المستخدم في عملية معينة.',
  ] },
  { title: '15. مدة الاحتفاظ بالبيانات', clauses: [
    'نحتفظ ببيانات الطلب ما دام ذلك ضرورياً لتنسيق التسليم وخدمة ما بعد البيع.',
    'قد نحتفظ بسجلات معينة للمدة اللازمة للالتزامات القانونية أو لتسوية النزاعات.',
    'نحتفظ ببيانات الحساب ما دام الحساب قائماً أو إلى حين معالجة طلب الحذف، مع مراعاة الالتزامات المشروعة.',
    'نراجع البيانات التي لم تعد لازمة ونحذفها أو نزيل ما يعرّف بصاحبها عندما يكون ذلك مناسباً.',
  ] },
  { title: '16. حماية المعلومات', clauses: [
    'نستخدم ضوابط تقنية وتنظيمية للحد من الوصول غير المصرح به أو الفقد أو التغيير.',
    'تُمنح صلاحيات الأنظمة للعاملين وفق الحاجة إلى أداء مهامهم.',
    'لا توجد وسيلة نقل أو تخزين إلكترونية تضمن الأمان المطلق في جميع الظروف.',
    'يرجى اختيار كلمة مرور قوية وعدم مشاركتها، وإبلاغنا إذا اشتبهت في استخدام حسابك دون إذن.',
  ] },
  { title: '17. حقوقك وطلباتك', clauses: [
    'يمكنك طلب معلومات عن البيانات التي نعالجها بشأنك، وفق الإجراءات والقواعد المعمول بها.',
    'يمكنك طلب تصحيح المعلومات غير الدقيقة أو استكمال البيانات الناقصة.',
    'يمكنك الاعتراض على بعض أنواع المعالجة أو طلب حذف البيانات عندما ينطبق ذلك.',
    'قد نطلب معلومات معقولة للتحقق من هويتك قبل تنفيذ الطلب حمايةً لك.',
  ] },
  { title: '18. كيفية تقديم طلب خصوصية', clauses: [
    'أرسل طلبك إلى Ayoubia.Support@gmail.com مع شرح الإجراء الذي تريده.',
    'اذكر وسيلة تواصل مناسبة ولا ترسل كلمة المرور أو معلومات البطاقة.',
    'سنتحقق من الطلب ونرد عبر وسيلة تواصل مناسبة خلال مدة معقولة.',
    'قد نحتفظ بجزء من البيانات إذا كان الاحتفاظ مطلوباً أو مسموحاً به لمعالجة التزام قائم.',
  ] },
  { title: '19. الحسابات وتسجيل الدخول الخارجي', clauses: [
    'يمكنك تصفح المنتجات وإتمام الطلب كضيف، أما بعض الميزات فتتطلب حساباً.',
    'يمكنك مراجعة معلومات حسابك وتحديث البيانات المتاحة في صفحة الملف الشخصي.',
    'يخضع تسجيل الدخول عبر Google لسياسة الخصوصية الخاصة بمزود تسجيل الدخول أيضاً.',
    'عند تسجيل الخروج، تنتهي جلسة الموقع على الجهاز الحالي؛ احرص على ذلك في الأجهزة المشتركة.',
  ] },
  { title: '20. بيانات الأطفال', clauses: [
    'المتجر وخدماته موجهة إلى الأشخاص القادرين على تقديم طلب شراء بأنفسهم أو عبر وليهم.',
    'لا نسعى إلى جمع بيانات الأطفال عمداً لأغراض تسويقية.',
    'إذا كنت ولياً وتعتقد أن طفلاً أرسل بياناته، يرجى التواصل مع فريق الدعم.',
    'سنتحقق من البلاغ ونتخذ الإجراء المناسب ضمن الإمكانات والمتطلبات المعمول بها.',
  ] },
  { title: '21. الروابط والمواقع الخارجية', clauses: [
    'قد يتضمن الموقع روابط إلى خرائط أو شبكات اجتماعية أو خدمات خارجية.',
    'عند الانتقال إلى موقع آخر، تصبح معالجة بياناتك خاضعة لسياسة ذلك الموقع.',
    'لا نتحكم في ممارسات الخصوصية أو محتوى الخدمات الخارجية.',
    'ننصح بمراجعة سياسة الموقع الخارجي قبل تقديم بيانات شخصية إليه.',
  ] },
  { title: '22. التواصل والعروض التسويقية', clauses: [
    'نستخدم الهاتف أو البريد للرد على طلبك وإرسال معلومات ضرورية عن التوصيل.',
    'لا نرسل رسائل تسويقية دورية إلا إذا كانت الميزة مفعّلة وبما يتفق مع القواعد ذات الصلة.',
    'يمكنك طلب التوقف عن الرسائل الترويجية في أي وقت.',
    'قد تستمر الرسائل التشغيلية الضرورية المتعلقة بطلب قائم بعد إلغاء الرسائل التسويقية.',
  ] },
  { title: '23. التغييرات على هذه السياسة', clauses: [
    'قد نحدّث هذه السياسة عند تغيير وظائف الموقع أو الخدمات التي نعتمد عليها.',
    'ننشر النسخة المعدلة على هذه الصفحة ونحدّث تاريخ المراجعة.',
    'تسري التغييرات على الاستخدام اللاحق للموقع من تاريخ نشرها.',
    'إذا كان التغيير يتطلب موافقة جديدة، فسنعرض طلب الموافقة بالطريقة المناسبة.',
  ] },
  { title: '24. الشكاوى والاستفسارات', clauses: [
    'إذا كان لديك سؤال أو شكوى، ابدأ بالتواصل معنا عبر Ayoubia.Support@gmail.com.',
    'اشرح المشكلة بوضوح وأرفق رقم الطلب فقط عند ارتباط الاستفسار بطلب شراء.',
    'نراجع المراسلات ونحاول معالجة المخاوف المتعلقة ببياناتك بجدية.',
    'تظل لك حقوق اللجوء إلى الجهات المختصة وفق القواعد المعمول بها.',
  ] },
  { title: '25. آخر مراجعة', clauses: [
    'أُعدت هذه الصفحة لتشرح ممارسات الموقع بصورة واضحة ومباشرة.',
    'تعكس السياسة الوظائف المتاحة حالياً وقد تحتاج إلى تحديث إذا تغيرت الخدمة.',
    'يرجى مراجعة الصفحة من وقت لآخر للاطلاع على أي تحديثات.',
    'آخر مراجعة: 27 أكتوبر 2026.',
  ] },
];

const frenchSections: PolicySection[] = [
  { title: '1. Introduction et champ d’application', clauses: ['Cette politique explique comment AYOUBIA HOME traite les informations lors de la visite du site, d’un contact ou d’une commande.', 'Elle couvre les données que vous fournissez et certaines informations techniques nécessaires au fonctionnement du site.', 'Nous utilisons les informations pour des objectifs liés à la boutique et cherchons à limiter la collecte au nécessaire.', 'Veuillez lire cette page avant de créer un compte, de commander ou de postuler.'] },
  { title: '2. Responsable et contacts', clauses: ['AYOUBIA HOME est responsable du traitement des données de la boutique.', 'Pour toute question de confidentialité ou demande d’accès et de rectification : Ayoubia.Support@gmail.com.', 'Pour la livraison : Ayoubia.Delivery@gmail.com.', 'Vous pouvez joindre Linge au 0655791424 et le magasin et son équipe au 0666404303.'] },
  { title: '3. Données fournies lors d’une commande', clauses: ['Nous recueillons vos nom et prénom ainsi que votre téléphone pour enregistrer et suivre la commande.', 'La wilaya, la daïra et l’adresse ou le repère servent à organiser la livraison.', 'Nous pouvons enregistrer les produits, quantités, couleurs, montant et statut de la commande.', 'Un second téléphone et des remarques peuvent être fournis facultativement.'] },
  { title: '4. Compte et profil', clauses: ['La création d’un compte peut nécessiter votre adresse e-mail, votre nom, votre téléphone et des informations de profil.', 'Avec un fournisseur de connexion externe, nous recevons les informations de base autorisées par ce fournisseur.', 'Vous pouvez ajouter une photo de profil ou modifier les informations disponibles sur la page du compte.', 'Nous ne demandons pas et ne voyons pas le mot de passe de votre compte externe.'] },
  { title: '5. Candidatures et CV', clauses: ['Une candidature comprend le nom complet, l’e-mail, le téléphone et le poste souhaité.', 'Le CV PDF est envoyé vers un espace de stockage dédié et privé.', 'Ces données servent à examiner la candidature et à contacter le candidat au sujet d’opportunités.', 'Les données de recrutement ne servent pas au marketing ni au traitement des commandes.'] },
  { title: '6. Informations techniques', clauses: ['Le site peut traiter des informations techniques comme le navigateur, l’appareil et les pages consultées.', 'Des données de visite élémentaires peuvent être consignées pour exploiter le site et mesurer son usage.', 'Des journaux de sécurité peuvent aider à détecter une activité inhabituelle et résoudre des incidents.', 'L’accès à ces journaux est limité à des besoins opérationnels et de sécurité.'] },
  { title: '7. Utilisation des données de commande', clauses: ['Nous utilisons vos coordonnées pour confirmer les détails et répondre à vos questions.', 'Les informations d’adresse servent à acheminer la commande.', 'L’historique permet de mettre à jour le statut et de proposer le suivi.', 'Certaines informations peuvent être conservées pour les retours, réclamations ou obligations comptables.'] },
  { title: '8. Amélioration du service', clauses: ['Des données d’usage agrégées peuvent indiquer les pages et produits les plus consultés.', 'Vos retours servent à améliorer les fiches produits, la commande et le service client.', 'L’analyse d’incidents techniques peut améliorer la stabilité et la rapidité du site.', 'Une analyse automatique ne constitue pas à elle seule une décision importante vous concernant.'] },
  { title: '9. Finalités du traitement', clauses: ['Nous traitons les données pour exécuter votre commande et organiser les étapes de livraison.', 'Certaines données permettent de fournir le compte et le suivi que vous demandez.', 'Des informations limitées peuvent protéger le site contre les abus et la fraude.', 'Lorsque votre accord est nécessaire, nous le sollicitons avant la finalité concernée.'] },
  { title: '10. Paiements et données financières', clauses: ['La boutique propose actuellement le paiement à la livraison, sauf indication claire contraire.', 'Le formulaire actuel ne demande ni numéro ni code de carte bancaire et ne les conserve pas.', 'Toute future option de paiement électronique sera présentée avec son prestataire avant le paiement.', 'Ne communiquez pas les données de carte ou codes de vérification par téléphone ou e-mail.'] },
  { title: '11. Cookies et stockage local', clauses: ['Le site peut utiliser des cookies ou le stockage local pour mémoriser la langue et le panier.', 'Certains mécanismes sont nécessaires à la connexion ou à la protection de la session.', 'Vous pouvez gérer les cookies dans votre navigateur ; leur désactivation peut limiter certaines fonctions.', 'Ces technologies ne permettent pas de lire vos fichiers personnels hors du site.'] },
  { title: '12. Hébergement et prestataires', clauses: ['Des prestataires techniques hébergent le site, la base de données et certains fichiers.', 'Ils ne traitent les données que dans la mesure nécessaire à la prestation technique.', 'L’accès interne aux données client est limité aux besoins de fonctionnement.', 'Les prestataires appliquent leurs conditions techniques et politiques publiées.'] },
  { title: '13. Communication des données', clauses: ['Les informations de livraison sont communiquées aux personnes chargées de la livraison dans la limite du nécessaire.', 'Nous ne vendons pas de listes ou données personnelles à des tiers.', 'Des informations limitées peuvent être communiquées en réponse à une obligation légale ou pour protéger des droits.', 'Une réorganisation peut entraîner le transfert de données avec des protections appropriées.'] },
  { title: '14. Lieu de traitement', clauses: ['Un prestataire peut héberger des données dans un centre de données situé hors de votre wilaya.', 'Le transfert est limité aux besoins des services techniques utilisés par le site.', 'Les mesures de protection varient selon le prestataire et l’emplacement de son infrastructure.', 'Vous pouvez nous contacter pour connaître le prestataire concerné par un traitement.'] },
  { title: '15. Durée de conservation', clauses: ['Les données de commande sont conservées le temps nécessaire à la livraison et au service après-vente.', 'Certains dossiers peuvent être conservés pour satisfaire une obligation légale ou régler un litige.', 'Les données du compte sont conservées tant que le compte existe, sous réserve des obligations applicables.', 'Les données qui ne sont plus nécessaires sont supprimées ou rendues non identifiantes lorsque cela convient.'] },
  { title: '16. Sécurité', clauses: ['Des mesures techniques et organisationnelles visent à réduire les accès non autorisés, pertes et modifications.', 'Les accès aux systèmes sont accordés selon les tâches des personnes autorisées.', 'Aucun moyen électronique ne garantit une sécurité absolue dans toutes les circonstances.', 'Choisissez un mot de passe robuste et signalez-nous tout usage suspect de votre compte.'] },
  { title: '17. Vos droits', clauses: ['Vous pouvez demander des informations sur les données traitées à votre sujet, selon les règles applicables.', 'Vous pouvez demander la rectification d’informations inexactes ou incomplètes.', 'Vous pouvez vous opposer à certains traitements ou demander l’effacement lorsque cela s’applique.', 'Nous pouvons demander des éléments raisonnables pour vérifier votre identité.'] },
  { title: '18. Exercer vos droits', clauses: ['Envoyez votre demande à Ayoubia.Support@gmail.com en précisant l’action souhaitée.', 'Indiquez un moyen de réponse et ne transmettez ni mot de passe ni données de carte.', 'Nous examinerons la demande et répondrons par un canal approprié dans un délai raisonnable.', 'Certaines données peuvent être conservées si une obligation ou un besoin légitime l’exige.'] },
  { title: '19. Connexion au compte', clauses: ['Vous pouvez consulter les produits et commander comme invité ; certaines fonctions demandent un compte.', 'Les informations disponibles peuvent être consultées et modifiées depuis la page de profil.', 'La connexion Google est également soumise à la politique du fournisseur de connexion.', 'Déconnectez-vous après usage sur un appareil partagé.'] },
  { title: '20. Données des enfants', clauses: ['La boutique s’adresse aux personnes pouvant passer commande elles-mêmes ou par leur représentant légal.', 'Nous ne cherchons pas à collecter volontairement des données d’enfants à des fins marketing.', 'Un parent ou représentant peut contacter l’assistance s’il pense qu’un enfant nous a transmis des données.', 'Nous examinerons le signalement et prendrons les mesures appropriées.'] },
  { title: '21. Liens externes', clauses: ['Le site peut contenir des liens vers des cartes, réseaux sociaux ou services externes.', 'Une fois sur un autre site, sa propre politique régit le traitement de vos données.', 'Nous ne contrôlons pas les pratiques de confidentialité des services externes.', 'Consultez leur politique avant d’y transmettre des informations personnelles.'] },
  { title: '22. Communications commerciales', clauses: ['Nous utilisons téléphone ou e-mail pour répondre et envoyer les informations nécessaires à la livraison.', 'Les messages promotionnels ne sont envoyés que si cette fonction est activée et selon les règles applicables.', 'Vous pouvez demander à ne plus recevoir de communications promotionnelles.', 'Les messages opérationnels liés à une commande peuvent continuer après ce choix.'] },
  { title: '23. Modifications', clauses: ['Cette politique peut évoluer lorsque les fonctions du site ou ses prestataires changent.', 'La version mise à jour est publiée ici avec une nouvelle date de révision.', 'Les changements s’appliquent aux usages ultérieurs du site à compter de leur publication.', 'Si une nouvelle autorisation est nécessaire, nous vous la demanderons de manière appropriée.'] },
  { title: '24. Réclamations et questions', clauses: ['Pour toute question ou réclamation, contactez d’abord Ayoubia.Support@gmail.com.', 'Expliquez clairement votre demande et indiquez un numéro de commande uniquement si nécessaire.', 'Nous examinons sérieusement les préoccupations liées à vos données.', 'Vous conservez la possibilité de contacter les autorités compétentes conformément aux règles applicables.'] },
  { title: '25. Dernière révision', clauses: ['Cette page décrit les pratiques du site de manière accessible.', 'Elle reflète les fonctions actuellement disponibles et pourra évoluer avec le service.', 'Nous vous invitons à consulter cette page de temps à autre.', 'Dernière révision : 27 octobre 2026.'] },
];

export default function PrivacyPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const sections = ar ? arabicSections : frenchSections;
  return <>
    <StorefrontHeader />
    <main className="legal-page" dir={ar ? 'rtl' : 'ltr'}>
      <header className="legal-hero">
        <span className="eyebrow">AYOUBIA HOME · {ar ? 'الخصوصية' : 'CONFIDENTIALITÉ'}</span>
        <h1>{ar ? 'سياسة الخصوصية' : 'Politique de confidentialité'}</h1>
        <p>{ar ? 'نوضح هنا البيانات التي نستخدمها، ولماذا نحتاج إليها، وكيف يمكنك إدارة حقوقك.' : 'Découvrez les données utilisées, leurs finalités et la manière d’exercer vos droits.'}</p>
      </header>
      <div className="legal-content">
        {sections.map((section) => <section className="legal-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.clauses.map((clause, index) => <p key={index}>{clause}</p>)}
        </section>)}
      </div>
    </main>
    <StorefrontFooter />
  </>;
}
