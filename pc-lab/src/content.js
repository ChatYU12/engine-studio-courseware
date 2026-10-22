// AM4 / DDR4 / ATX 单一教学平台。duration 单位为秒；answer 为 0 起始索引。
// 本文件只提供课程数据。几何与交互状态由场景和应用模块负责。

export const PLATFORM = {
  title: 'AM4 台式机装配实训平台',
  description: '以 MSI B550-A PRO 与 Ryzen 5 5600 为知识基线。结构、接线与流程为教学示意；POST / UEFI 为模拟，不读取当前电脑硬件。',
  specs: [
    { label: '主板', value: 'MSI B550-A PRO · ATX / AM4' },
    { label: '处理器', value: 'Ryzen 5 5600 · 6 核 12 线程 · 需独显' },
    { label: '散热', value: 'Wraith Stealth · 四弹簧螺钉 / AM4 背板' },
    { label: '内存', value: '2 × 8 GB DDR4-3200 · A2 + B2' },
    { label: '存储', value: 'M.2 2280 NVMe · 顶部 M2_1' },
    { label: '显卡', value: 'RTX 3060 VENTUS 2X 12G OC · 单 8-pin' },
    { label: '电源', value: 'CX650M（2021）· 650 W 半模组 ATX' },
    { label: '扩展', value: '可选 2.5 英寸 SATA SSD · 数据 + 供电' },
  ],
};

export const SOURCES = [
  { id: 'S1', title: 'MSI B550-A PRO 用户手册', url: 'https://download.msi.com/archive/mnu_exe/mb/B550-APRO_EN.pdf', note: '本板接口、A2/B2、PCI_E1、M2_1、Debug 与 UEFI；核验于 2026-10-20。' },
  { id: 'S2', title: 'MSI B550-A PRO 官方规格', url: 'https://www.msi.com/Motherboard/B550-A-PRO/Specification', note: 'AM4 / ATX / DDR4、插槽与存储兼容性。' },
  { id: 'S3', title: 'AMD Ryzen 5 5600 官方规格', url: 'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html', note: 'AM4、DDR4、Wraith Stealth、需独显、65 W 与 90°C Tjmax。' },
  { id: 'S4', title: 'AMD AM4 散热器安装与拆卸', url: 'https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html', note: '弹簧螺钉、保留背板、预涂膏检查、对角固定与拆卸解黏连。' },
  { id: 'S5', title: 'MSI RTX 3060 VENTUS 2X 官方数据页', url: 'https://storage-asset.msi.com/datasheet/vga/global/GeForce-RTX-3060-VENTUS-2X-12G-OC.pdf', note: '双风扇、8-pin × 1、235 × 124 × 42 mm、厂商建议 550 W 电源。' },
  { id: 'S6', title: 'CORSAIR CX-M 2021 官方指南', url: 'https://assets.corsair.com/image/upload/corsairmedia/sys_master/productcontent/WW_CXM_Series_2021_QSG_AA.pdf', note: 'CX650M 650 W；24-pin、EPS 4+4、PCIe 6+2 与模组线材匹配。' },
  { id: 'S7', title: 'Seasonic 电源线用途说明', url: 'https://knowledge.seasonic.com/article/69-power-supply-cables-and-their-uses', note: '说明 ATX、CPU、PCIe、SATA 的用途，不代表跨品牌线材可以互换。' },
  { id: 'S8', title: 'CORSAIR 4000D 机箱官方指南', url: 'https://assets.corsair.com/image/upload/corsairmedia/sys_master/productcontent/WW_4000D_4000D_Airflow_QSG_AB.pdf', note: '教学中塔的结构与空间参考，非完整 CAD 复刻。' },
  { id: 'S9', title: 'MSI B550-A PRO 官方支持', url: 'https://www.msi.com/Motherboard/B550-A-PRO/support', note: '课前核对 CPU 支持、BIOS 与内存列表；本课不编造最低 BIOS 版本。' },
];

