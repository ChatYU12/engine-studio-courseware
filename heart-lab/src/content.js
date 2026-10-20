export const STRUCTURES = {
  'right-atrium': {name:'右心房',en:'RIGHT ATRIUM',tag:'静脉回流的接收腔',body:'接收上腔静脉、下腔静脉和冠状窦回流。血液经右房室口的三尖瓣进入右心室。成人正常循环中静脉回流并非每一时刻都只靠心房“挤压”；大部分心室充盈在舒张期被动完成。',check:'指出上、下腔静脉和冠状窦开口；解释房室瓣为何不需要主动“拉开”。'},
  'left-atrium': {name:'左心房',en:'LEFT ATRIUM',tag:'肺静脉回流的接收腔',body:'后方接收四条肺静脉（通常左右各两条）回流。血液经左房室口的二尖瓣进入左心室。肺静脉内是经肺气体交换后的相对富氧血。',check:'从肺毛细血管开始，追踪到左心房，再指出离开左心房的瓣膜。'},
  'right-ventricle': {name:'右心室',en:'RIGHT VENTRICLE',tag:'肺循环泵',body:'经三尖瓣接收右心房血液，收缩时经肺动脉瓣射入肺动脉干。右室壁较左室薄，因为肺循环的血管阻力与所需驱动压力较低。',check:'找到右室流出道、肺动脉瓣和肺动脉干；指出房室瓣支持装置。'},
  'left-ventricle': {name:'左心室',en:'LEFT VENTRICLE',tag:'体循环泵',body:'经二尖瓣接收左心房血液，收缩时经主动脉瓣射入主动脉。左室心肌层厚于右室，需要建立较高压力以驱动高阻力体循环。稳定状态下左右心室每搏输出量相匹配。',check:'从二尖瓣入口追踪到主动脉瓣出口；解释左室壁较厚而每搏量仍需与右室匹配。'},
  'septa': {name:'房间隔与室间隔',en:'CARDIAC SEPTA',tag:'心腔分隔与传导屏障',body:'房间隔分隔左右心房，室间隔分隔左右心室。房室交界处的纤维骨架使心房肌与心室肌不能在整个交界面直接电传导；正常传导需经房室结—房室束通路进入心室。',check:'模型中打开“隔膜”，观察室间隔与束支走行关系；理解正常状态下左右心不发生心腔间混流。'},
  'tricuspid-valve': {name:'三尖瓣',en:'TRICUSPID VALVE',tag:'右房室瓣',body:'位于右房室口，典型为三个瓣叶。瓣叶经腱索连接乳头肌。舒张期当右房压高于右室压时开放；心室收缩使右室压超过右房压后关闭。',check:'切换至“腱索/乳头肌”图层；等容收缩阶段确认三尖瓣关闭。'},
  'mitral-valve': {name:'二尖瓣',en:'MITRAL VALVE',tag:'左房室瓣',body:'位于左房室口，通常有前、后两个瓣叶，又称僧帽瓣。腱索和乳头肌在室缩时绷紧，帮助限制瓣叶向心房侧翻转；瓣膜启闭由瓣两侧压差决定。',check:'等容收缩阶段左室容积不变、二尖瓣关闭；乳头肌不是打开瓣膜的“发动机”。'},
  'pulmonary-valve': {name:'肺动脉瓣',en:'PULMONARY VALVE',tag:'右室流出道半月瓣',body:'位于右心室与肺动脉干之间，典型由三个半月形瓣叶构成。右室压力超过肺动脉压力时开放；舒张初期短暂回流使瓣叶对合关闭。无腱索和乳头肌。',check:'比较右室与肺动脉压力曲线；观察射血时开放、等容舒张时关闭。'},
  'aortic-valve': {name:'主动脉瓣',en:'AORTIC VALVE',tag:'左室流出道半月瓣',body:'位于左心室与主动脉之间，典型有三个半月瓣。左室压力超过主动脉压后开放；舒张初期主动脉短暂反流使瓣叶关闭，产生第二心音的组成部分。无腱索和乳头肌。',check:'把“瓣开放”解释为压差结果，不要按电信号或主动控制开关来记。'},
  'aorta': {name:'主动脉与主动脉弓',en:'AORTA',tag:'体循环动脉主干',body:'主动脉从左心室发出，依次包括升主动脉、主动脉弓和降主动脉。主动脉弓三大分支通常为头臂干、左颈总动脉、左锁骨下动脉。主动脉内是动脉血，但“动脉”定义为离开心脏的血管。',check:'在前/后视图中定位主动脉弓；区别“动脉/静脉”的方向定义和“含氧量”。'},
  'pulmonary-trunk': {name:'肺动脉干',en:'PULMONARY TRUNK',tag:'右室流出道',body:'肺动脉干自右心室发出，在上方分为左、右肺动脉，通向肺毛细血管床。肺动脉虽称“动脉”，运送的是相对低氧血；肺循环动脉/静脉同样按血流离心或回心命名。',check:'指出肺动脉瓣后的第一段血管，以及进入肺之前的左右分支。'},
  'svc': {name:'上腔静脉',en:'SUPERIOR VENA CAVA',tag:'体循环回流',body:'汇集膈以上的头颈、上肢和胸部等静脉回流，注入右心房上部。',check:'用流量路径说明“静脉回心”而非“静脉必然缺氧”的定义。'},
  'ivc': {name:'下腔静脉',en:'INFERIOR VENA CAVA',tag:'体循环回流',body:'汇集膈以下体部的静脉回流，注入右心房。它与上腔静脉共同构成回心主干。',check:'从下肢静脉回流追踪至右心房。'},
  'pulmonary-arteries': {name:'左右肺动脉',en:'PULMONARY ARTERIES',tag:'从右心到肺',body:'肺动脉向左右肺分支，并在肺内继续分支形成毛细血管网，完成血液与肺泡气体之间的 O₂/CO₂ 交换。',check:'指出肺循环中的“动脉”携带相对低氧血。'},
  'pulmonary-veins': {name:'肺静脉',en:'PULMONARY VEINS',tag:'从肺回到左心',body:'通常为四条肺静脉，连接肺静脉毛细血管/小静脉并开口于左心房。肺静脉内是相对富氧血。',check:'用血管名称判断方向，不要把“静脉”与缺氧划等号。'},
  'right-coronary-artery': {name:'右冠状动脉',en:'RIGHT CORONARY ARTERY',tag:'冠状循环',body:'起自主动脉根部，沿冠状沟走行并发出分支供应右心及部分传导组织。供血优势型和细小分支存在个体差异，模型仅示主要表面走向。',check:'切换前/后面观并开启冠状血管层。'},
  'anterior-interventricular-artery': {name:'前室间支（左前降支）',en:'ANTERIOR INTERVENTRICULAR BRANCH',tag:'左冠状动脉分支',body:'沿前室间沟向心尖方向走行，是左冠状动脉的重要分支之一；与回旋支共同构成左冠状动脉的主要分布路径。具体分支和优势型可有变异。',check:'观察其沿室间沟走向，不要与心腔内的浦肯野纤维混淆。'},
  'coronary-sinus': {name:'冠状窦',en:'CORONARY SINUS',tag:'心肌静脉回流',body:'主要位于心脏后面的冠状沟，汇集大部分心肌静脉血并开口于右心房。三维图仅用简化主干表示。',check:'切换后面观，沿冠状沟找到冠状窦及其右房开口。'},
  'chordae-tendineae': {name:'腱索与乳头肌',en:'CHORDAE TENDINEAE & PAPILLARY MUSCLES',tag:'房室瓣支持装置',body:'腱索连接房室瓣瓣叶与乳头肌。心室收缩时乳头肌同步收缩、腱索张紧，帮助防止瓣叶向心房侧脱垂/翻转；房室瓣开闭仍由跨瓣压力差决定。半月瓣没有这套结构。',check:'对比房室瓣和半月瓣支持结构；观察瓣叶关闭时的腱索张力。'},
  'conduction-system': {name:'心脏传导系统',en:'CARDIAC CONDUCTION SYSTEM',tag:'电活动的空间路径',body:'窦房结起搏后，激动经心房肌传播（含房间束向左房传播），在房室结产生生理性延搁，随后经房室束、左右束支和浦肯野纤维快速分布至心室肌。金色线条为位置示意，并非可见的粗大解剖索。',check:'按 SA→房肌→AV→His→左右束支→Purkinje 顺序口述，并说明 AV 延搁使心房先完成收缩充盈。'},
  'interventricular-septum': {name:'室间隔',en:'INTERVENTRICULAR SEPTUM',tag:'左右心室之间',body:'肌性和膜性部分共同构成左右心室间隔；房室束和束支沿室间隔区域向心尖走行。',check:'沿中隔从房室束追踪左右束支。'},
  'interatrial-septum': {name:'房间隔',en:'INTERATRIAL SEPTUM',tag:'左右心房之间',body:'分隔左右心房。成人右房侧可见卵圆窝，为胎儿卵圆孔闭合后的遗迹。',check:'在结构卡片中找到卵圆窝的成人位置；本示意模型未按比例刻画卵圆窝。'},
  'heart-wall': {name:'心壁与心尖',en:'HEART WALL & APEX',tag:'心肌构成的泵壁',body:'心壁由心内膜、心肌层和心外膜构成。心室肌收缩从心尖方向向心底流出道推进；心尖主要由左心室构成。模型半透明心壁用于观察内部结构。',check:'说出心壁三层；观察左室心肌比右室厚。'}
};

