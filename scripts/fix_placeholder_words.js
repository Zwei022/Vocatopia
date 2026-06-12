/**
 * 修復 155 個佔位符單字（definition 含 "(restored)" 的範本資料）
 * 1) 26 字保留並填入完整資料（官方字表內 + 會考閱讀高價值字）
 * 2) 129 字刪除（變化形 / 超出會考程度）
 * 3) 129 字從官方字表缺漏回填，補到剛好 2000
 * 內容依 cambridge-style-examples 規範：原創例句、A2 英文定義、短語式繁中定義
 */
const supabase = require('../server/db/supabase');

// ── 1) 保留並補資料（26）──────────────────────────────────────
const KEEP_FIXES = [
  { word: "operate", pos: "v.", phonetic: "/ˈɑː.pə.reɪt/", definition: "to work or use a machine, or to do its job", definition_zh: "操作；運轉；營運", example_en: "He learned to operate the new coffee machine in five minutes.", example_zh: "他五分鐘就學會操作新的咖啡機。" },
  { word: "policeman", pos: "n.", phonetic: "/pəˈliːs.mən/", definition: "a male police officer", definition_zh: "警察；男警員", example_en: "The policeman helped the lost child find her mother.", example_zh: "那位警察幫助迷路的小孩找到媽媽。" },
  { word: "produce", pos: "v.", phonetic: "/prəˈduːs/", definition: "to make or grow something", definition_zh: "生產；製造；出產", example_en: "This farm produces fresh milk for the whole town.", example_zh: "這座農場為全鎮生產新鮮牛奶。" },
  { word: "production", pos: "n.", phonetic: "/prəˈdʌk.ʃən/", definition: "the process of making or growing things", definition_zh: "生產；製造；產量", example_en: "The factory stopped production because of the typhoon.", example_zh: "工廠因為颱風停止生產。" },
  { word: "progress", pos: "n.", phonetic: "/ˈprɑː.ɡres/", definition: "the process of getting better or closer to a goal", definition_zh: "進步；進展", example_en: "My little brother has made great progress in math this semester.", example_zh: "我弟弟這學期數學進步很多。" },
  { word: "promise", pos: "v.", phonetic: "/ˈprɑː.mɪs/", definition: "to say that you will surely do something", definition_zh: "承諾；答應", example_en: "Dad promised to take us to the beach this weekend.", example_zh: "爸爸答應這個週末帶我們去海邊。" },
  { word: "protect", pos: "v.", phonetic: "/prəˈtekt/", definition: "to keep someone or something safe from harm", definition_zh: "保護；防護", example_en: "A helmet protects your head when you ride a bike.", example_zh: "騎腳踏車時，安全帽能保護你的頭部。" },
  { word: "provide", pos: "v.", phonetic: "/prəˈvaɪd/", definition: "to give someone something they need", definition_zh: "提供；供給", example_en: "The school provides free lunch for every student.", example_zh: "學校為每位學生提供免費午餐。" },
  { word: "purpose", pos: "n.", phonetic: "/ˈpɝː.pəs/", definition: "the reason why you do something", definition_zh: "目的；用途", example_en: "The purpose of this meeting is to plan the school trip.", example_zh: "這次會議的目的是規劃校外教學。" },
  { word: "safety", pos: "n.", phonetic: "/ˈseɪf.ti/", definition: "the state of being safe from danger", definition_zh: "安全", example_en: "Please wear a seat belt for your own safety.", example_zh: "為了你自身的安全，請繫上安全帶。" },
  { word: "slender", pos: "adj.", phonetic: "/ˈslen.dɚ/", definition: "thin in an attractive way", definition_zh: "苗條的；纖細的", example_en: "The dancer is tall and slender.", example_zh: "那位舞者又高又苗條。" },
  { word: "slippers", pos: "n.", phonetic: "/ˈslɪp.ɚz/", definition: "soft shoes that people wear inside the house", definition_zh: "拖鞋；室內便鞋", example_en: "She put on her slippers as soon as she got home.", example_zh: "她一回到家就穿上拖鞋。" },
  { word: "survive", pos: "v.", phonetic: "/sɚˈvaɪv/", definition: "to continue to live after a dangerous event", definition_zh: "倖存；存活；生還", example_en: "Camels can survive for days in the desert without water.", example_zh: "駱駝在沙漠中沒有水也能存活好幾天。" },
  { word: "symbol", pos: "n.", phonetic: "/ˈsɪm.bəl/", definition: "a sign or object that stands for something else", definition_zh: "符號；象徵", example_en: "The dove is a symbol of peace in many countries.", example_zh: "在許多國家，鴿子是和平的象徵。" },
  { word: "overcome", pos: "v.", phonetic: "/ˌoʊ.vɚˈkʌm/", definition: "to successfully deal with a problem or difficulty", definition_zh: "克服；戰勝", example_en: "She finally overcame her fear of speaking in public.", example_zh: "她終於克服了在眾人面前說話的恐懼。" },
  { word: "powerful", pos: "adj.", phonetic: "/ˈpaʊ.ɚ.fəl/", definition: "having great strength or control", definition_zh: "強大的；有力的", example_en: "The powerful storm blew down several trees on our street.", example_zh: "強烈的暴風吹倒了我們街上的好幾棵樹。" },
  { word: "prevent", pos: "v.", phonetic: "/prɪˈvent/", definition: "to stop something from happening", definition_zh: "防止；預防", example_en: "Washing your hands often can prevent many illnesses.", example_zh: "經常洗手可以預防許多疾病。" },
  { word: "reduce", pos: "v.", phonetic: "/rɪˈduːs/", definition: "to make something smaller in size or amount", definition_zh: "減少；降低", example_en: "We should reduce the amount of plastic we use every day.", example_zh: "我們應該減少每天使用的塑膠量。" },
  { word: "release", pos: "v.", phonetic: "/rɪˈliːs/", definition: "to let someone or something go free", definition_zh: "釋放；放開；發行", example_en: "The fisherman released the small fish back into the river.", example_zh: "漁夫把小魚放回河裡。" },
  { word: "sensitive", pos: "adj.", phonetic: "/ˈsen.sə.t̬ɪv/", definition: "easily hurt or affected by something", definition_zh: "敏感的；易受影響的", example_en: "Her skin is so sensitive that strong sunlight hurts it.", example_zh: "她的皮膚非常敏感，強烈的陽光會傷害它。" },
  { word: "severe", pos: "adj.", phonetic: "/səˈvɪr/", definition: "very bad or serious", definition_zh: "嚴重的；劇烈的", example_en: "The severe headache kept him in bed all day.", example_zh: "劇烈的頭痛讓他一整天躺在床上。" },
  { word: "sticky", pos: "adj.", phonetic: "/ˈstɪk.i/", definition: "covered with something that holds on to whatever touches it", definition_zh: "黏的；黏性的", example_en: "My fingers were sticky after I ate the honey cake.", example_zh: "吃完蜂蜜蛋糕後，我的手指黏黏的。" },
  { word: "suitable", pos: "adj.", phonetic: "/ˈsuː.t̬ə.bəl/", definition: "right for a person or situation", definition_zh: "適合的；恰當的", example_en: "This movie is not suitable for young children.", example_zh: "這部電影不適合幼童觀看。" },
  { word: "threat", pos: "n.", phonetic: "/θret/", definition: "a danger, or a warning that something bad may happen", definition_zh: "威脅；恐嚇", example_en: "Air pollution is a serious threat to our health.", example_zh: "空氣汙染是我們健康的嚴重威脅。" },
  { word: "option", pos: "n.", phonetic: "/ˈɑːp.ʃən/", definition: "one of the things you can choose", definition_zh: "選擇；選項", example_en: "Taking the bus is the cheapest option for getting to school.", example_zh: "搭公車是上學最便宜的選擇。" },
  { word: "relief", pos: "n.", phonetic: "/rɪˈliːf/", definition: "the good feeling when something bad ends or does not happen", definition_zh: "寬慰；緩解", example_en: "To my relief, I found my wallet under the bed.", example_zh: "讓我鬆一口氣的是，我在床下找到了錢包。" },
];