export const PARTS = [
  {
    id: 'chassis', name: 'ATX 教学机箱', en: 'ATX Chassis', spec: '下置电源 · 前进后出风道',
    description: '为主板、电源、显卡与存储提供机械支撑和气流通道。结构参考标准中塔，非指定机箱的完整机械复刻。',
    location: '整机承载框架；后部是主板 I/O 与显卡挡板。',
    precautions: ['机箱应稳定平放，注意金属边缘。', '核对主板规格、显卡空间和散热器高度。'], sources: ['S8', 'S1'],
  },
  {
    id: 'panel', name: '服务侧板', en: 'Side Panel', spec: '拆装入口 · 最后封合',
    description: '侧板形成机箱外壳。内部检修前移除，完成检查并断电后复位；透明显示只是便于教学观察。',
    location: '机箱服务侧。',
    precautions: ['先关机、关闭电源并拔下交流线。', '玻璃侧板放在稳妥软垫上，不靠硬边承重。'], sources: ['S8', 'S1'],
  },
  {
    id: 'standoffs', name: '主板安装支柱', en: 'Motherboard Standoffs', spec: '与 ATX 安装孔逐一对应',
    description: '将 PCB 与机箱托盘隔开，并形成固定点。孔位以实物核对；多余支柱可能接触板底线路。',
    location: '主板背面与机箱托盘之间。',
    precautions: ['先核对孔位，再安装主板。', '移除没有对应安装孔的多余支柱。'], sources: ['S1', 'S8'],
  },
  {
    id: 'ioShield', name: '后 I/O 挡板', en: 'Rear I/O Shield', spec: '与主板后置接口匹配',
    description: '填合机箱后部接口开口，帮助接口定位。独立式挡板应先于主板入箱安装；集成式不重复叠装。',
    location: '机箱后部主板接口开口。',
    precautions: ['以主板实物和附件核对形式、方向。', '弹片不能误伸入 USB、网口等接口。'], sources: ['S1', 'S8'],
  },
  {
    id: 'motherboard', name: 'B550-A PRO 主板', en: 'Motherboard', spec: 'MSI · ATX · AM4 · DDR4',
    description: '承载 CPU、内存、存储和扩展卡，并通过总线与接口互联。不同长插槽的电气通道未必相同。',
    location: '机箱主板托盘；后 I/O 对准机箱背部。',
    precautions: ['抓边移动，不拉散热器搬板。', '核对支柱和所有外连线后才能移入或移出。'], sources: ['S1', 'S2'],
  },
  {
    id: 'cpu', name: 'Ryzen 5 5600 处理器', en: 'AM4 Processor', spec: '6 核 12 线程 · AM4 · 65 W TDP',
    description: '执行运算与控制任务。本课 CPU 的针脚在底部，且需要独显；不能套用 Intel LGA 压盖安装法。',
    location: '主板上方 AM4 插座内，散热器下方。',
    precautions: ['抬锁杆、对三角，让 CPU 自然落座。', '不摸针脚，不强压；散热就绪后才通电。'], sources: ['S1', 'S3'],
  },
  {
    id: 'cooler', name: 'Wraith Stealth 散热器', en: 'CPU Cooler & Backplate', spec: '四弹簧螺钉 · 保留 AM4 背板',
    description: '将 CPU 热量经底座和鳍片传给空气。移除塑料扣具但保留背板，四点对角逐次固定；短风扇线接 CPU_FAN1。',
    location: 'CPU 正上方；背板在主板背面。',
    precautions: ['完整预涂膏无需重复加膏。', '拆卸先松螺钉，再轻转解黏连，不能猛拔。'], sources: ['S4', 'S3'],
  },
  {
    id: 'ramA2', name: 'DDR4 内存 A2', en: 'DDR4 DIMM · A2', spec: '8 GB · DDR4-3200 UDIMM',
    description: '为运行中的程序提供临时工作空间。两条内存按本板手册组成 A2/B2 双通道配置。',
    location: '从 CPU 向外数第二条 DIMM 插槽 DIMMA2。',
    precautions: ['对齐缺口，不用 DDR5 或 SO-DIMM 替代。', '卡扣释放后插装，检查两端完全到位。'], sources: ['S1', 'S3'],
  },
  {
    id: 'ramB2', name: 'DDR4 内存 B2', en: 'DDR4 DIMM · B2', spec: '8 GB · 与 A2 同套装',
    description: '与 A2 模块共同提供 16 GB 双通道配置。相邻两槽不等于正确双通道，应以具体主板手册为准。',
    location: '从 CPU 向外数第四条 DIMM 插槽 DIMMB2。',
    precautions: ['优先使用同套装模块。', '不要以一次能开机代替稳定性与兼容性核对。'], sources: ['S1', 'S3'],
  },
  {
    id: 'ssd', name: 'M.2 NVMe 系统盘', en: 'M.2 2280 NVMe SSD', spec: '2280 · Key M · PCIe NVMe',
    description: '以非易失存储保存数据。本课装在 M2_1；M.2 是外形规范，不能据此外形断定所有盘都是 NVMe。',
    location: 'CPU 与第一条显卡插槽之间的 M2_1。',
    precautions: ['核对长度支柱，约 30° 插入后压平固定。', '不弯折 SSD；无须 SATA 数据线和 SATA 供电线。'], sources: ['S1', 'S2'],
  },
  {
    id: 'm2Shield', name: 'M.2 散热片', en: 'M.2 Shield Frozr', spec: 'M2_1 顶盖 · 导热垫',
    description: '通过导热垫与 SSD 接触，帮助散热。先拆散热片才可装盘，盘固定后再恢复散热片。',
    location: 'M2_1 SSD 上方。',
    precautions: ['核对导热垫保护膜并按实际产品移除。', '使用正确固定件，避免压弯 SSD。'], sources: ['S1'],
  },
  {
    id: 'psu', name: '650 W ATX 电源', en: 'Power Supply Unit', spec: 'CORSAIR CX650M（2021）· 半模组',
    description: '将交流输入转换为主机所需直流电源。本课功率是固定配置示例，选型仍须核对整机负载、接口和厂商要求。',
    location: '机箱底部后方电源仓。',
    precautions: ['安装与拆除前关闭并拔下交流线。', '不打开电源外壳；仅用该型号匹配的线材。'], sources: ['S6', 'S7'],
  },
  {
    id: 'atx', name: 'ATX 24-pin 主供电', en: '24-pin ATX Power', spec: '主板 ATX_PWR1',
    description: '向主板和相关电路提供主供电。它不能替代 CPU_PWR1 的 EPS 供电，也不是显卡辅助电源。',
    location: '主板右边缘 24-pin 接口。',
    precautions: ['按防呆方向对齐，检查锁扣到位。', '拔出时解除卡扣，抓插头外壳而非线芯。'], sources: ['S1', 'S6', 'S7'],
  },
  {
    id: 'eps', name: 'EPS 4+4 CPU 供电', en: '8-pin EPS / CPU Power', spec: '主板 CPU_PWR1 · 4+4',
    description: '向处理器供电区域提供电源。使用标记 CPU / EPS 的 4+4 插头；器件端不可用 PCIe 6+2 替代。',
    location: '主板左上方 CPU_PWR1。',
    precautions: ['核对 CPU/EPS 标签，不凭“同为八针”判断。', '主板入箱前预留顶部走线路径。'], sources: ['S1', 'S6', 'S7'],
  },
  {
    id: 'frontIO', name: '前面板与前置接口', en: 'Front-panel & Front I/O', spec: 'JFP1 · JUSB · JAUD1',
    description: '连接机箱电源按钮、实际存在的指示灯、前 USB 与音频。开关和 LED 功能不同；LED 需要区分正负。',
    location: 'JFP1 / JAUD1 在主板下缘；USB 按各自接口定位。',
    precautions: ['依据本板手册和丝印，不能套用其他板排针。', '缺针与插头方向匹配，不强行错位连接。'], sources: ['S1', 'S8'],
  },
  {
    id: 'fans', name: '机箱进排风扇', en: 'Chassis Fans', spec: '前进风 · 后排风 · SYS_FAN',
    description: '建立穿过机箱的空气通路。以扇框风向标识核对方向，SYS_FAN 的调速方式应与三针 DC / 四针 PWM 风扇匹配。',
    location: '前面板进风位与机箱后部排风位。',
    precautions: ['线缆避开扇叶。', '风扇供电与 5 V ARGB / 12 V RGB 是不同接口。'], sources: ['S1', 'S8'],
  },
  {
    id: 'sataSSD', name: 'SATA 扩展 SSD', en: 'Optional 2.5-inch SATA SSD', spec: '可选扩展 · 2.5 英寸', optional: true,
    description: '作为可选第二存储设备。与 M.2 NVMe 的连接方式不同，需要独立数据线和电源线；未配置不影响必修完成。',
    location: '机箱的 2.5 英寸安装位。',
    precautions: ['先固定到支架，再整理两条线。', '不把磁盘存在等同于已安装操作系统。'], sources: ['S1', 'S7', 'S8'],
  },
  {
    id: 'sataData', name: 'SATA 数据线', en: 'SATA Data Cable', spec: '可选扩展 · 主板 ↔ SATA SSD', optional: true,
    description: '在主板 SATA 端口与 SATA SSD 间传输数据。数据插头与电源插头尺寸不同，均有方向结构。',
    location: '主板 SATA 端口至 2.5 英寸 SSD。',
    precautions: ['不能只接数据线而省略供电。', '避免急折和牵拉；有卡扣时先解除。'], sources: ['S1'],
  },
  {
    id: 'sataPower', name: 'SATA 供电线', en: 'SATA Power Cable', spec: '可选扩展 · 电源 → SATA SSD', optional: true,
    description: '从电源向 SATA SSD 提供供电。不得把模组电源端的插头当作设备端，也不能混用未知电源的线材。',
    location: 'PSU 匹配线束至 2.5 英寸 SSD。',
    precautions: ['只能在断电状态下插拔。', '同时核对 SATA 数据连接。'], sources: ['S6', 'S7'],
  },
  {
    id: 'gpu', name: '双风扇独立显卡', en: 'Discrete Graphics Card', spec: 'RTX 3060 VENTUS 2X 12G OC · PCI_E1',
    description: '承担图形输出与计算。本型号 235 × 124 × 42 mm、单 8-pin，装在 PCI_E1；在竖直主板上，显卡风扇面朝下。',
    location: '主板第一条长 PCIe 插槽，后挡板对准机箱扩展槽。',
    precautions: ['插槽卡扣与后挡板螺钉均需到位。', '拔卡先解除供电、螺钉和卡扣；本卡低温停转可属正常。'], sources: ['S1', 'S5'],
  },
  {
    id: 'gpuPower', name: 'PCIe 6+2 显卡供电', en: '8-pin PCIe / GPU Power', spec: '本显卡单 8-pin · 使用 6+2 组合',
    description: '向本课独显提供辅助电源。与 EPS 4+4 的器件端接线、用途不同，不能互换；其他显卡可能使用不同接口。',
    location: '显卡顶部辅助供电口。',
    precautions: ['核对 GPU / PCIe 标签与锁扣。', '不以供电线承重，不紧绷或急折。'], sources: ['S5', 'S6', 'S7'],
  },
];

