/**
 * 商品图 / 商品详情图风格模板配置（Minimax 优化版）
 * 目标：让生成效果更接近"高品质电商详情图 / 品牌宣传图 / 分模块详情页"
 *
 * 关键改动：
 * 1. stylePrompt 从短英文描述改为更适合 Minimax 的中文强约束提示词。
 * 2. 增加 detailPrompt、negativePrompt、modulePrompts、outputRules，方便拼接完整提示词。
 * 3. 补齐常用的 #12 #13 #15 #16 风格，与你实际使用的"质感细节主图风 / 商务简约主图风 / 生活化场景详情 / 精致布景详情"一致。
 * 4. 增加通用商品详情页模块，避免 Minimax 把所有信息挤在一张图里。
 */

export interface DetailModulePrompt {
  id: string;
  name: string;
  prompt: string;
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  /** 主风格提示词：建议直接参与最终 prompt 拼接 */
  stylePrompt: string;
  /** 更细的执行约束：适合放在 stylePrompt 后面 */
  detailPrompt?: string;
  /** 负面提示词：建议单独放入 minimax 的 negative prompt，若无负面框则追加到末尾 */
  negativePrompt?: string;
  /** 此风格适合拆分成哪些模块 */
  modulePrompts?: DetailModulePrompt[];
  /** 输出规则：用于稳定版式、文字、构图 */
  outputRules?: string[];
  构图Keywords: string[];
  光影Keywords: string[];
  色彩Keywords: string[];
}

/** 全局高质量商品详情页规则：建议每次都拼接 */
export const GLOBAL_PRODUCT_DETAIL_RULES = [
  '高品质电商商品详情图，商业广告级写实摄影，画面干净，主体突出，视觉层级清晰',
  '中文电商详情页设计，标题清晰，卖点明确，模块化排版，阅读路径顺畅',
  '产品比例准确，外观完整展示，材质纹理清晰，细节真实可信，避免夸张变形',
  '光线自然均匀，不遮挡产品，不影响产品轮廓和细节展示',
  '图片内中文尽量清晰可辨认，字体简洁高级，避免乱码和错字',
  '若用户要求"每个模块一张图"，必须每次只生成一个独立模块，不要把所有模块挤在一张长图内'
];

/** 通用负面提示词：建议作为 negative prompt 使用 */
export const GLOBAL_NEGATIVE_PROMPT = [
  '低清晰度，模糊，噪点，脏污画面，廉价感，塑料感过强，产品变形，比例失真，主体被裁切，信息被裁切',
  '构图混乱，信息拥挤，文字过密，中文乱码，错别字过多，排版杂乱，视觉层级不清',
  '过曝，过暗，强反光遮挡产品，阴影生硬，背景喧宾夺主，杂物过多，无关道具过多',
  '卡通风，插画风，AI感强，过度滤镜，过度磨皮，虚假材质，不真实反射'
].join('，');