export const PHASES = [
  {id:'atrial',start:0,end:.12,name:'心房收缩',alt:'心室充盈末期',ecg:'P 波后',valves:'房室瓣开 · 半月瓣闭',flows:'心房 → 心室',lv:'心室压低于左房压；左房压短暂升高',rv:'右房压短暂升高；右室压仍低',volume:'末期充盈，达到 EDV',sound:'可出现第四心音情境（非正常成人必然可闻）',card:'心房肌去极化后收缩，补足心室末期充盈。安静状态下被动充盈通常占较大部分，房缩贡献随心率、前负荷等而变。'},
  {id:'iso-contraction',start:.12,end:.18,name:'等容收缩',alt:'心室收缩早期',ecg:'QRS 波群',valves:'四瓣均闭',flows:'心室内无净流入/流出',lv:'左室压快速上升，尚低于主动脉压',rv:'右室压上升，尚低于肺动脉压',volume:'恒定于 EDV',sound:'房室瓣关闭对应 S1',card:'心室去极化随后机械收缩，室压超过房压即使房室瓣关闭；尚未超过动脉压，半月瓣仍闭，所以容积短暂恒定。'},
  {id:'rapid-ejection',start:.18,end:.29,name:'快速射血',alt:'心室收缩中期',ecg:'ST 段附近',valves:'房室瓣闭 · 半月瓣开',flows:'右室 → 肺动脉；左室 → 主动脉',lv:'左室压超过主动脉压，主动脉压随射血上升',rv:'右室压超过肺动脉压，肺动脉压上升',volume:'快速下降',sound:'S1 后射血期',card:'跨越流出道压力后，肺动脉瓣和主动脉瓣被动开放。两侧心室同向同步射血，压力幅值差异很大。'},
  {id:'reduced-ejection',start:.29,end:.43,name:'减慢射血',alt:'心室收缩晚期',ecg:'T 波前后',valves:'房室瓣闭 · 半月瓣开（至压差反转）',flows:'射血继续，流速逐渐减小',lv:'左室与主动脉压力逐渐下降',rv:'右室与肺动脉压力逐渐下降',volume:'继续下降至 ESV',sound:'心室开始复极；电活动仍先于机械舒张',card:'心室动作电位复极启动，心肌张力和射血速度下降；随室压低于动脉压，半月瓣关闭。'},
  {id:'iso-relaxation',start:.43,end:.49,name:'等容舒张',alt:'心室舒张早期',ecg:'T 波结束附近',valves:'四瓣均闭',flows:'心室内无净流入/流出',lv:'左室压迅速下降至低于左房压',rv:'右室压迅速下降至低于右房压',volume:'恒定于 ESV',sound:'半月瓣关闭对应 S2；主动脉重搏切迹',card:'肺动脉瓣和主动脉瓣先关闭，阻止返流。房室瓣尚未开放，四瓣短暂全闭，心室容积维持 ESV。'},
  {id:'rapid-filling',start:.49,end:.60,name:'快速充盈',alt:'心室舒张期',ecg:'TP 段',valves:'房室瓣开 · 半月瓣闭',flows:'静脉 → 心房 → 心室',lv:'左室压低于左房压，低压血液快速流入',rv:'右室压低于右房压，低压血液快速流入',volume:'快速上升',sound:'快速充盈时可有第三心音情境（不代表必然病理）',card:'当心室压低于心房压，房室瓣被动开放；大部分心室充盈可在心房收缩前完成。'},
  {id:'diastasis',start:.60,end:1,name:'舒张中期（缓慢充盈）',alt:'心室舒张期',ecg:'TP 段',valves:'房室瓣开 · 半月瓣闭',flows:'静脉回心并持续进入心室',lv:'房室压力差变小，充盈速度减慢',rv:'右房/右室压力差变小',volume:'缓慢接近下一次 EDV',sound:'周期末进入下一次 P 波/心房收缩',card:'静脉回心和心室充盈持续进行；下一次窦房结放电再次启动心房去极化，进入新周期。'}
];