export const SAFETY_CHECKS = [
  { id: 'safe-power', text: '已正常关机，PSU 置于 O，交流电源线已拔下。' },
  { id: 'safe-esd', text: '已按实训室规范建立 ESD 工作垫与手环接地。' },
  { id: 'safe-handling', text: '只拿器件边缘，不触碰 CPU 针脚、插座触点或金手指。' },
  { id: 'safe-tools', text: '工位稳定干燥，工具合适，螺钉按用途分类并清点。' },
  { id: 'safe-psu', text: '电源作为封闭模块处理；发现破损、异味或液体立即停止。' },
];

export const PREPOWER_CHECKS = [
  { id: 'pre-standoffs', text: '支柱与安装孔对应，机箱内无多余支柱、松螺钉和金属异物。' },
  { id: 'pre-cooling', text: 'CPU 已锁定，散热器四点固定、背板在位，CPU_FAN1 已接。' },
  { id: 'pre-ram', text: '两条 DDR4 位于 A2/B2，缺口方向正确、两端完全到位。' },
  { id: 'pre-storage', text: 'M2_1 SSD 与相应固定件就绪，M.2 散热片正确复位。' },
  { id: 'pre-power', text: 'ATX 24-pin 与 CPU EPS 4+4 均到位，未混用 PCIe 6+2。' },
  { id: 'pre-gpu', text: '显卡插在 PCI_E1、挡板已固定，单个 PCIe 8-pin 已连接。' },
  { id: 'pre-cables', text: 'PWR SW / SYS_FAN 接线正确，全部线缆避开扇叶；可选 SATA 两条线齐备。' },
  { id: 'pre-display', text: '显示器接独显并选择正确输入源，手和工具均已离开机箱内部。' },
];