/** 通用详情页模块：用于"拆模块生成"，每个模块单独出一张图 */
export const PRODUCT_DETAIL_MODULES: DetailModulePrompt[] = [
  {
    id: 'hero',
    name: '标题主视觉区',
    prompt: '单独生成标题主视觉模块，品牌标识清晰，商品名称大字标题，核心卖点短句，产品主图完整突出，大面积留白，商业广告主视觉，适合详情页首屏，不要出现其他模块。'
  },
  {
    id: 'overview',
    name: '产品全景展示区',
    prompt: '单独生成产品全景展示模块，展示正面、侧面、背面、45度角等多角度外观，主体完整不裁切，背景简洁，标注简洁中文说明，不要出现参数表和生活场景。'
  },
  {
    id: 'features',
    name: '核心卖点区',
    prompt: '单独生成核心卖点模块，3到6个主要卖点卡片，图标加短文案，产品辅助展示，信息清晰，版式整齐，不要把产品参数、场景图、售后信息混入。'
  },
  {
    id: 'details',
    name: '材质细节区',
    prompt: '单独生成材质细节模块，微距特写，材质纹理清晰，做工细节、边角、接口、缝线、表面肌理等局部放大，配简洁中文标注，画面高级干净。'
  },
  {
    id: 'structure',
    name: '结构解析区',
    prompt: '单独生成结构解析模块，爆炸图或分层结构示意，关键部件清晰标注，理性直观，适合数码、家电、鞋服等商品，不要出现生活场景。'
  },
  {
    id: 'specs',
    name: '规格参数区',
    prompt: '单独生成规格参数模块，产品小图加参数表，尺寸测量线、重量、材质、容量、型号等信息分区清晰，背景干净，文字尽量可读。'
  },
  {
    id: 'scenario',
    name: '使用场景区',
    prompt: '单独生成使用场景模块，真实生活化场景，人物或环境自然使用商品，产品仍然清晰突出，光线自然柔和，氛围真实，不要出现复杂参数表。'
  },
  {
    id: 'comparison',
    name: '对比展示区',
    prompt: '单独生成对比展示模块，本款商品与普通款对比，表格或左右对比结构，优势可视化，信息理性直观，保持商业详情页质感。'
  },
  {
    id: 'package',
    name: '配件包装区',
    prompt: '单独生成配件包装模块，包装盒、配件清单、赠品、说明书等整齐陈列，主体清楚，电商开箱展示风格，背景简洁。'
  },
  {
    id: 'service',
    name: '品牌售后区',
    prompt: '单独生成品牌与售后保障模块，品牌理念、正品保障、售后服务、发货保障、用户口碑等图标卡片，版式整洁可信，不要堆叠过多小字。'
  }
];

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'japanese_clean',
    name: '日系清新治愈风',
    description: '日系生活化治愈调性，适合甜品、家居、日用、服饰、母婴、轻食等温柔场景商品',
    keywords: [
      '日系', '清新', '治愈', '奶油色', '原木', '白纱', '窗边光', '低饱和', '暖调', '柔和',
      '甜品', '蛋糕', '下午茶', '家居', '生活化', '自然光', '松弛', '素雅', '温柔', '淡雅',
      '森系', '棉麻', '绿植', '小清新', '咖啡', '茶点', '手作', '自然', '通透', '干净'
    ],
    stylePrompt: '日系清新治愈风商品详情图，低饱和奶油色调，原木桌面，窗边自然柔光，白纱漫反射，背景柔和虚化，画面温柔、通透、干净、松弛，真实生活化实拍质感。',
    detailPrompt: '适合做甜品、家居、日用商品详情图。强调自然暖光、真实材质、轻柔阴影、干净留白、温柔排版。避免高饱和、强对比和过度商业棚拍感。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT,
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['窗边场景', '原木桌面', '45度斜拍', '留白构图', '生活化摆拍'],
    光影Keywords: ['自然窗光', '暖调柔光', '白纱漫反射', '柔和阴影', '浅景深虚化'],
    色彩Keywords: ['奶油白', '原木色', '低饱和', '暖黄色', '淡雅色调']
  },

  {
    id: 'realistic_commercial',
    name: '实景写实商用风',
    description: '真实商用实拍效果，适合全品类商品详情页、商品实拍、主图和线下同款展示',
    keywords: [
      '写实', '真实', '实景', '商用', '电商', '详情页', '自然光', '无滤镜', '原生色彩', '高清',
      '细节', '商品实拍', '多角度', '真实质感', '比例准确', '产品展示', '干净', '清晰', '生活场景', '室内',
      '户外', '实物', '商品转化', '图文结合', '商业摄影', '主图', '细节图', '场景图', '客观', '耐看'
    ],
    stylePrompt: '实景写实商用风商品详情图，全真实物商用实拍效果，光线自然柔和，明暗过渡均衡，严格还原商品原生色彩、材质纹理和真实比例，画面干净整洁，适合电商详情页。',
    detailPrompt: '要求商品主体完整清晰，细节可辨，避免过度滤镜和虚假美化。可结合生活环境，但背景不能干扰产品展示。版式采用中文电商详情页模块化结构。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT,
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['正面展示', '45度视角', '多角度实拍', '中心构图', '留白构图'],
    光影Keywords: ['自然光', '柔和室内光', '真实阴影', '均匀补光', '不过曝'],
    色彩Keywords: ['原生色彩', '真实色彩', '低滤镜', '自然色调', '干净色彩']
  },

  {
    id: 'dopamine_trend',
    name: '活力多巴胺潮流风',
    description: '年轻潮流视觉，适合潮鞋、潮玩、文创、小百货、年轻化美妆和活动主图',
    keywords: [
      '潮流', '年轻', '多巴胺', '高饱和', '撞色', '明亮', '潮牌', '街头', '元气', '活泼',
      '创意', '彩色', '马卡龙', '渐变', '几何', '亚克力', '磨砂', '高亮度', '亮色', '通透',
      '彩虹', '糖果色', '街头潮流', '年轻化', '设计感', '活力', '吸睛', '主图', '种草', '社媒'
    ],
    stylePrompt: '活力多巴胺潮流商品图，年轻化潮牌视觉，明亮通透，高级撞色，几何色块点缀，整体活泼但不杂乱，商业广告风，适合潮流商品和年轻化电商主图。',
    detailPrompt: '若用户要求"干净浅灰背景、无杂物"，则降低彩色道具比例，只保留潮流感构图、年轻化版式和少量点缀，确保主体商品是第一视觉中心。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，颜色过乱，背景抢主体，廉价彩色塑料感',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['中心构图', '潮流摆拍', '几何分区', '大面积留白', '视觉聚焦'],
    光影Keywords: ['明亮柔光', '高亮通透', '柔和高光', '干净阴影'],
    色彩Keywords: ['撞色', '马卡龙', '高饱和', '亮色', '低饱和背景搭配亮色点缀']
  },

  {
    id: 'tmall_pro',
    name: '天猫大牌旗舰店视觉',
    description: '高端品牌电商视觉，适合服装、美妆、家电、数码、鞋包等旗舰店主图和详情页',
    keywords: [
      '天猫', '旗舰店', '品牌', '高端', '高级', '专业', '精致', '商业广告', '大牌', '新品',
      '服装', '鞋包', '美妆', '家电', '数码', '主图', '详情页', '品牌宣传', '质感', '高清',
      '简约', '高级灰', '官方视觉', '营销', '促销', '热卖', '品质', '电商', '京东', '淘宝'
    ],
    stylePrompt: '天猫大牌旗舰店视觉，高端品牌商业广告质感，画面简洁大气，商品主体突出，专业影棚级布光，版式规整，中文标题清晰，适合电商主图与详情页。',
    detailPrompt: '强调品牌感、官方视觉、专业摄影、高清锐利、质感强、商品转化。不要过度生活化，不要杂乱背景。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，廉价促销风，杂乱小字堆砌，低端详情页质感',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['中心对称', '产品居中', '大面积留白', '模块化排版'],
    光影Keywords: ['专业影棚光', '柔光箱', '轮廓光', '均匀补光'],
    色彩Keywords: ['高级灰', '中性色调', '低饱和', '品牌主色']
  },

  {
    id: 'skincare_closeup',
    name: '美妆微距特写',
    description: '极致细节展现，适合护肤、彩妆、香水、口红、精致小件商品',
    keywords: [
      '细节', '特写', '近拍', '放大', '质感', '包装', '瓶身', '滴管', '膏体', '质地',
      '光泽', '珠光', '哑光', '丝绒', '雾面', '水润', '通透', '显色', '持久', '细腻',
      '纹理', '光感', '高光', '阴影', '立体', '轮廓', '精致', '奢华', '美妆', '口红'
    ],
    stylePrompt: '美妆微距特写商品详情图，极致清晰的产品局部特写，真实表现膏体、瓶身、金属、玻璃、塑料、纸盒等材质纹理，光影细腻，高级美妆广告质感。',
    detailPrompt: '适合生成口红、面霜、精华等详情模块。强调质地、光泽、显色、包装细节，中文标注简洁清晰。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，妆感脏，膏体变形，瓶身畸变，材质糊成一片',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['中心特写', '黄金比例', '浅景深', '微距透视'],
    光影Keywords: ['环形补光', '微距补光', '柔和高光', '反光控制'],
    色彩Keywords: ['通透干净', '产品本色', '高级暖色', '低饱和']
  },

  {
    id: '3c_tech',
    name: '3C数码科技',
    description: '科技感工业风，适合手机、电脑、耳机、智能手表、智能硬件、电器等数码科技商品',
    keywords: [
      '手机', '电脑', '笔记本', '平板', '耳机', '音箱', '充电器', '数据线', '智能', '科技',
      '数码', '电子', '硬件', '设备', '屏幕', '处理器', '芯片', '内存', '存储', '电池',
      '充电', '无线', '蓝牙', 'WiFi', '性能', '配置', '新品', '旗舰', '黑科技', '智能手表'
    ],
    stylePrompt: '数码科技质感详情风，深空灰、金属银、科技蓝冷色调背景，未来感工业风，精准布光，硬光勾勒轮廓，高光锐利，阴影干净，金属反光与玻璃通透质感清晰。',
    detailPrompt: '适合手机、智能手表、耳机等。强调参数展示清晰、功能卖点可视化、多角度展示、接口特写、屏幕细节、按键细节、结构轮廓。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，赛博元素过多，霓虹过曝，屏幕乱码，产品结构不合理，科技背景抢主体',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['斜45度', '悬浮效果', '对称展示', '参数分区', '模块化排版'],
    光影Keywords: ['精准布光', '硬光勾勒', '轮廓光', '金属高光', '干净阴影'],
    色彩Keywords: ['深空灰', '金属银', '科技蓝', '冷色调', '黑蓝渐变']
  },

  {
    id: 'food_gourmet',
    name: '美食餐饮',
    description: '食欲诱发的美食摄影，适合蛋糕、甜品、饮品、外卖、食品包装、菜单图',
    keywords: [
      '美食', '食物', '餐饮', '外卖', '菜品', '料理', '食材', '新鲜', '烹饪', '厨师',
      '餐厅', '菜单', '打包', '便当', '快餐', '甜点', '蛋糕', '咖啡', '饮料', '奶茶',
      '火锅', '烧烤', '日料', '西餐', '中餐', '小吃', '零食', '水果', '芝士', '奶酪'
    ],
    stylePrompt: '美食餐饮商品详情图，食欲感强，真实食材质感，温暖自然光，色彩真实鲜嫩，摆盘精致，背景有餐厅或甜品店氛围，高清写实不过度美化。',
    detailPrompt: '适合芝士蛋糕、甜品、饮品等。强调整体外观、切面内馅、食材原料、纹理特写、食用场景。多模块时每个模块独立生成，避免挤成一张超长图。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，食物发灰，油腻脏污，过度饱和，假塑料食物，过度滤镜',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['45度斜拍', '俯视平铺', '切面特写', '局部微距', '餐桌场景'],
    光影Keywords: ['侧窗自然光', '暖光', '柔和逆光', '浅景深', '真实阴影'],
    色彩Keywords: ['暖色调', '奶油色', '食欲色', '新鲜果色', '低饱和温柔']
  },

  {
    id: 'home_lifestyle',
    name: '家居生活',
    description: '温馨生活场景，适合家居、家纺、收纳、装饰和居家电器商品',
    keywords: [
      '家具', '家居', '床品', '四件套', '枕头', '被子', '窗帘', '地毯', '收纳', '整理',
      '装饰', '摆件', '绿植', '鲜花', '香薰', '蜡烛', '抱枕', '沙发', '椅子', '桌子',
      '柜子', '书架', '台灯', '落地灯', '日式', '北欧', '极简', '温馨', '舒适', '冰箱'
    ],
    stylePrompt: '家居生活详情图，真实温馨室内场景，北欧或日式极简空间，柔和自然窗光，商品融入生活环境，画面干净舒适，适合家居和家电电商详情页。',
    detailPrompt: '强调空间感、真实使用状态、商品环境融合。家电类需要保持主体完整清晰，场景不能遮挡产品。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，室内杂乱，商品被遮挡，空间透视错误，光线影响主体展示',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['空间感', '室内场景', '斜线构图', '生活痕迹', '全景展示'],
    光影Keywords: ['暖黄灯光', '自然窗光', '柔和阴影', '氛围灯', '均衡明暗'],
    色彩Keywords: ['木色系', '奶油白', '奶茶色', '低饱和温柔', '浅灰']
  },

  {
    id: 'sports_outdoor',
    name: '运动户外',
    description: '活力动感风格，适合运动鞋、运动服饰、户外装备、健身器材',
    keywords: [
      '运动', '健身', '跑步', '瑜伽', '训练', '体育', '户外', '露营', '徒步', '登山',
      '骑行', '游泳', '篮球', '足球', '羽毛球', '网球', '装备', '服饰', '运动鞋', '背包',
      '水壶', '护具', '功能性', '弹力', '透气', '速干', '轻盈', '专业', '高性能', '球鞋'
    ],
    stylePrompt: '运动户外商品详情图，动感、专业、活力，突出运动功能与穿着表现，产品细节清晰，鞋服类展示材质、结构、上身效果和使用场景。',
    detailPrompt: '适合运动鞋和户外装备。若用于电商主图，优先使用干净背景和完整产品展示；若用于详情页，拆成整体造型、材质细节、结构功能、上身场景、尺码参数等模块。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，动作模糊过度，鞋子变形，脚部畸形，场景杂乱',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['低角度', '动感构图', '产品居中', '上脚展示', '场景展示'],
    光影Keywords: ['自然日光', '硬调侧光', '柔和棚拍光', '轮廓光'],
    色彩Keywords: ['运动蓝', '活力橙', '黑白灰', '高饱和点缀']
  },

  {
    id: 'jewelry_luxury',
    name: '珠宝奢品',
    description: '高端奢华质感，适合首饰、腕表、箱包、轻奢配饰和高客单价商品',
    keywords: [
      '珠宝', '首饰', '项链', '耳环', '手链', '戒指', '钻戒', '黄金', '手表', '腕表',
      '奢品', '奢侈品', '名牌', '包', '手袋', '皮带', '银饰', '珍珠', '翡翠', '玉石',
      '宝石', '镶钻', '限量', '精致', '奢华', '高级', '贵重', '典雅', '传世', '轻奢'
    ],
    stylePrompt: '珠宝奢品商品图，高端奢华品牌广告质感，极简留白，精致反光，金属、皮革、宝石材质真实，高级影棚布光，画面干净贵气。',
    detailPrompt: '强调微距细节、工艺、材质、品牌高级感。避免堆叠信息，适合高客单价商品主视觉和详情模块。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，廉价饰品感，反光脏，材质不真实，过度闪耀刺眼',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['中心聚焦', '极简留白', '对称构图', '微距细节'],
    光影Keywords: ['金属反光控制', '单灯轮廓', '柔光箱散射', '高光点缀'],
    色彩Keywords: ['黑色背景', '香槟金', '钻石白', '高对比', '高级灰']
  },

  {
    id: 'packaging_commercial',
    name: '包装设计',
    description: '产品包装展示，适合快消品、食品、饮料、日化、礼盒和套装商品',
    keywords: [
      '包装', '瓶身', '盒装', '袋装', '罐装', '软包', '瓶盖', '标签', '设计', '平面',
      '视觉', '货架', '陈列', '超市', '便利店', '快消', '食品', '饮料', '牛奶', '酸奶',
      '零食', '日化', '洗护', '清洁', '新品', '上市', '规格', '容量', '礼盒', '套装'
    ],
    stylePrompt: '商业包装设计商品图，包装正面清楚，标签可读，陈列整齐，干净白底或浅色商业背景，色彩还原准确，适合电商主图和包装详情展示。',
    detailPrompt: '强调包装完整展示、标签、容量、规格、开箱、配件清单、礼盒陈列。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，包装文字乱码，标签扭曲，瓶身变形，陈列杂乱',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['白底平铺', '斜摆展示', '陈列场景', '包装细节', '整齐排列'],
    光影Keywords: ['标准白底光', '边缘轮廓光', '中性色温', '柔和无影'],
    色彩Keywords: ['白底标准', '色彩还原准确', '高清晰度', '商业标准']
  },

  {
    id: 'texture_detail_main',
    name: '质感细节主图风',
    description: '侧重材质纹理和做工细节，适合鞋服、家电、数码、美妆、家具等高质感商品主图',
    keywords: [
      '质感', '细节', '纹理', '材质', '特写', '微距', '高清', '表面', '肌理', '做工',
      '工艺', '皮质', '网面', '金属', '玻璃', '橡胶', '木纹', '布料', '缝线', '接口',
      '拉丝', '磨砂', '触感', '真实', '品质', '主图', '高级', '精致', '细腻', '立体'
    ],
    stylePrompt: '质感细节主图风，侧重商品材质纹理与做工细节，高清微距拍摄，立体柔和光影，真实还原皮质、网面、橡胶、金属、玻璃、织物等材质，本色还原，品质感强。',
    detailPrompt: '适合需要"看得见质感"的商品。画面需要主体突出、背景极简、纹理清晰、细节锐利，但不要过度锐化。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，材质糊，纹理假，过度锐化，表面脏污，细节丢失',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['产品居中', '微距特写', '局部放大', '大面积留白', '极简构图'],
    光影Keywords: ['层次柔光', '立体光影', '细腻高光', '真实阴影', '反光控制'],
    色彩Keywords: ['原色还原', '低饱和', '高级灰', '浅灰背景', '自然色']
  },

  {
    id: 'business_minimal_main',
    name: '商务简约主图风',
    description: '稳重干净的商务主图，适合家电、数码、办公用品、器材、男装和高品质商品',
    keywords: [
      '商务', '简约', '稳重', '干净', '专业', '主图', '浅色背景', '中性光线', '对称', '工整',
      '高级灰', '低饱和', '理性', '质感', '办公', '陈列', '器材', '家电', '数码', '男士',
      '正规', '比例准确', '纯净', '无杂物', '品牌', '大气', '平衡', '清晰', '静物', '商业摄影'
    ],
    stylePrompt: '商务简约主图风，中性光线，素雅配色，工整构图，对称摆放，稳重视觉，画面简洁干净，商品占据画面主体，适合商业主图与品牌宣传。',
    detailPrompt: '强调正规比例、主体完整、光亮背景、专业干净、无多余装饰。适合冰箱、手机、电脑、办公器材等。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，背景杂乱，产品被裁切，比例不正规，低端白底图',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['中心对称', '正面展示', '大面积留白', '平衡布局', '规整陈列'],
    光影Keywords: ['中性光线', '柔和弱光', '均匀补光', '平缓明暗', '无影柔光'],
    色彩Keywords: ['浅灰', '白色', '高级灰', '中性色', '低饱和']
  },

  {
    id: 'lifestyle_detail',
    name: '生活化场景详情',
    description: '真实生活场景与使用演示，适合家电、食品、鞋服、家居、母婴、日用等详情页模块',
    keywords: [
      '生活化', '场景', '详情页', '居家', '实景', '使用演示', '自然光', '真人互动', '日常', '收纳',
      '厨房', '客厅', '卧室', '办公室', '穿搭', '上身', '食用', '使用状态', '真实环境', '温馨',
      '自然', '长图', '模块', '电商', '商品融合', '生活氛围', '清晰', '完整', '场景图', '转化'
    ],
    stylePrompt: '生活化场景详情图，真实居家或日常实景，商品处于自然使用状态，自然室内柔光，原生生活氛围，商品与环境融合但主体仍然清晰突出。',
    detailPrompt: '适合生成使用场景模块。要求真实、自然、有代入感。不要让人物或环境遮挡产品，不要把场景拍得像杂乱随手照。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，场景杂乱，人物抢主体，商品不清晰，生活场景与产品无关',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['生活场景', '真实使用', '全景展示', '45度实拍', '场景分区'],
    光影Keywords: ['自然室内柔光', '窗边光', '暖调柔光', '真实阴影'],
    色彩Keywords: ['自然色', '低饱和', '温馨色调', '奶油色', '原木色']
  },

  {
    id: 'delicate_scene_detail',
    name: '精致布景详情',
    description: '高级软装和精致布景详情，适合甜品、美妆、家居、鞋服、礼盒、高品质消费品',
    keywords: [
      '精致', '布景', '高级', '种草', '氛围', '详情页', '软装', '长图', '多层内容', '雅致',
      '摆盘', '场景展示', '45度角', '质感特写', '配件细节', '自然柔光', '分层', '立体', '美感', '商品搭配',
      '生活方式', '高级感', '温柔', '干净', '留白', '模块化', '阅读路径', '电商', '主视觉', '品牌感'
    ],
    stylePrompt: '精致布景详情图，高级软装实景，分层立体布景，雅致环境，商品组合搭配自然，氛围柔和，画面有种草感和品牌感，适合高品质电商详情页。',
    detailPrompt: '适合首屏、场景、食材、包装、售后等模块。强调摆放精致、层次丰富但不杂乱，商品主体清晰。',
    negativePrompt: GLOBAL_NEGATIVE_PROMPT + '，道具喧宾夺主，摆件过多，画面拥挤，商品被遮挡',
    modulePrompts: PRODUCT_DETAIL_MODULES,
    outputRules: GLOBAL_PRODUCT_DETAIL_RULES,
    构图Keywords: ['长幅详情构图', '多层内容排布', '45度角度实拍', '留白排版'],
    光影Keywords: ['氛围自然柔光', '柔和高光', '浅景深', '层次光影'],
    色彩Keywords: ['奶油色', '低饱和', '浅灰', '原木色', '高级柔和色']
  }
];