export const NAV = [
  {id:'overview',num:'00',title:'课程导览',desc:'学习目标与路径'},
  {id:'anatomy',num:'01',title:'三维解剖',desc:'腔室、瓣膜与血管'},
  {id:'electrical',num:'02',title:'心肌电活动',desc:'自律性与传导系统'},
  {id:'cycle',num:'03',title:'心动周期',desc:'压力、瓣膜与容积'},
  {id:'circulation',num:'04',title:'体肺循环',desc:'流量、压力与阻力'},
  {id:'practice',num:'05',title:'实训与自测',desc:'观察任务与即时反馈'}
];

export const QUIZ = [
  {q:'正常窦性节律下，心脏起搏冲动通常最先从哪里发出？',opts:['房室结','窦房结','浦肯野纤维','左心室肌'],a:1,why:'窦房结通常具有最高的自发去极化频率，是正常窦性节律的起搏点。'},
  {q:'房室结的生理性延搁最直接帮助实现什么？',opts:['避免心室舒张','让心房先完成收缩与心室充盈','使主动脉瓣主动打开','阻止肺静脉回流'],a:1,why:'房室延搁为心房收缩完成、心室末期充盈提供时间。'},
  {q:'等容收缩期的瓣膜和心室容积应如何？',opts:['房室瓣开、半月瓣闭，容积上升','四瓣均闭，容积暂时不变','房室瓣闭、半月瓣开，容积下降','四瓣均开，容积不变'],a:1,why:'房室瓣已经关闭而半月瓣尚未开放，心室压力上升但没有血液进出。'},
  {q:'半月瓣在什么条件下开放？',opts:['心房电活动开始时','心室压超过对应动脉压时','心室压低于心房压时','乳头肌牵拉瓣叶时'],a:1,why:'瓣膜是被动压力阀。主动脉瓣/肺动脉瓣在相应心室压力超过动脉压力后开放。'},
  {q:'下列关于肺循环的说法哪项正确？',opts:['肺动脉运送富氧血','肺静脉把血液送离心脏','肺循环通常是低压、低阻回路','右室每搏量必须长期大于左室'],a:2,why:'肺循环血管阻力和压力通常低于体循环；动静脉仍按离开心脏/回心定义。'},
  {q:'关于两个心室的稳态泵血，哪项正确？',opts:['左室长期输出应是右室的两倍','两侧心室平均每搏输出需匹配','右室不参与气体交换回路','两个心室舒张同时停止'],a:1,why:'体肺循环串联，稳态下左右心室平均输出量需匹配，避免血液在肺循环或体循环持续淤积。'},
  {q:'心室工作肌动作电位平台期的主要离子基础及作用是？',opts:['快速 Na⁺ 外流，缩短不应期','Ca²⁺ 内流与 K⁺ 外流相对平衡，延长不应期并支持收缩','Cl⁻ 内流导致强直','K⁺ 内流导致舒张停止'],a:1,why:'L 型 Ca²⁺通道内流与 K⁺外流形成平台，延长有效不应期；Ca²⁺进入还触发肌浆网进一步释放 Ca²⁺。'},
  {q:'“动脉”和“静脉”的系统解剖命名主要依据什么？',opts:['血液颜色','血氧饱和度','相对心脏的流动方向','血管壁厚度'],a:2,why:'动脉将血液带离心脏，静脉将血液带回心脏；肺动脉低氧、肺静脉富氧是常见例外于含氧量直觉的路径。'}
];