export const STEPS = [
  {
    id: 'A01', title: '建立安全工位', short: '断电与 ESD', chapter: '准备与核对', partIds: ['chassis', 'psu'], installIds: [], removeIds: [], duration: 2,
    instruction: '正常关机，将电源开关置于 O 并拔下交流线。准备稳定的 ESD 工位、手环、螺丝刀和分格螺钉盒。',
    prerequisites: ['开始任何内部操作前'], checks: ['交流线已拔下', 'ESD 按实训室规范接地', '工位干燥、工具与螺钉分类'],
    warning: '待机或关机不代表主板完全无电；内部器件不带电插拔。', principle: '先建立电气与静电防护条件，再接触敏感器件。', sources: ['S1', 'S4'], critical: true,
  },
  {
    id: 'A02', title: '核对部件与兼容性', short: 'AM4 / DDR4', chapter: '准备与核对', partIds: ['motherboard', 'cpu', 'ramA2', 'gpu'], installIds: [], removeIds: [], duration: 2,
    instruction: '核对主板 AM4 插座、DDR4 内存、ATX 机箱空间及电源线束。课前确认 BIOS 支持 Ryzen 5 5600；此 CPU 必须搭配独显。',
    prerequisites: ['安全工位就绪'], checks: ['CPU / BIOS 支持已核对', '内存与机箱规格匹配', '独显和匹配电源线材齐备'],
    warning: '不能凭插头或插槽外观判断兼容；本课不编造最低 BIOS 版号。', principle: '插座、代际、固件、空间和电气条件共同决定兼容性。', sources: ['S1', 'S2', 'S3', 'S9'], critical: false,
  },
  {
    id: 'A03', title: '打开机箱并核对支柱', short: '支柱与挡板', chapter: '准备与核对', partIds: ['panel', 'standoffs', 'ioShield'], installIds: ['standoffs', 'ioShield'], removeIds: ['panel'], duration: 3,
    instruction: '移除服务侧板并稳妥放置。按 ATX 安装孔核对支柱，移除多余支柱；独立 I/O 挡板先于主板入箱，集成式不再叠装。',
    prerequisites: ['已完全断电', '机箱稳定平放'], checks: ['支柱逐一对应安装孔', '没有多余支柱', '后 I/O 开口与挡板方向正确'],
    warning: '多余支柱可能顶住 PCB 线路形成短路；不得直接把主板贴在金属托盘上。', principle: '先确定机械支撑与接口开口，主板才能安全定位。', sources: ['S1', 'S8'], critical: true,
  },
  {
    id: 'A04', title: '安装 AM4 处理器', short: '对三角落座', chapter: '主板子装配', partIds: ['cpu', 'motherboard'], installIds: ['cpu'], removeIds: [], duration: 3.5,
    instruction: '主板置于稳定工作垫，抬起 AM4 锁杆。对齐 CPU 与插座三角标识，让 CPU 自然落座，再放下锁杆固定。',
    prerequisites: ['CPU / 插座兼容', '插座无异物且针脚无损'], checks: ['双方三角方向一致', 'CPU 平整落座', '锁杆已锁定'],
    warning: 'AM4 针脚位于 CPU 底部；对不准时停止，不用按压来纠正。', principle: '方向标识与零插入力插座共同保证正确接触。', sources: ['S1', 'S3'], critical: true,
  },
  {
    id: 'A05', title: '准备四螺钉散热器安装座', short: '保留背板', chapter: '主板子装配', partIds: ['cooler', 'cpu', 'motherboard'], installIds: [], removeIds: [], duration: 2.5,
    instruction: '本课使用 Wraith Stealth 四弹簧螺钉路线。卸下 AM4 两侧塑料扣具，同时托住主板后方原背板，使其孔位保持对齐。',
    prerequisites: ['CPU 已正确锁定', '确定使用四弹簧螺钉型散热器'], checks: ['两侧塑料扣具已卸下', 'AM4 背板仍在位', '螺钉已分类收纳'],
    warning: '不要把背板当包装拆走；挂钩式散热器与本课的安装方法不同。', principle: '弹簧螺钉与背板形成完整固定结构。', sources: ['S4'], critical: true,
  },
  {
    id: 'A06', title: '检查导热接触面', short: '核对预涂膏', chapter: '主板子装配', partIds: ['cpu', 'cooler'], installIds: [], removeIds: [], duration: 2,
    instruction: '检查散热器底部与 CPU 接触面。本次新原装散热器使用完整预涂导热膏，无需重复加膏；重装时清理旧膏再按产品要求处理。',
    prerequisites: ['CPU 已锁定', '扣具与背板准备完成'], checks: ['接触面无异物', '预涂膏完整或重涂已按要求完成', '仅移除实际存在的保护盖 / 膜'],
    warning: '预涂膏上再叠加导热膏并非更好；不要把所有产品都教成必有保护膜。', principle: '导热材料填补接触面的微小间隙，施工方法依具体产品。', sources: ['S4'], critical: false,
  },
  {
    id: 'A07', title: '固定 CPU 散热器', short: '四点对角固定', chapter: '主板子装配', partIds: ['cooler', 'cpu'], installIds: ['cooler'], removeIds: [], duration: 4,
    instruction: '散热器平行放在 CPU 上，对齐背板孔位。先让四颗弹簧螺钉都正确挂入，再按对角顺序逐次固定至稳固。',
    prerequisites: ['背板在位且孔位对齐', '导热接触面已处理'], checks: ['四颗螺钉均已正确接入', '固定过程对角均匀', '散热器稳固且未偏斜'],
    warning: '不要先把一角拧到底再硬压其余角；动画不提供通用拧紧力矩。', principle: '均匀压合帮助形成稳定机械固定与导热接触。', sources: ['S4'], critical: true,
  },
  {
    id: 'A08', title: '连接 CPU 风扇', short: '接 CPU_FAN1', chapter: '主板子装配', partIds: ['cooler', 'motherboard'], installIds: [], removeIds: [], duration: 2,
    instruction: '将散热器短风扇线接到主板 CPU_FAN1，核对插头方向并整理余线，使其避开扇叶。该短线随散热器组件显示。',
    prerequisites: ['散热器已固定'], checks: ['插头接在 CPU_FAN1', '插头完全到位', '线缆不碰扇叶'],
    warning: '散热器已装不代表风扇已接；未就绪不能进入通电操作。', principle: 'CPU 风扇供电与监测是完整散热条件的一部分。', sources: ['S1', 'S4'], critical: true,
  },
  {
    id: 'A09', title: '安装 A2 / B2 双通道内存', short: '两条 DDR4', chapter: '主板子装配', partIds: ['ramA2', 'ramB2', 'motherboard'], installIds: ['ramA2', 'ramB2'], removeIds: [], duration: 3.5,
    instruction: '按本板丝印找到 DIMMA2 与 DIMMB2。打开活动卡扣，对齐 DDR4 缺口，均匀压入同套装的两条 8 GB 内存并检查两端。',
    prerequisites: ['DDR4 UDIMM 与平台匹配', '插槽可接近且无干涉'], checks: ['使用 A2 / B2', '缺口方向正确', '两端完全到位且卡扣闭合'],
    warning: '不是相邻任意两槽；不把 DDR5 或笔记本 SO-DIMM 强行装入。', principle: 'A2/B2 是这块主板两条内存的推荐布置。', sources: ['S1', 'S3'], critical: false,
  },
  {
    id: 'A10', title: '安装顶部 M.2 NVMe', short: 'M2_1 / 2280', chapter: '主板子装配', partIds: ['ssd', 'm2Shield', 'motherboard'], installIds: ['ssd', 'm2Shield'], removeIds: [], duration: 4,
    instruction: '先移开 M.2 散热片，核对 2280 固定位置与导热垫。SSD 约 30° 插入 M2_1，压平固定后复位散热片。',
    prerequisites: ['协议 / 长度与插槽匹配', '显卡尚未遮挡工作区'], checks: ['使用顶槽 M2_1', '支柱与固定件正确且 SSD 不弯曲', '散热片与导热垫已就绪'],
    warning: 'M.2 是外形规范，不代表所有盘都使用 NVMe；本课 NVMe 不接 SATA 线。', principle: '插槽协议、外形长度与机械固定必须同时符合。', sources: ['S1', 'S2'], critical: false,
  },
  {
    id: 'A11', title: '安装电源并预走线', short: 'ATX 电源', chapter: '机箱整合', partIds: ['psu', 'chassis', 'eps'], installIds: ['psu'], removeIds: [], duration: 3,
    instruction: '将 CX650M 放入机箱底部电源位并固定。进风面朝向机箱设计的可用进气口，提前为顶部 EPS 线预留路径。',
    prerequisites: ['交流线仍拔下', '机箱安装位和线材匹配'], checks: ['电源固定牢靠', '进风通道不被堵塞', '仅使用该电源匹配线材'],
    warning: '不打开电源外壳；不同电源的模组线不能凭外观沿用。', principle: '先安排固定和走线路径，减少主板入箱后的空间干涉。', sources: ['S6', 'S7', 'S8'], critical: true,
  },
  {
    id: 'A12', title: '主板组件入箱', short: '对孔固定', chapter: '机箱整合', partIds: ['motherboard', 'standoffs', 'ioShield'], installIds: ['motherboard'], removeIds: [], duration: 4,
    instruction: '抓主板边缘，将已装好的 CPU、散热器、内存和 M.2 组件一起移入机箱。后接口对准开口，安装孔对准支柱，再按产品要求固定。',
    prerequisites: ['支柱 / 挡板已核对', '主板子装配已完成', 'EPS 走线路径已预留'], checks: ['每个固定点均有对应支柱', '后接口未被挡板弹片堵住', '板底和边缘无线缆被压住'],
    warning: '不要抓散热器搬主板，也不以统一力矩代替具体产品要求。', principle: '主板与其子装配作为一个整体入箱，保持支撑和接口对齐。', sources: ['S1', 'S8'], critical: true,
  },
  {
    id: 'A13', title: '连接主板与 CPU 电源', short: '24-pin + EPS', chapter: '供电与接线', partIds: ['atx', 'eps', 'motherboard'], installIds: ['atx', 'eps'], removeIds: [], duration: 3.5,
    instruction: '将 ATX 24-pin 接到 ATX_PWR1，将标注 CPU / EPS 的 4+4 组成 8-pin 接到 CPU_PWR1，分别检查方向与锁扣。',
    prerequisites: ['主板与电源已固定', '线材标签和用途已识别'], checks: ['ATX 24-pin 到位', 'CPU EPS 4+4 到位', '未以 PCIe 6+2 替代 EPS'],
    warning: 'EPS 4+4 与 PCIe 6+2 的器件端不能互换；同为八针不等于兼容。', principle: '主板主供电与处理器供电是两个独立连接任务。', sources: ['S1', 'S6', 'S7'], critical: true,
  },
  {
    id: 'A14', title: '连接前面板与前置接口', short: 'JFP1 / USB / AUDIO', chapter: '供电与接线', partIds: ['frontIO', 'motherboard'], installIds: ['frontIO'], removeIds: [], duration: 3,
    instruction: '按手册连接 JFP1 的 PWR SW 与机箱实际存在的 LED，再连接对应前 USB 和 HD AUDIO。核对丝印、缺针和防呆方向。',
    prerequisites: ['主板已固定', '本板排针图可核对'], checks: ['PWR SW 接到正确针位', 'LED 如有配置则正负正确', 'USB / 音频未错位'],
    warning: '不强制虚构机箱没有的 Reset 或 HDD LED 线；不同主板排针不可盲套。', principle: '按钮、指示灯、USB 与音频承担不同信号任务。', sources: ['S1', 'S8'], critical: false,
  },
  {
    id: 'A15', title: '建立机箱风道与扩展存储', short: '风扇 / 可选 SATA', chapter: '供电与接线', partIds: ['fans', 'sataSSD', 'sataData', 'sataPower'], installIds: ['fans'], removeIds: [], duration: 3,
    instruction: '核对前进后出的风向并连接 SYS_FAN。若开启 SATA 扩展，另外固定 2.5 英寸 SSD，并同时接主板数据线和电源供电线。',
    prerequisites: ['主板与电源已固定', '风扇方向按实际标识核对'], checks: ['SYS_FAN 正确连接', '线缆避开扇叶', '可选 SATA 已配置时两条线都已接'],
    warning: '风扇供电不是 RGB 接口；可选 SATA 不计入必装进度，关闭它不影响主线完成。', principle: '空气流动与存储连接各有完整条件；数据线不能代替供电。', sources: ['S1', 'S7', 'S8'], critical: false,
  },
  {
    id: 'A16', title: '安装并固定独立显卡', short: 'PCI_E1 卡扣', chapter: '显卡与验证', partIds: ['gpu', 'motherboard', 'chassis'], installIds: ['gpu'], removeIds: [], duration: 4,
    instruction: '移除对应机箱扩展槽挡片。显卡对齐 PCI_E1 和后槽位插入，确认插槽卡扣就位后固定后挡板；此时显卡风扇面朝下。',
    prerequisites: ['主板已固定', '线缆让开，显卡空间足够'], checks: ['使用第一条长槽 PCI_E1', '卡扣和插接到位', '后挡板已固定且显卡受支撑'],
    warning: '显卡不能只挂在供电线上；长插槽不一定都具备相同电气通道。', principle: 'PCIe 插槽与机箱挡板共同提供电气连接和机械支撑。', sources: ['S1', 'S5'], critical: true,
  },
  {
    id: 'A17', title: '连接显卡辅助供电', short: 'PCIe 6+2', chapter: '显卡与验证', partIds: ['gpuPower', 'gpu', 'psu'], installIds: ['gpuPower'], removeIds: [], duration: 3,
    instruction: '找到标注 GPU / PCIe 的 6+2 插头，组合成 8-pin 接入本显卡唯一辅助供电口，核对锁扣并整理余线。',
    prerequisites: ['显卡已插入并固定', '确认是 PCIe 线束'], checks: ['单 8-pin 已接到位', '未使用 EPS 4+4', '线缆不绷紧且不碰扇叶'],
    warning: '单 8-pin 仅适用于本课指定显卡，不能直接推广到其他型号。', principle: '显卡型号决定其辅助供电接口与整机电源选型要求。', sources: ['S5', 'S6', 'S7'], critical: true,
  },
  {
    id: 'A18', title: '执行通电前总检', short: '八项总检', chapter: '显卡与验证', partIds: ['motherboard', 'cooler', 'atx', 'eps', 'gpu', 'gpuPower', 'fans'], installIds: [], removeIds: [], duration: 2.5,
    instruction: '逐项核对支柱/异物、CPU 散热、内存、SSD、主板与 CPU 供电、显卡、风扇与前面板。显示线接独显，并让手和工具离开内部。',
    prerequisites: ['所有必装组件与连接已完成'], checks: ['通电前八项检查均完成', '显示器接独显且输入源正确', '工具、手和异物离开机箱内部'],
    warning: 'Ryzen 5 5600 需要独显；主板 HDMI / DP 不能作为本配置正常输出。', principle: '完整系统检查通过后，才把未通电装配转换为上电验证。', sources: ['S1', 'S3'], critical: true,
  },
  {
    id: 'A19', title: '首次启动与 UEFI 检查', short: 'POST / UEFI 模拟', chapter: '显卡与验证', partIds: ['motherboard', 'cpu', 'ramA2', 'ramB2', 'ssd'], installIds: [], removeIds: [], duration: 3,
    instruction: '总检通过后接交流线、开电源并按机箱按钮。观察 POST，按 Delete 进入 UEFI，核对 CPU、16 GB 内存、SSD、CPU 风扇和温度趋势。',
    prerequisites: ['安全项与通电前检查已全部满足'], checks: ['记录到预期 CPU / 内存 / SSD', '散热工作正常且无持续异常', '区分 POST、UEFI 与 OS 引导'],
    warning: '本窗口为教学模拟。风扇转不代表 POST 通过，空 SSD 没有启动项不等于损坏。', principle: '通过识别和监测结果验证装配，先建立默认设置的可启动基线。', sources: ['S1', 'S3', 'S5'], critical: true,
  },
  {
    id: 'A20', title: '安全结束与工位复原', short: '封板与记录', chapter: '显卡与验证', partIds: ['panel', 'chassis'], installIds: ['panel'], removeIds: [], duration: 3,
    instruction: '完成记录后正常关机、关闭电源并拔线。整理线缆、清点工具和余件，复位侧板，登记通过项与待处理问题。',
    prerequisites: ['验证完成或已安全停止故障检查', '已重新断开交流电源'], checks: ['工具与螺钉清点完成', '线缆不被侧板挤压', '学习记录已保存'],
    warning: '完成装配不代表已安装操作系统；未验证项不能填写为通过。', principle: '交接记录和工位复原是完整实训的一部分。', sources: ['S1', 'S8'], critical: false,
  },
];