/**
 * 推荐拼接函数：让最终 prompt 更稳定。
 * 用法：buildFinalPrompt('帮我生成一张手机商品详情图...', selectedStyle, ['hero', 'features'])
 */
export function buildFinalPrompt(
  userInput: string,
  style: StyleTemplate,
  moduleIds?: string[],
  options?: { splitModules?: boolean; productName?: string }
): string {
  const selectedModules = moduleIds?.length
    ? (style.modulePrompts || PRODUCT_DETAIL_MODULES).filter((m) => moduleIds.includes(m.id))
    : [];

  const moduleText = selectedModules.length
    ? selectedModules.map((m, index) => `模块${index + 1}【${m.name}】：${m.prompt}`).join('\n')
    : '';

  const splitRule = options?.splitModules
    ? '重要：本次只生成一个独立模块，不要生成完整长图，不要把所有模块挤在一张图里。每个模块单独成图，主体完整，信息不裁切。'
    : '生成完整商品详情页时，采用竖版长图、模块化分区、信息层级清晰；若信息过多，优先减少小字而不是挤压画面。';

  return [
    `用户需求：${userInput}`,
    `选用风格：${style.name}`,
    style.stylePrompt,
    style.detailPrompt || '',
    GLOBAL_PRODUCT_DETAIL_RULES.join('，'),
    splitRule,
    moduleText,
    `构图关键词：${style.构图Keywords.join('，')}`,
    `光影关键词：${style.光影Keywords.join('，')}`,
    `色彩关键词：${style.色彩Keywords.join('，')}`,
    `负面提示词：${style.negativePrompt || GLOBAL_NEGATIVE_PROMPT}`
  ]
    .filter(Boolean)
    .join('\n\n');
}