export const SOURCES = [
  {title:'OpenStax《Anatomy and Physiology 2e》19.1 心脏解剖',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy',desc:'四腔结构、瓣膜、心壁、双循环与冠状循环。'},
  {title:'OpenStax《Anatomy and Physiology》19.2 心肌与电活动',url:'https://openstax.org/books/anatomy-and-physiology/pages/19-2-cardiac-muscle-and-electrical-activity',desc:'心肌细胞动作电位、传导系统、房室延搁与 ECG。'},
  {title:'OpenStax《Anatomy and Physiology 2e》19.3 心动周期',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-3-cardiac-cycle',desc:'心动周期各阶段、压力梯度、瓣膜启闭与心音。'},
  {title:'OpenStax《Anatomy and Physiology》19.4 心脏生理',url:'https://openstax.org/books/anatomy-and-physiology/pages/19-4-cardiac-physiology',desc:'心率、每搏量与心输出量及调节。'},
  {title:'NCBI Bookshelf / StatPearls：Physiology, Pulmonary Circulatory System',url:'https://www.ncbi.nlm.nih.gov/books/NBK525948/',desc:'肺循环低压低阻特征与代表性右心/肺动脉压力。'},
  {title:'NCBI Bookshelf / StatPearls：Physiology, Pulmonary Vascular Resistance',url:'https://www.ncbi.nlm.nih.gov/books/NBK554380/',desc:'肺血管阻力、压力梯度和肺循环动力学。'}
];