export const DISASSEMBLY = [
  {
    id: 'D01', title: '断电并打开服务侧板', short: '重新建立安全条件', chapter: '断电与记录', partIds: ['panel', 'psu'], installIds: [], removeIds: ['panel'], duration: 3,
    instruction: '正常关机，PSU 置于 O，拔下交流线并建立 ESD 防护。机箱稳定后拆下服务侧板，放在妥善位置。',
    prerequisites: ['没有正在运行的内部检修动作'], checks: ['交流线已拔下', 'ESD 条件就绪', '侧板已安全放置'], warning: '拆卸入口必须重新断电；观察用的爆炸展开不等于真实拆卸。', principle: '先解除电气危险，再解除机械约束。', sources: ['S1', 'S8'], critical: true,
  },
  {
    id: 'D02', title: '记录接线并断开外设', short: '拍照与标签', chapter: '断电与记录', partIds: ['frontIO', 'atx', 'eps', 'gpu'], installIds: [], removeIds: [], duration: 2,
    instruction: '记录各插头标签与方向，断开机箱外的显示和外设线，确认移动时没有外线牵扯。为回装保留接线记录。',
    prerequisites: ['系统完全断电'], checks: ['接线位置有记录', '外部显示 / 外设线已断开', '机箱移动路径无牵扯'], warning: '不要只凭记忆拆下一束相似插头。', principle: '可追溯记录降低回装时的接口混淆。', sources: ['S1'], critical: false,
  },
  {
    id: 'D03', title: '解除显卡辅助供电', short: '先解插头卡扣', chapter: '移除显卡与线缆', partIds: ['gpuPower', 'gpu'], installIds: [], removeIds: ['gpuPower'], duration: 2.5,
    instruction: '按住 PCIe 8-pin 插头锁扣，抓住插头外壳，平稳退出显卡供电口；将线束移开显卡工作区域。',
    prerequisites: ['已断电', '供电接线有记录'], checks: ['插头锁扣已释放', '供电插头完全断开', '不拉扯线芯'], warning: '供电线未解除时，不能把显卡带离机箱。', principle: '先解除附属线缆，再移动重量较大的扩展卡。', sources: ['S5', 'S6'], critical: true,
  },
  {
    id: 'D04', title: '解锁并移出显卡', short: '螺钉 + PCIe 卡扣', chapter: '移除显卡与线缆', partIds: ['gpu', 'motherboard'], installIds: [], removeIds: ['gpu'], duration: 4,
    instruction: '扶稳显卡，卸下后挡板固定螺钉。按实际结构解开 PCI_E1 卡扣，确认三个约束均解除后，沿插槽退出方向移出显卡。',
    prerequisites: ['显卡供电已断开'], checks: ['后挡板螺钉已卸下', 'PCI_E1 卡扣已释放', '显卡始终受到支撑'], warning: '不能只卸螺钉就强拔；供电、挡板和插槽卡扣都要解除。', principle: '释放全部机械和线缆约束后，板卡才能安全退出。', sources: ['S1', 'S5'], critical: true,
  },
  {
    id: 'D05', title: '拆除可选 SATA 扩展', short: '两条线与支架', chapter: '移除显卡与线缆', partIds: ['sataPower', 'sataData', 'sataSSD'], installIds: [], removeIds: ['sataPower', 'sataData', 'sataSSD'], duration: 3,
    instruction: '若配置了 SATA SSD，先断开其电源与数据连接，再解除支架固定并取出。未配置时本步说明为可跳过的扩展内容。',
    prerequisites: ['完全断电', '可选盘位置和接线已记录'], checks: ['SATA 数据与电源均已解除', '固定件已分类', '未配置则明确跳过'], warning: '不拉线缆带出 SSD，也不对未安装的扩展强制计分。', principle: '扩展存储同样需要先解除线缆再解除固定。', sources: ['S1', 'S7', 'S8'], critical: false,
  },
  {
    id: 'D06', title: '断开机箱信号与风扇', short: '前 IO / SYS_FAN', chapter: '移除显卡与线缆', partIds: ['frontIO', 'fans'], installIds: [], removeIds: ['frontIO', 'fans'], duration: 3,
    instruction: '按记录逐一断开前 USB、音频、PWR SW / LED 与机箱风扇连接。核对插头卡扣或紧配合结构，防止斜拉损伤排针。',
    prerequisites: ['接线已有记录', '操作区可接近'], checks: ['机箱信号线已解除', 'SYS_FAN 已断开', '排针无弯曲与残留插头'], warning: '不同排针并不通用；抓插头外壳，不抓导线拉拽。', principle: '主板移出前必须摆脱机箱上所有外连约束。', sources: ['S1'], critical: false,
  },
  {
    id: 'D07', title: '断开主板供电', short: 'EPS / ATX 解扣', chapter: '移除显卡与线缆', partIds: ['atx', 'eps'], installIds: [], removeIds: ['atx', 'eps'], duration: 3,
    instruction: '分别解除 CPU EPS 与 ATX 24-pin 的插头锁扣，抓插头外壳退出，并将供电线束收向电源仓。',
    prerequisites: ['系统完全断电'], checks: ['EPS 已断开', 'ATX 24-pin 已断开', '供电线不会随主板移动'], warning: '抓线芯强拔会损伤插头；不得带电断开内部供电。', principle: '主板主供电和 CPU 供电是两个必须分别解除的端点。', sources: ['S1', 'S6'], critical: true,
  },
  {
    id: 'D08', title: '移出主板子装配', short: '先查所有外连线', chapter: '主板子装配拆卸', partIds: ['motherboard', 'chassis'], installIds: [], removeIds: ['motherboard'], duration: 4,
    instruction: '确认主板所有外连线、显卡和固定螺钉已解除。抓边将主板及其 CPU、散热器、内存、M.2 子装配一起移到稳定 ESD 工作垫。',
    prerequisites: ['显卡已移除', '机箱信号 / 风扇线已解除', 'ATX / EPS 已断开'], checks: ['固定螺钉已清点', '没有任何线缆牵扯', '不靠抓散热器提板'], warning: '不能边拉主板边寻找还连着的线；先逐项确认。', principle: '主板与已安装子件整体移动，再在无遮挡工位细拆。', sources: ['S1', 'S8'], critical: true,
  },
  {
    id: 'D09', title: '拆卸 M.2 SSD', short: '先散热片再固定件', chapter: '主板子装配拆卸', partIds: ['m2Shield', 'ssd'], installIds: [], removeIds: ['m2Shield', 'ssd'], duration: 3.5,
    instruction: '卸下 M2_1 散热片与 SSD 固定件。让 SSD 自然抬起到插入时的斜角，再沿插槽方向退出，分别收纳固定件和散热片。',
    prerequisites: ['主板在稳定垫面', 'M.2 工作区无遮挡'], checks: ['散热片和固定件已解除', 'SSD 无弯折', '按插入方向退出并保护金手指'], warning: '不直接垂直拔起 SSD，也不从中段弯折它。', principle: '先解除压合和固定，再逆向退出连接器。', sources: ['S1'], critical: false,
  },
  {
    id: 'D10', title: '取出 A2 / B2 内存', short: '释放 DIMM 卡扣', chapter: '主板子装配拆卸', partIds: ['ramA2', 'ramB2'], installIds: [], removeIds: ['ramA2', 'ramB2'], duration: 3,
    instruction: '打开对应插槽的活动卡扣，抓住模块边缘，从 A2 与 B2 均匀取出两条内存，放入防静电包装。',
    prerequisites: ['主板稳定放置', '插槽可接近'], checks: ['活动卡扣已打开', '不触摸金手指', '模块已防静电收纳'], warning: '卡扣未释放时不能靠拉力强行取出。', principle: '先解卡扣，避免连接器和模块承受异常弯曲。', sources: ['S1'], critical: false,
  },
  {
    id: 'D11', title: '断开 CPU 风扇短线', short: '托住主板背板', chapter: '主板子装配拆卸', partIds: ['cooler', 'motherboard'], installIds: [], removeIds: [], duration: 2,
    instruction: '断开 CPU_FAN1 短线，整理到散热器旁。为下一步托住主板和 AM4 背板，避免螺钉释放后背板掉落。',
    prerequisites: ['完全断电', '主板放在稳定工作垫'], checks: ['CPU_FAN1 已断开', '短线不会被散热器牵扯', '背板可受控支撑'], warning: '风扇插头未拔时，不要移动散热器。', principle: '拆散热器前先解除电线并控制背部固定件。', sources: ['S4'], critical: true,
  },
  {
    id: 'D12', title: '安全拆除 CPU 散热器', short: '对角松开 / 解黏连', chapter: '主板子装配拆卸', partIds: ['cooler', 'cpu'], installIds: [], removeIds: ['cooler'], duration: 4,
    instruction: '对角逐次松开四颗弹簧螺钉，确认均已脱离背板。轻微左右转动散热器解除旧膏黏连，再谨慎抬起，CPU 应留在锁定插座中。',
    prerequisites: ['CPU_FAN1 已断开', '背板受控', '四颗螺钉均可操作'], checks: ['四螺钉全部释放', '先解黏连再抬起', 'CPU 留在插座内'], warning: 'AM4 不能直接猛拔散热器；如需预热旧膏，只能在完整散热系统运行后重新关机断电再拆。', principle: '先解除螺钉约束，再解除导热材料的黏附。', sources: ['S4'], critical: true,
  },
  {
    id: 'D13', title: '解锁并收纳 CPU', short: '抬锁杆 / 抓边', chapter: '主板子装配拆卸', partIds: ['cpu', 'motherboard'], installIds: [], removeIds: ['cpu'], duration: 3,
    instruction: '需要回装时按产品要求清理接触面的旧导热膏。抬起 AM4 锁杆，抓住 CPU 边缘取出，保护底部针脚并放入合适包装。',
    prerequisites: ['散热器已经离开', '准备好 CPU 保护包装'], checks: ['锁杆已解锁', '未触碰或压弯针脚', 'CPU 已正确收纳'], warning: '不能在散热器仍黏着 CPU 时直接拉出处理器。', principle: 'CPU 只有在散热器离开、插座解锁后才能取出。', sources: ['S1', 'S4'], critical: true,
  },
  {
    id: 'D14', title: '取出电源并分类余件', short: '确认线缆已全解除', chapter: '复原与交接', partIds: ['psu', 'ioShield', 'standoffs'], installIds: [], removeIds: ['psu', 'ioShield', 'standoffs'], duration: 3.5,
    instruction: '确认交流线与全部设备线均已解除，扶住电源并卸下固定螺钉，移出封闭电源模块。核对挡板、支柱、AM4 背板和扣具并分类收纳。',
    prerequisites: ['所有设备供电线已断开', '主板已移出'], checks: ['电源无任何线缆牵扯', '模块始终受支撑', '固定件和匹配线材分类清楚'], warning: '不打开电源外壳；回装时不能混用其他电源的模组线。', principle: '最后移除承载性部件，保持整机拆卸过程可控。', sources: ['S6', 'S8'], critical: true,
  },
  {
    id: 'D15', title: '工位复原与拆卸记录', short: '清点与防静电收纳', chapter: '复原与交接', partIds: ['chassis'], installIds: [], removeIds: [], duration: 2,
    instruction: '逐项清点部件、工具与螺钉，检查针脚/插座/线材外观，登记损伤与待维护项。敏感部件放入防静电包装，机箱和侧板分开妥善放置。',
    prerequisites: ['拆卸操作已结束'], checks: ['部件与固定件数量核对完成', '待维护项有记录', '防静电与工位整理完成'], warning: '未确认的部件状态写待检查，不把“已拆完”当作“全部完好”。', principle: '可追溯交接让下一次装配从可靠基线开始。', sources: ['S1', 'S8'], critical: false,
  },
];