// ── 2) 刪除（129：變化形 / 超綱字）────────────────────────────
const DELETE_WORDS = [
  "opinions","opposing","originated","outdated","outweighs","pacing","pandemic","patent","patents","pattie",
  "permitted","persistently","personality","personally","perspective","persuaded","phenomenon","pheromone","philosophy","picturesque",
  "pioneering","politician","populated","portrayed","potentially","prayer","precaution","precautions","predator","prediction",
  "preferences","prepared","presenting","preserve","preventive","proceed","processed","producer","professionals","prominently",
  "proposed","prosperous","provoke","psychology","railway","randomly","rapidly","rarely","recall","recast",
  "redistribute","reestablish","refugee","regenerate","rehearse","relatively","reluctant","remains","remarkable","render",
  "rendering","renowned","reopened","replicate","researchers","resembling","reservation","reserve","residual","resist",
  "resort","restoration","restricting","resumed","revenues","revolves","ritual","roughly","sacred","sayings",
  "scattered","scenario","scented","self-driving","settlement","settling","sharply","signaling","signals","significant",
  "sincerity","situated","smother","snoring","sodium","soundless","specialists","specialized","spectacle","splendor",
  "sprain","stacked","stationary","stationed","stimulate","strive","stunning","sufficient","suited","summarizing",
  "supposedly","suppress","survived","suspend","sustain","sustainable","symbolic","symptoms","synesthesia","technological",
  "themes","theorized","therapeutic","thoroughly","threatening","thrill","thrillers","thrilling","sneakers",
];