export const QUIZ = [
  { id: 'Q01', question: '准备拆装内部器件，哪项安全动作完整？', options: ['系统关机即可，交流线不用拔', '正常关机、PSU 置 O、拔交流线并建立 ESD 防护', '进入睡眠后直接操作', '只关闭显示器'], answer: 1, explanation: '主板可能仍有待机供电；内部操作前需完全断开交流电源，并按实训室规范防静电。', critical: true, sources: ['S1', 'S4'] },
  { id: 'Q02', question: '本课两条 DDR4 内存应安装到哪里？', options: ['A1 + A2', 'B1 + B2', 'A2 + B2', '任意相邻两槽'], answer: 2, explanation: 'B550-A PRO 的两条内存推荐 A2/B2；其他主板需重新查手册。', critical: false, sources: ['S1'] },
  { id: 'Q03', question: 'Ryzen 5 5600 的显示线应接到哪里？', options: ['主板 HDMI', '主板 DisplayPort', '任意 USB 接口', '独立显卡的 HDMI / DP'], answer: 3, explanation: '本课 5600 需要独立显卡；主板视频接口不能为该 CPU 提供正常显示输出。', critical: false, sources: ['S3'] },
  { id: 'Q04', question: '安装四弹簧螺钉 Wraith Stealth 前，应怎样处理 AM4 扣具？', options: ['拆塑料扣具，保留原 AM4 背板', '塑料扣具和背板都丢弃', '只用一颗螺钉固定', '改用 Intel 压盖'], answer: 0, explanation: '弹簧螺钉与原背板连接；本课路线需要移除塑料扣具但保留背板。', critical: true, sources: ['S4'] },
  { id: 'Q05', question: 'CPU_PWR1 的 EPS 8-pin 可否用显卡 PCIe 6+2 线代替？', options: ['可以，同为八针', '可以，只要用力插入', '不可以，应使用标注 CPU / EPS 的 4+4 线', '可以，只需更换插头颜色'], answer: 2, explanation: '器件端 EPS 4+4 与 PCIe 6+2 用途和接线不同，不能互换；相似外形不代表兼容。', critical: true, sources: ['S1', 'S6', 'S7'] },
  { id: 'Q06', question: '散热器已经固定，首次通电前还必须核对什么？', options: ['CPU 风扇接到 CPU_FAN1，且线不碰叶片', '只要 RGB 亮即可', 'CPU 风扇线可以不接', '把风扇线插入任意相近排针'], answer: 0, explanation: '散热器接触、风扇供电和正常工作共同构成散热条件，未就绪不能通电。', critical: true, sources: ['S1', 'S4'] },
  { id: 'Q07', question: '机箱里多装了一颗没有对应主板安装孔的支柱，应怎样处理？', options: ['保留，多一颗更牢', '用胶带盖住就算完成', '通电观察是否短路', '入箱前移除多余支柱'], answer: 3, explanation: '多余支柱可能触碰 PCB 背面线路；应按孔位逐一核对，不能靠通电试错。', critical: true, sources: ['S1'] },
  { id: 'Q08', question: '关于 M.2 2280 NVMe，哪项正确？', options: ['所有 M.2 外形 SSD 都使用 NVMe', '本课装 M2_1，外形长度和协议需分别核对', '必须另接 SATA 电源线', '直接竖直按压进插槽即可'], answer: 1, explanation: 'M.2 是外形规范，NVMe 是协议；本课选 2280 NVMe，并按本板 M2_1 安装要求操作。', critical: false, sources: ['S1', 'S2'] },
  { id: 'Q09', question: '拆卸本课独显时，正确的完整约束解除顺序是？', options: ['直接向上拔', '只卸挡板螺钉就拔', '断电、拔辅助供电、扶卡卸螺钉、解 PCIe 卡扣后移出', '拉供电线带出显卡'], answer: 2, explanation: '供电线、后挡板固定和插槽卡扣都必须解除，同时支撑显卡。', critical: true, sources: ['S1', 'S5'] },
  { id: 'Q10', question: '拆下螺钉后，AM4 散热器仍与 CPU 黏连，应该怎样做？', options: ['直接猛拔', '在裸 CPU 状态下通电加热', '保持插着风扇线继续扭转', '确认螺钉均释放，轻微左右转动解黏连后轻抬'], answer: 3, explanation: '旧膏可能把 AM4 CPU 带出锁定插座；应按 AMD 的拆卸方法轻转解除黏附。', critical: true, sources: ['S4'] },
  { id: 'Q11', question: 'UEFI 已识别新 SSD，却没有操作系统启动项，首先应判断为什么？', options: ['SSD 必然损坏', '可能尚未安装可引导操作系统', 'CPU 必然不兼容', '需要把显卡电源换成 EPS'], answer: 1, explanation: '磁盘被识别和磁盘中存在可引导系统是两件事；空盘没有启动项不等于硬件损坏。', critical: false, sources: ['S1'] },
  { id: 'Q12', question: '看到机箱风扇转动，可以直接证明哪一项？', options: ['至少部分供电和风扇电路在工作，仍须核对 POST', '整机所有硬件正常', '操作系统已经安装成功', '内存稳定性测试已通过'], answer: 0, explanation: '风扇转动不等于 POST、UEFI 检查或 OS 引导已通过。', critical: false, sources: ['S1'] },
  { id: 'Q13', question: '可选 2.5 英寸 SATA SSD 需要怎样连接？', options: ['只接 SATA 数据线', '只接 SATA 电源线', '主板 SATA 数据线与电源 SATA 供电都要接', '接 CPU_FAN1'], answer: 2, explanation: 'SATA SSD 的数据和供电使用两类独立连接；本课 NVMe 系统盘则不需这些线。', critical: false, sources: ['S1', 'S7'] },
  { id: 'Q14', question: '本课显卡在低温待机时双风扇静止，哪种判断合理？', options: ['显卡必然损坏', '必须立刻拆开电源', '主板内存插反了', '本型号有低温停转，需结合温度和功能检查'], answer: 3, explanation: 'MSI 该型号具有 Zero Frozr；单看风扇静止不能诊断显卡故障。', critical: false, sources: ['S5'] },
  { id: 'Q15', question: '更换另一款模组电源后，旧线看起来能插入，应怎么做？', options: ['继续沿用，外形一致即可', '只使用新电源匹配线材，核对厂商兼容性', '把 CPU 和 PCIe 线互换试一下', '任意购买同色线即可'], answer: 1, explanation: '模组电源端的接线并非跨型号统一；外形相似不能证明线材匹配。', critical: true, sources: ['S6'] },
  { id: 'Q16', question: 'Ryzen 5 5600 的 90°C Tjmax 应怎样理解？', options: ['本型号规格上限，不是课程合格温度目标', '所有 CPU 的通用安全温度', 'UEFI 低于 90°C 就一定装配合格', '所有电脑应该待机到 90°C'], answer: 0, explanation: '温度应结合产品、负载和趋势检查；不能把规格上限当作验收目标。', critical: false, sources: ['S3'] },
];

export const FAULTS = [
  {
    id: 'F01', title: '按按钮完全无反应', symptom: '机箱按钮按下后没有启动迹象，尚未发现烟雾、异味或破损。',
    options: ['反复短接陌生排针试机', '先按安全流程断电，核对交流线 / PSU 开关、24-pin / EPS 与 JFP1 PWR SW', '立即判定 CPU 损坏', '带电重插内存'], answer: 1,
    explanation: '先从供电与按钮链路逐项核对。发现异物或短路迹象要停止；电源已安装不代表连接都正确。', sources: ['S1', 'S6'], critical: true,
  },
  {
    id: 'F02', title: '风扇转动但没有画面', symptom: '本课 Ryzen 5 5600 已装独显，显示线却接在主板 HDMI，屏幕无信号。',
    options: ['把显示线接到独显，并检查显示器输入源', '更换为另一条主板视频口即可', '重装操作系统可以解决主板视频输出', '将 EPS 4+4 改插显卡'], answer: 0,
    explanation: '5600 需要独显。先正确连接显示链路，再结合显卡座合、辅助供电和 Debug 状态进一步检查。', sources: ['S3', 'S5'], critical: false,
  },
  {
    id: 'F03', title: 'DRAM 状态持续异常', symptom: '首次启动持续停在 DRAM 相关状态；两条内存的座合尚未核实。',
    options: ['风扇能转说明内存没问题', '立刻宣布主板损坏', '完全断电后核对 A2/B2 与两端座合，必要时按手册单条 A2 排查', '带电按紧内存'], answer: 2,
    explanation: '先确认正确插槽和完全到位，再用一次只改变一个因素的方法排查。一个指示状态不能证明器件已经损坏。', sources: ['S1'], critical: true,
  },
  {
    id: 'F04', title: 'CPU 状态持续异常', symptom: '系统持续显示 CPU 相关异常，CPU_PWR1 的线束标签还未核对。',
    options: ['同为八针就不需检查', '不断强制开关机直到成功', '在开机状态拔下 CPU 供电观察', '关机断电后核对 EPS，再检查安装 / 针脚与 CPU-BIOS 支持条件'], answer: 3,
    explanation: 'CPU 供电、正确安装和固件支持都可能相关。针脚和 BIOS 维护由教师按实物情况处理，不凭灯名直接判定 CPU 坏。', sources: ['S1', 'S6', 'S9'], critical: true,
  },
  {
    id: 'F05', title: 'VGA 状态持续异常', symptom: '系统持续显示 VGA 相关异常，显卡辅助供电与插槽卡扣状态未知。',
    options: ['VGA 灯必然证明显卡损坏', '断电核对显卡辅助供电、座合和固定，结合手册再检查相关设备', '忽略指示直接拆 CPU', '把显卡接到任意长插槽即可'], answer: 1,
    explanation: '先检查本卡单 8-pin、PCI_E1 与显示链路。本板手册的 VGA 指示范围也涉及 GPU / PCIe / M.2，仍需进一步验证。', sources: ['S1', 'S5'], critical: false,
  },
  {
    id: 'F06', title: 'BOOT 状态与空盘', symptom: 'UEFI 能识别 M2_1 的新 SSD，但没有可引导操作系统，BOOT 相关状态提示异常。',
    options: ['SSD 一定损坏，需要换盘', '显卡供电一定插反', '先区分磁盘识别与 OS 启动项，确认是否已安装可引导系统', '只要开 XMP 就会生成系统'], answer: 2,
    explanation: '新空盘可能没有启动项。POST / UEFI 与操作系统引导是不同检查层级，不应跳过事实直接换硬件。', sources: ['S1'], critical: false,
  },
  {
    id: 'F07', title: 'CPU 风扇不转且温度异常', symptom: '教学模拟中，CPU 风扇无转动，CPU 温度持续快速上升。',
    options: ['先安全停止并关机断电，再核对 CPU_FAN1、导线 / 扇叶与散热接触', '运行更久看能否恢复', '把 90°C 当成所有电脑合格标准', '在运行中拆下散热器'], answer: 0,
    explanation: '散热异常不通过延长运行试错。CPU 规格上限不是装配验收目标；风扇供电与散热接触都需检查。', sources: ['S1', 'S3', 'S4'], critical: true,
  },
  {
    id: 'F08', title: 'SATA 扩展盘不可见', symptom: '已开启可选 SATA SSD，盘已固定，但目前只确认接了一条数据线。',
    options: ['NVMe 不能和 SATA 同时使用', '一定是 CPU 不兼容', '把数据线接到 CPU_FAN1', '断电检查 SATA 供电与数据两条线，再核对端口和 UEFI 识别'], answer: 3,
    explanation: 'SATA SSD 需要数据与供电连接，机械固定不等于完整连接。未配置扩展时本场景只作为知识练习。', sources: ['S1', 'S7'], critical: false,
  },
];