// ── 3) 回填（129：官方字表缺漏的會考核心字）────────────────────
const BACKFILL = [
  { word: "affair", pos: "n.", phonetic: "/əˈfer/", definition: "an event or a matter that people deal with", definition_zh: "事務；事件", example_en: "The school picnic is a big affair for the first-grade students.", example_zh: "學校野餐對一年級學生來說是件大事。" },
  { word: "alphabet", pos: "n.", phonetic: "/ˈæl.fə.bet/", definition: "the set of letters used to write a language", definition_zh: "字母表", example_en: "English has twenty-six letters in its alphabet.", example_zh: "英文字母表有二十六個字母。" },
  { word: "backward", pos: "adv.", phonetic: "/ˈbæk.wɚd/", definition: "toward the direction behind you", definition_zh: "向後；倒退", example_en: "He took a step backward and almost fell off the stage.", example_zh: "他向後退了一步，差點從舞台上摔下來。" },
  { word: "blouse", pos: "n.", phonetic: "/blaʊs/", definition: "a shirt for women or girls", definition_zh: "女襯衫", example_en: "Mom bought a white blouse to wear to the wedding.", example_zh: "媽媽買了一件白色女襯衫去參加婚禮。" },
  { word: "brief", pos: "adj.", phonetic: "/briːf/", definition: "lasting only a short time, or using few words", definition_zh: "簡短的；短暫的", example_en: "The principal gave a brief speech before the game started.", example_zh: "比賽開始前，校長發表了簡短的演說。" },
  { word: "broad", pos: "adj.", phonetic: "/brɑːd/", definition: "very wide from one side to the other", definition_zh: "寬闊的；廣泛的", example_en: "The new road is broad enough for four cars.", example_zh: "這條新路寬得可以容納四輛車。" },
  { word: "bucket", pos: "n.", phonetic: "/ˈbʌk.ɪt/", definition: "an open container with a handle for carrying water or other things", definition_zh: "水桶；提桶", example_en: "Fill the bucket with water and bring it to the garden.", example_zh: "把水桶裝滿水，提到花園去。" },
  { word: "butterfly", pos: "n.", phonetic: "/ˈbʌt̬.ɚ.flaɪ/", definition: "an insect with large, often colorful wings", definition_zh: "蝴蝶", example_en: "A colorful butterfly landed on the flower in our yard.", example_zh: "一隻色彩繽紛的蝴蝶停在我們院子的花上。" },
  { word: "channel", pos: "n.", phonetic: "/ˈtʃæn.əl/", definition: "a television station, or a narrow area of water", definition_zh: "頻道；海峽", example_en: "Which channel is showing the baseball game tonight?", example_zh: "今晚哪個頻道播棒球比賽？" },
  { word: "chapter", pos: "n.", phonetic: "/ˈtʃæp.tɚ/", definition: "one of the parts that a book is divided into", definition_zh: "章；章節", example_en: "Please read the first chapter of the book before class.", example_zh: "請在上課前讀完這本書的第一章。" },
  { word: "character", pos: "n.", phonetic: "/ˈker.ək.tɚ/", definition: "a person in a story, or the qualities that make someone special", definition_zh: "角色；性格", example_en: "The main character in the story is a brave young girl.", example_zh: "故事的主角是一位勇敢的少女。" },
  { word: "charge", pos: "v.", phonetic: "/tʃɑːrdʒ/", definition: "to ask for money for something, or to put power into a battery", definition_zh: "收費；充電", example_en: "The store charges fifty dollars for sending the package.", example_zh: "這家店寄送包裹收費五十元。" },
  { word: "chart", pos: "n.", phonetic: "/tʃɑːrt/", definition: "a drawing that shows information in a simple way", definition_zh: "圖表", example_en: "The chart shows how the weather changed last month.", example_zh: "這張圖表顯示上個月天氣的變化。" },
  { word: "chase", pos: "v.", phonetic: "/tʃeɪs/", definition: "to run after someone or something to catch them", definition_zh: "追逐；追趕", example_en: "The dog chased the cat around the park for ten minutes.", example_zh: "那隻狗在公園裡追著貓跑了十分鐘。" },
  { word: "cheat", pos: "v.", phonetic: "/tʃiːt/", definition: "to act in a dishonest way to win or get something", definition_zh: "作弊；欺騙", example_en: "Anyone who cheats on the test will get a zero.", example_zh: "考試作弊的人會得零分。" },
  { word: "cheer", pos: "v.", phonetic: "/tʃɪr/", definition: "to shout happily to support someone", definition_zh: "歡呼；喝采", example_en: "The students cheered loudly when their team won the game.", example_zh: "球隊獲勝時，學生們大聲歡呼。" },
  { word: "chemical", pos: "n.", phonetic: "/ˈkem.ɪ.kəl/", definition: "a substance made by or used in chemistry", definition_zh: "化學物質", example_en: "Farmers should be careful when using chemicals on their crops.", example_zh: "農夫在作物上使用化學物質時應該小心。" },
  { word: "chess", pos: "n.", phonetic: "/tʃes/", definition: "a board game for two players with sixteen pieces each", definition_zh: "西洋棋", example_en: "Grandpa taught me how to play chess last summer.", example_zh: "去年夏天，爺爺教我下西洋棋。" },
  { word: "childhood", pos: "n.", phonetic: "/ˈtʃaɪld.hʊd/", definition: "the time of life when a person is a child", definition_zh: "童年；兒童時期", example_en: "She spent her childhood in a small town near the sea.", example_zh: "她在海邊的小鎮度過童年。" },
  { word: "classical", pos: "adj.", phonetic: "/ˈklæs.ɪ.kəl/", definition: "describing serious traditional music or art", definition_zh: "古典的", example_en: "My mother enjoys listening to classical music while cooking.", example_zh: "我媽媽喜歡邊煮飯邊聽古典音樂。" },
  { word: "climate", pos: "n.", phonetic: "/ˈklaɪ.mət/", definition: "the usual weather of a place over a long time", definition_zh: "氣候", example_en: "The climate in southern Taiwan is warm all year.", example_zh: "台灣南部的氣候全年溫暖。" },
  { word: "coach", pos: "n.", phonetic: "/koʊtʃ/", definition: "a person who trains people in a sport", definition_zh: "教練", example_en: "Our basketball coach makes us practice two hours every day.", example_zh: "我們的籃球教練讓我們每天練習兩小時。" },
  { word: "coast", pos: "n.", phonetic: "/koʊst/", definition: "the land next to the sea", definition_zh: "海岸", example_en: "We drove along the coast and watched the sunset.", example_zh: "我們沿著海岸開車，欣賞日落。" },
  { word: "cockroach", pos: "n.", phonetic: "/ˈkɑːk.roʊtʃ/", definition: "a flat brown insect often found in houses", definition_zh: "蟑螂", example_en: "A cockroach ran across the kitchen floor last night.", example_zh: "昨晚有一隻蟑螂跑過廚房地板。" },
  { word: "comfortable", pos: "adj.", phonetic: "/ˈkʌm.fɚ.t̬ə.bəl/", definition: "making you feel relaxed and free from pain", definition_zh: "舒適的；舒服的", example_en: "This sofa is so comfortable that I almost fell asleep.", example_zh: "這張沙發舒服到我差點睡著。" },
  { word: "command", pos: "n.", phonetic: "/kəˈmænd/", definition: "an order that must be followed", definition_zh: "命令；指揮", example_en: "The soldiers must follow every command from their leader.", example_zh: "士兵必須服從領袖的每一個命令。" },
  { word: "comment", pos: "n.", phonetic: "/ˈkɑː.ment/", definition: "something you say or write to give your opinion", definition_zh: "評論；意見", example_en: "The teacher wrote a kind comment on my report.", example_zh: "老師在我的報告上寫了親切的評語。" },
  { word: "complain", pos: "v.", phonetic: "/kəmˈpleɪn/", definition: "to say that you are not happy about something", definition_zh: "抱怨；投訴", example_en: "He always complains about the hot weather in summer.", example_zh: "他總是抱怨夏天炎熱的天氣。" },
  { word: "complaint", pos: "n.", phonetic: "/kəmˈpleɪnt/", definition: "a statement that you are not happy about something", definition_zh: "抱怨；投訴", example_en: "The restaurant received a complaint about the slow service.", example_zh: "那家餐廳收到一則服務太慢的投訴。" },
  { word: "concern", pos: "n.", phonetic: "/kənˈsɝːn/", definition: "a feeling of worry, or something that worries you", definition_zh: "擔心；關切的事", example_en: "Her biggest concern is whether she can pass the exam.", example_zh: "她最擔心的是能不能通過考試。" },
  { word: "confident", pos: "adj.", phonetic: "/ˈkɑːn.fə.dənt/", definition: "sure about your own ability to do things well", definition_zh: "有自信的；確信的", example_en: "Practice every day, and you will feel confident on stage.", example_zh: "每天練習，你在台上就會有自信。" },
  { word: "conflict", pos: "n.", phonetic: "/ˈkɑːn.flɪkt/", definition: "a serious disagreement between people", definition_zh: "衝突；爭執", example_en: "The two brothers had a conflict over the video game.", example_zh: "兩兄弟為了電動遊戲起了衝突。" },
  { word: "confuse", pos: "v.", phonetic: "/kənˈfjuːz/", definition: "to make someone unable to think clearly", definition_zh: "使困惑；混淆", example_en: "The new traffic rules confused many drivers at first.", example_zh: "新的交通規則起初讓許多駕駛感到困惑。" },
  { word: "connect", pos: "v.", phonetic: "/kəˈnekt/", definition: "to join two or more things together", definition_zh: "連接；連結", example_en: "This bridge connects the small island to the city.", example_zh: "這座橋將小島與城市連接起來。" },
  { word: "considerate", pos: "adj.", phonetic: "/kənˈsɪd.ɚ.ət/", definition: "kind and caring about other people's feelings", definition_zh: "體貼的；周到的", example_en: "It was considerate of you to bring an umbrella for me.", example_zh: "你真體貼，還幫我帶了雨傘。" },
  { word: "contact", pos: "n.", phonetic: "/ˈkɑːn.tækt/", definition: "communication with a person, or the act of touching", definition_zh: "聯絡；接觸", example_en: "Please keep in contact with your group members during the project.", example_zh: "在專題期間請和組員保持聯絡。" },
  { word: "contain", pos: "v.", phonetic: "/kənˈteɪn/", definition: "to have something inside", definition_zh: "包含；容納", example_en: "This box contains old photos of our family.", example_zh: "這個箱子裝著我們家的舊照片。" },
  { word: "contract", pos: "n.", phonetic: "/ˈkɑːn.trækt/", definition: "a written agreement between people or companies", definition_zh: "合約；契約", example_en: "The singer signed a contract with a famous music company.", example_zh: "那位歌手和知名音樂公司簽了合約。" },
  { word: "conversation", pos: "n.", phonetic: "/ˌkɑːn.vɚˈseɪ.ʃən/", definition: "a talk between two or more people", definition_zh: "對話；交談", example_en: "We had a long conversation about our plans for the future.", example_zh: "我們針對未來的計畫聊了很久。" },
  { word: "cotton", pos: "n.", phonetic: "/ˈkɑː.t̬ən/", definition: "a soft natural material used for making clothes", definition_zh: "棉；棉花", example_en: "This soft T-shirt is made of pure cotton.", example_zh: "這件柔軟的 T 恤是純棉做的。" },
  { word: "cough", pos: "v.", phonetic: "/kɑːf/", definition: "to push air out of your throat with a sudden sound", definition_zh: "咳嗽", example_en: "He coughed all night because of his bad cold.", example_zh: "他因為重感冒咳了一整晚。" },
  { word: "courage", pos: "n.", phonetic: "/ˈkɝː.ɪdʒ/", definition: "the ability to face danger or difficulty without fear", definition_zh: "勇氣；膽量", example_en: "It takes courage to say sorry when you make a mistake.", example_zh: "犯錯時道歉是需要勇氣的。" },
  { word: "course", pos: "n.", phonetic: "/kɔːrs/", definition: "a set of classes on a subject", definition_zh: "課程", example_en: "She is taking a cooking course every Saturday morning.", example_zh: "她每週六早上上烹飪課。" },
  { word: "court", pos: "n.", phonetic: "/kɔːrt/", definition: "an area for playing sports, or a place where legal cases are decided", definition_zh: "球場；法院", example_en: "The students played badminton on the new court.", example_zh: "學生們在新球場上打羽毛球。" },
  { word: "cousin", pos: "n.", phonetic: "/ˈkʌz.ən/", definition: "a child of your uncle or aunt", definition_zh: "表（堂）兄弟姊妹", example_en: "My cousin from Taipei is staying with us this weekend.", example_zh: "我台北的表哥這個週末住在我們家。" },
  { word: "crayon", pos: "n.", phonetic: "/ˈkreɪ.ɑːn/", definition: "a colored stick used for drawing", definition_zh: "蠟筆", example_en: "The little boy drew a house with his new crayons.", example_zh: "小男孩用新蠟筆畫了一棟房子。" },
  { word: "crazy", pos: "adj.", phonetic: "/ˈkreɪ.zi/", definition: "very strange or silly, or liking something very much", definition_zh: "瘋狂的；著迷的", example_en: "My classmates are crazy about the new mobile game.", example_zh: "我的同學對這款新手機遊戲非常著迷。" },
  { word: "cream", pos: "n.", phonetic: "/kriːm/", definition: "the thick white part of milk, or a soft substance for the skin", definition_zh: "鮮奶油；乳霜", example_en: "She put some cream on the cake to make it sweeter.", example_zh: "她在蛋糕上加了一些鮮奶油，讓它更甜。" },
  { word: "crime", pos: "n.", phonetic: "/kraɪm/", definition: "an action that breaks the law", definition_zh: "犯罪；罪行", example_en: "The police work hard to stop crime in the city.", example_zh: "警方努力遏止城市裡的犯罪。" },
  { word: "crisis", pos: "n.", phonetic: "/ˈkraɪ.sɪs/", definition: "a time of great danger or difficulty", definition_zh: "危機", example_en: "The country worked together to get through the water crisis.", example_zh: "全國同心協力度過缺水危機。" },
  { word: "crowded", pos: "adj.", phonetic: "/ˈkraʊ.dɪd/", definition: "full of people", definition_zh: "擁擠的", example_en: "The night market is always crowded on weekends.", example_zh: "夜市週末總是很擁擠。" },
  { word: "cruel", pos: "adj.", phonetic: "/ˈkruː.əl/", definition: "causing pain to people or animals on purpose", definition_zh: "殘忍的；殘酷的", example_en: "It is cruel to leave a pet alone in a hot car.", example_zh: "把寵物獨自留在悶熱的車裡是殘忍的。" },
  { word: "cure", pos: "v.", phonetic: "/kjʊr/", definition: "to make a sick person healthy again", definition_zh: "治癒；治療", example_en: "Doctors hope the new medicine can cure this disease.", example_zh: "醫生希望新藥能治癒這種疾病。" },
  { word: "curious", pos: "adj.", phonetic: "/ˈkjʊr.i.əs/", definition: "wanting to know or learn about something", definition_zh: "好奇的", example_en: "The curious child kept asking why the sky is blue.", example_zh: "那個好奇的孩子一直問天空為什麼是藍色的。" },
  { word: "current", pos: "adj.", phonetic: "/ˈkɝː.ənt/", definition: "happening or existing now", definition_zh: "目前的；現今的", example_en: "Our current English teacher tells funny stories in class.", example_zh: "我們現在的英文老師上課會講有趣的故事。" },
  { word: "curtain", pos: "n.", phonetic: "/ˈkɝː.t̬ən/", definition: "a piece of cloth that covers a window", definition_zh: "窗簾；布幕", example_en: "She opened the curtains to let the morning sunlight in.", example_zh: "她拉開窗簾，讓早晨的陽光照進來。" },
  { word: "curve", pos: "n.", phonetic: "/kɝːv/", definition: "a line that bends like part of a circle", definition_zh: "曲線；彎道", example_en: "Drive slowly because there is a sharp curve ahead.", example_zh: "前面有個急轉彎，開慢一點。" },
  { word: "custom", pos: "n.", phonetic: "/ˈkʌs.təm/", definition: "a way of behaving that a group of people has followed for a long time", definition_zh: "風俗；習俗", example_en: "Giving red envelopes is a custom during Chinese New Year.", example_zh: "發紅包是農曆新年的習俗。" },
  { word: "customer", pos: "n.", phonetic: "/ˈkʌs.tə.mɚ/", definition: "a person who buys things from a shop", definition_zh: "顧客；客戶", example_en: "The friendly shop owner remembers every customer's name.", example_zh: "親切的店老闆記得每位顧客的名字。" },
  { word: "damage", pos: "n.", phonetic: "/ˈdæm.ɪdʒ/", definition: "harm done to something", definition_zh: "損害；損壞", example_en: "The heavy rain caused serious damage to the old bridge.", example_zh: "大雨對那座老橋造成嚴重損害。" },
  { word: "dawn", pos: "n.", phonetic: "/dɑːn/", definition: "the time of day when light first appears", definition_zh: "黎明；破曉", example_en: "The farmers get up at dawn to work in the fields.", example_zh: "農夫們黎明就起床到田裡工作。" },
  { word: "deaf", pos: "adj.", phonetic: "/def/", definition: "not able to hear", definition_zh: "失聰的；聾的", example_en: "The deaf student uses sign language to talk with friends.", example_zh: "那位失聰的學生用手語和朋友交談。" },
  { word: "debate", pos: "n.", phonetic: "/dɪˈbeɪt/", definition: "a formal talk in which people give different opinions", definition_zh: "辯論；爭論", example_en: "Our class held a debate about wearing school uniforms.", example_zh: "我們班舉行了一場關於穿制服的辯論。" },
  { word: "decorate", pos: "v.", phonetic: "/ˈdek.ə.reɪt/", definition: "to make something look nicer by adding pretty things", definition_zh: "裝飾；佈置", example_en: "We decorated the classroom with balloons for the party.", example_zh: "我們用氣球佈置教室準備派對。" },
  { word: "decrease", pos: "v.", phonetic: "/dɪˈkriːs/", definition: "to become smaller in number or amount", definition_zh: "減少；下降", example_en: "The number of birds in the park decreased last year.", example_zh: "公園裡的鳥去年減少了。" },
  { word: "degree", pos: "n.", phonetic: "/dɪˈɡriː/", definition: "a unit for measuring temperature or angles, or a university award", definition_zh: "度；學位；程度", example_en: "The temperature dropped to ten degrees last night.", example_zh: "昨晚氣溫降到十度。" },
  { word: "deliver", pos: "v.", phonetic: "/dɪˈlɪv.ɚ/", definition: "to take things to a person or place", definition_zh: "遞送；運送", example_en: "The mailman delivers letters to our house every morning.", example_zh: "郵差每天早上送信到我們家。" },
  { word: "deny", pos: "v.", phonetic: "/dɪˈnaɪ/", definition: "to say that something is not true", definition_zh: "否認；拒絕", example_en: "The boy denied breaking the window, but nobody believed him.", example_zh: "男孩否認打破窗戶，但沒有人相信他。" },
  { word: "depend", pos: "v.", phonetic: "/dɪˈpend/", definition: "to need someone or something, or to be decided by something", definition_zh: "依靠；取決於", example_en: "Whether we go hiking depends on tomorrow's weather.", example_zh: "我們是否去爬山取決於明天的天氣。" },
  { word: "desert", pos: "n.", phonetic: "/ˈdez.ɚt/", definition: "a large, dry area with few plants", definition_zh: "沙漠", example_en: "Few plants can grow in the hot, dry desert.", example_zh: "很少植物能在炎熱乾燥的沙漠中生長。" },
  { word: "dessert", pos: "n.", phonetic: "/dɪˈzɝːt/", definition: "sweet food eaten after a meal", definition_zh: "甜點；飯後甜食", example_en: "We had ice cream for dessert after dinner.", example_zh: "晚餐後我們吃冰淇淋當甜點。" },
  { word: "diamond", pos: "n.", phonetic: "/ˈdaɪ.mənd/", definition: "a very hard, clear stone that costs a lot", definition_zh: "鑽石", example_en: "The ring with a small diamond costs a lot of money.", example_zh: "那枚鑲了小鑽石的戒指要花很多錢。" },
  { word: "diet", pos: "n.", phonetic: "/ˈdaɪ.ət/", definition: "the food a person usually eats", definition_zh: "飲食；節食", example_en: "A healthy diet should include fruits and vegetables.", example_zh: "健康的飲食應該包含水果和蔬菜。" },
  { word: "diligent", pos: "adj.", phonetic: "/ˈdɪl.ə.dʒənt/", definition: "working hard with care", definition_zh: "勤勉的；勤奮的", example_en: "The diligent student reviews her notes every night.", example_zh: "那位勤奮的學生每晚複習筆記。" },
  { word: "direction", pos: "n.", phonetic: "/dəˈrek.ʃən/", definition: "the way that someone or something moves or faces", definition_zh: "方向；指示", example_en: "We walked in the wrong direction and got lost.", example_zh: "我們走錯方向，結果迷路了。" },
  { word: "disagree", pos: "v.", phonetic: "/ˌdɪs.əˈɡriː/", definition: "to have a different opinion from someone", definition_zh: "不同意；意見不合", example_en: "I disagree with you about which movie is better.", example_zh: "關於哪部電影比較好，我和你意見不同。" },
  { word: "disappear", pos: "v.", phonetic: "/ˌdɪs.əˈpɪr/", definition: "to go away so that people cannot see you", definition_zh: "消失；不見", example_en: "The sun disappeared behind the dark clouds before the storm.", example_zh: "暴風雨來臨前，太陽消失在烏雲後面。" },
  { word: "dishonest", pos: "adj.", phonetic: "/dɪˈsɑː.nɪst/", definition: "not telling the truth, or trying to trick people", definition_zh: "不誠實的", example_en: "Being dishonest will make people stop trusting you.", example_zh: "不誠實會讓人們不再信任你。" },
  { word: "distant", pos: "adj.", phonetic: "/ˈdɪs.tənt/", definition: "far away in space or time", definition_zh: "遙遠的；疏遠的", example_en: "From the top of the mountain, we saw a distant island.", example_zh: "從山頂上，我們看見遠方的小島。" },
  { word: "dizzy", pos: "adj.", phonetic: "/ˈdɪz.i/", definition: "feeling like everything is turning around you", definition_zh: "頭暈的", example_en: "She felt dizzy after riding the roller coaster twice.", example_zh: "坐了兩次雲霄飛車後，她覺得頭暈。" },
  { word: "doubt", pos: "v.", phonetic: "/daʊt/", definition: "to feel unsure or not believe something", definition_zh: "懷疑；不相信", example_en: "I doubt that it will rain on such a sunny day.", example_zh: "天氣這麼晴朗，我不相信會下雨。" },
  { word: "dozen", pos: "n.", phonetic: "/ˈdʌz.ən/", definition: "a group of twelve", definition_zh: "一打；十二個", example_en: "Mom bought a dozen eggs at the supermarket.", example_zh: "媽媽在超市買了一打蛋。" },
  { word: "dragon", pos: "n.", phonetic: "/ˈdræɡ.ən/", definition: "a large animal in stories that can breathe fire", definition_zh: "龍", example_en: "People row dragon boats during the Dragon Boat Festival.", example_zh: "端午節時人們划龍舟。" },
  { word: "drug", pos: "n.", phonetic: "/drʌɡ/", definition: "a medicine, or an illegal substance that changes how you feel", definition_zh: "藥物；毒品", example_en: "The doctor said this drug may make you feel sleepy.", example_zh: "醫生說這種藥可能會讓你想睡覺。" },
  { word: "dumpling", pos: "n.", phonetic: "/ˈdʌm.plɪŋ/", definition: "a small piece of dough filled with meat or vegetables", definition_zh: "餃子", example_en: "Our family makes dumplings together on New Year's Eve.", example_zh: "除夕夜我們全家一起包餃子。" },
  { word: "eagle", pos: "n.", phonetic: "/ˈiː.ɡəl/", definition: "a large, strong bird that hunts small animals", definition_zh: "老鷹", example_en: "An eagle flew high above the mountains looking for food.", example_zh: "一隻老鷹在高山上空飛翔尋找食物。" },
  { word: "elder", pos: "adj.", phonetic: "/ˈel.dɚ/", definition: "older, used about people in a family", definition_zh: "年長的", example_en: "My elder sister helps me with my homework.", example_zh: "我姊姊會幫我做功課。" },
  { word: "elect", pos: "v.", phonetic: "/iˈlekt/", definition: "to choose someone by voting", definition_zh: "選舉；推選", example_en: "The students elected Amy as their class leader.", example_zh: "學生們選艾美當班長。" },
  { word: "electric", pos: "adj.", phonetic: "/iˈlek.trɪk/", definition: "using or producing electricity", definition_zh: "電的；用電的", example_en: "More people are riding electric scooters to work now.", example_zh: "現在越來越多人騎電動機車上班。" },
  { word: "embarrass", pos: "v.", phonetic: "/ɪmˈber.əs/", definition: "to make someone feel shy or ashamed", definition_zh: "使尷尬；使難為情", example_en: "Falling down in front of the whole class embarrassed him.", example_zh: "在全班面前跌倒讓他很尷尬。" },
  { word: "empty", pos: "adj.", phonetic: "/ˈemp.ti/", definition: "having nothing inside", definition_zh: "空的", example_en: "The classroom was empty because everyone went to the gym.", example_zh: "教室空無一人，因為大家都去體育館了。" },
  { word: "energetic", pos: "adj.", phonetic: "/ˌen.ɚˈdʒet̬.ɪk/", definition: "having a lot of energy", definition_zh: "精力充沛的", example_en: "The energetic puppy runs around the yard all day.", example_zh: "那隻精力充沛的小狗整天在院子裡跑來跑去。" },
  { word: "entrance", pos: "n.", phonetic: "/ˈen.trəns/", definition: "a door or gate that you go through to enter a place", definition_zh: "入口", example_en: "Let's meet at the main entrance of the museum at nine.", example_zh: "我們九點在博物館大門入口見面吧。" },
  { word: "envy", pos: "v.", phonetic: "/ˈen.vi/", definition: "to wish you had what another person has", definition_zh: "羨慕；嫉妒", example_en: "Many classmates envy her beautiful handwriting.", example_zh: "許多同學羨慕她漂亮的字。" },
  { word: "especially", pos: "adv.", phonetic: "/ɪˈspeʃ.əl.i/", definition: "more than usual, or more than others", definition_zh: "特別；尤其", example_en: "I love fruit, especially mangoes in the summer.", example_zh: "我喜歡水果，尤其是夏天的芒果。" },
  { word: "exam", pos: "n.", phonetic: "/ɪɡˈzæm/", definition: "an important test of what you know", definition_zh: "考試；測驗", example_en: "She stayed up late studying for the math exam.", example_zh: "她為了數學考試熬夜讀書。" },
  { word: "excite", pos: "v.", phonetic: "/ɪkˈsaɪt/", definition: "to make someone feel very happy and interested", definition_zh: "使興奮；使激動", example_en: "The news about the school trip excited all the students.", example_zh: "校外教學的消息讓所有學生都很興奮。" },
  { word: "eyebrow", pos: "n.", phonetic: "/ˈaɪ.braʊ/", definition: "the line of hair above your eye", definition_zh: "眉毛", example_en: "He raised his eyebrows in surprise when he saw the gift.", example_zh: "看到禮物時，他驚訝地揚起眉毛。" },
  { word: "false", pos: "adj.", phonetic: "/fɑːls/", definition: "not true or not real", definition_zh: "錯誤的；假的", example_en: "Write T for true or F for false next to each sentence.", example_zh: "在每個句子旁邊寫 T 表示正確，F 表示錯誤。" },
  { word: "fancy", pos: "adj.", phonetic: "/ˈfæn.si/", definition: "special, expensive, or with a lot of decoration", definition_zh: "花俏的；高級的", example_en: "They celebrated their anniversary at a fancy restaurant downtown.", example_zh: "他們在市中心一家高級餐廳慶祝結婚紀念日。" },
  { word: "fashionable", pos: "adj.", phonetic: "/ˈfæʃ.ən.ə.bəl/", definition: "popular in style at a particular time", definition_zh: "流行的；時髦的", example_en: "She always wears fashionable clothes to school parties.", example_zh: "她參加學校派對總是穿著時髦的衣服。" },
  { word: "faucet", pos: "n.", phonetic: "/ˈfɑː.sɪt/", definition: "the thing you turn to start or stop water", definition_zh: "水龍頭", example_en: "Please turn off the faucet while you brush your teeth.", example_zh: "刷牙時請關掉水龍頭。" },
  { word: "favorite", pos: "adj.", phonetic: "/ˈfeɪ.vɚ.ɪt/", definition: "liked more than all others", definition_zh: "最喜愛的", example_en: "Fried rice is my favorite dish at this restaurant.", example_zh: "炒飯是我在這家餐廳最喜歡的菜。" },
  { word: "fear", pos: "n.", phonetic: "/fɪr/", definition: "the bad feeling you have when you are in danger", definition_zh: "恐懼；害怕", example_en: "His fear of the dark kept him from sleeping alone.", example_zh: "他對黑暗的恐懼讓他不敢一個人睡。" },
  { word: "flash", pos: "n.", phonetic: "/flæʃ/", definition: "a sudden bright light", definition_zh: "閃光；閃現", example_en: "A flash of lightning lit up the night sky.", example_zh: "一道閃電照亮了夜空。" },
  { word: "flashlight", pos: "n.", phonetic: "/ˈflæʃ.laɪt/", definition: "a small electric light you can carry", definition_zh: "手電筒", example_en: "Bring a flashlight when you go camping in the mountains.", example_zh: "去山上露營時要帶手電筒。" },
  { word: "flu", pos: "n.", phonetic: "/fluː/", definition: "an illness like a bad cold with fever and body pain", definition_zh: "流行性感冒", example_en: "Half of my class was absent because of the flu.", example_zh: "我們班有一半的人因為流感缺席。" },
  { word: "flute", pos: "n.", phonetic: "/fluːt/", definition: "a musical instrument that you blow across to play", definition_zh: "長笛", example_en: "She practices the flute for an hour after school.", example_zh: "她放學後練習長笛一小時。" },
  { word: "fog", pos: "n.", phonetic: "/fɑːɡ/", definition: "thick cloud near the ground that is hard to see through", definition_zh: "霧", example_en: "The thick fog made it hard to see the road.", example_zh: "濃霧讓人很難看清楚道路。" },
  { word: "frank", pos: "adj.", phonetic: "/fræŋk/", definition: "honest and saying what you really think", definition_zh: "坦白的；直率的", example_en: "To be frank, I don't think this plan will work.", example_zh: "坦白說，我不認為這個計畫行得通。" },
  { word: "freezing", pos: "adj.", phonetic: "/ˈfriː.zɪŋ/", definition: "extremely cold", definition_zh: "極冷的；冰凍的", example_en: "It was freezing on the mountain, so we wore heavy coats.", example_zh: "山上冷得要命，所以我們穿了厚外套。" },
  { word: "frighten", pos: "v.", phonetic: "/ˈfraɪ.tən/", definition: "to make someone feel afraid", definition_zh: "使害怕；驚嚇", example_en: "The sudden thunder frightened the baby and made her cry.", example_zh: "突然的雷聲嚇到了寶寶，讓她哭了起來。" },
  { word: "function", pos: "n.", phonetic: "/ˈfʌŋk.ʃən/", definition: "the job that something is made to do", definition_zh: "功能；作用", example_en: "This watch has a function that tracks how far you run.", example_zh: "這支手錶有記錄跑步距離的功能。" },
  { word: "gain", pos: "v.", phonetic: "/ɡeɪn/", definition: "to get something useful or more of something", definition_zh: "獲得；增加", example_en: "You can gain useful experience from working part-time.", example_zh: "打工可以讓你獲得有用的經驗。" },
  { word: "garage", pos: "n.", phonetic: "/ɡəˈrɑːʒ/", definition: "a building where you keep a car", definition_zh: "車庫", example_en: "Dad parks his car in the garage every night.", example_zh: "爸爸每天晚上把車停在車庫裡。" },
  { word: "gather", pos: "v.", phonetic: "/ˈɡæð.ɚ/", definition: "to come together in a group, or to collect things", definition_zh: "聚集；收集", example_en: "The whole family gathers at Grandma's house every Sunday.", example_zh: "每週日全家人聚在奶奶家。" },
  { word: "general", pos: "adj.", phonetic: "/ˈdʒen.ɚ.əl/", definition: "true for most people or things", definition_zh: "一般的；普遍的", example_en: "In general, students here go to school by bike.", example_zh: "一般來說，這裡的學生騎腳踏車上學。" },
  { word: "generous", pos: "adj.", phonetic: "/ˈdʒen.ɚ.əs/", definition: "happy to give money, help, or time to others", definition_zh: "慷慨的；大方的", example_en: "The generous man gave food to people in need.", example_zh: "那位慷慨的男士把食物送給需要的人。" },
  { word: "genius", pos: "n.", phonetic: "/ˈdʒiː.ni.əs/", definition: "a person who is unusually smart or skillful", definition_zh: "天才", example_en: "People call him a genius because he learns everything quickly.", example_zh: "大家叫他天才，因為他學什麼都很快。" },
  { word: "gentle", pos: "adj.", phonetic: "/ˈdʒen.t̬əl/", definition: "kind, soft, and careful", definition_zh: "溫柔的；輕柔的", example_en: "Be gentle when you hold the little kitten.", example_zh: "抱小貓時動作要輕柔。" },
  { word: "gentleman", pos: "n.", phonetic: "/ˈdʒen.t̬əl.mən/", definition: "a polite man who treats people well", definition_zh: "紳士", example_en: "A gentleman opened the door and let us go in first.", example_zh: "一位紳士打開門，讓我們先進去。" },
  { word: "geography", pos: "n.", phonetic: "/dʒiˈɑː.ɡrə.fi/", definition: "the study of the land, seas, and weather of the world", definition_zh: "地理；地理學", example_en: "We learned about Taiwan's rivers in geography class.", example_zh: "我們在地理課學到台灣的河流。" },
  { word: "gesture", pos: "n.", phonetic: "/ˈdʒes.tʃɚ/", definition: "a movement of your hands or head to show meaning", definition_zh: "手勢；姿勢", example_en: "She made a gesture to tell us to keep quiet.", example_zh: "她做了一個手勢，要我們保持安靜。" },
  { word: "giant", pos: "adj.", phonetic: "/ˈdʒaɪ.ənt/", definition: "extremely large", definition_zh: "巨大的", example_en: "A giant balloon floated above the night market.", example_zh: "一顆巨大的氣球飄在夜市上空。" },
  { word: "goal", pos: "n.", phonetic: "/ɡoʊl/", definition: "something you want to achieve, or a score in some sports", definition_zh: "目標；得分", example_en: "Her goal is to read fifty books this year.", example_zh: "她的目標是今年讀五十本書。" },
  { word: "gold", pos: "n.", phonetic: "/ɡoʊld/", definition: "a valuable yellow metal", definition_zh: "金；黃金", example_en: "The winner of the race received a gold medal.", example_zh: "賽跑冠軍獲得了一面金牌。" },
  { word: "grade", pos: "n.", phonetic: "/ɡreɪd/", definition: "a school year level, or a score for schoolwork", definition_zh: "年級；成績", example_en: "He got a good grade on his English test.", example_zh: "他的英文考試得到好成績。" },
  { word: "greedy", pos: "adj.", phonetic: "/ˈɡriː.di/", definition: "wanting more than you need", definition_zh: "貪心的；貪婪的", example_en: "The greedy dog wanted to eat both pieces of meat.", example_zh: "那隻貪心的狗兩塊肉都想吃。" },
  { word: "greet", pos: "v.", phonetic: "/ɡriːt/", definition: "to say hello to someone", definition_zh: "問候；打招呼", example_en: "The teacher greets every student at the classroom door.", example_zh: "老師在教室門口跟每位學生打招呼。" },
];

(async () => {
  // 0) 安全檢查：回填字不得與現有字重複
  const backfillWords = BACKFILL.map(r => r.word);
  const { data: existing, error: exErr } = await supabase.from('words').select('word').in('word', backfillWords);
  if (exErr) { console.error('檢查失敗:', exErr.message); process.exit(1); }
  if (existing.length) { console.error('回填字已存在，中止:', existing.map(e => e.word).join(',')); process.exit(1); }

  // 1) 更新 26 個保留字（僅限佔位符列，雙重保險）
  let updated = 0;
  for (const f of KEEP_FIXES) {
    const { word, ...patch } = f;
    const { data, error } = await supabase.from('words')
      .update({ ...patch, tags: ['cap_2000'], level: 1 })
      .eq('word', word).like('definition', '%(restored)%').select('id');
    if (error) { console.error('UPDATE FAIL', word, error.message); process.exit(1); }
    if (!data.length) { console.error('UPDATE MISS（找不到佔位列）', word); process.exit(1); }
    updated++;
  }
  console.log('已更新保留字:', updated);

  // 2) 刪除 129 個（僅刪佔位符列）
  const { data: deleted, error: delErr } = await supabase.from('words')
    .delete().in('word', DELETE_WORDS).like('definition', '%(restored)%').select('id');
  if (delErr) { console.error('刪除失敗:', delErr.message); process.exit(1); }
  console.log('已刪除佔位字:', deleted.length);

  // 3) 回填 129 個新字
  const rows = BACKFILL.map((r, i) => ({ ...r, tags: ['cap_2000'], level: 1, frequency_rank: 420 + i }));
  const { data: inserted, error: insErr } = await supabase.from('words').insert(rows).select('id');
  if (insErr) { console.error('插入失敗:', insErr.message); process.exit(1); }
  console.log('已回填新字:', inserted.length);
  console.log('完成。預期總數: 2000');
})();
