/**
 * 補齊 Unit 30（其他副詞 Other Adverbs）+ Unit 31（其他名詞 Other Nouns）
 * 在 words 表裡缺少的字。內容依 cambridge-style-examples 技能規範原創生成（非抄書），
 * 欄位對齊現有 words 表格式，並加上 tags: ['cap_2000','unitN', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT30_ENTRIES = [
  { word: 'really', pos: 'adv.', phonetic: '/ˈriəli/', definition: 'in a true or actual way; used to make a statement stronger', definition_zh: '真地；真的', example_en: 'I really want to visit Japan this summer.', example_zh: '我真的很想在今年夏天去日本。', tier: '基礎' },
  { word: 'somewhere', pos: 'adv.', phonetic: '/ˈsʌmˌhwɛr/', definition: 'in, at, or to a place that is not stated or known', definition_zh: '在某處；到某處', example_en: 'My keys must be somewhere in this room.', example_zh: '我的鑰匙一定在這個房間的某個地方。', tier: '基礎' },
  { word: 'then', pos: 'adv.', phonetic: '/ðɛn/', definition: 'at that time in the past or future; next in order', definition_zh: '那時；然後', example_en: 'We finished dinner and then watched a movie.', example_zh: '我們吃完晚餐，然後看了一部電影。', tier: '基礎' },
  { word: 'yeah', pos: 'adv.', phonetic: '/jɛə/', definition: 'an informal way of saying yes', definition_zh: '是；對（口語）', example_en: 'Yeah, I already finished all of my homework.', example_zh: '對啊，我已經把所有作業都寫完了。', tier: '基礎' },
  { word: 'doubtless', pos: 'adv.', phonetic: '/ˈdaʊtlɪs/', definition: 'almost certainly true', definition_zh: '無疑地；肯定地', example_en: 'He is doubtless the best runner in our class.', example_zh: '他無疑是我們班上跑得最快的人。', tier: '進階' },
  { word: 'lately', pos: 'adv.', phonetic: '/ˈleɪtli/', definition: 'in the period of time up to now', definition_zh: '最近', example_en: 'She has been very busy with homework lately.', example_zh: '她最近因為作業而非常忙碌。', tier: '進階' },
  { word: 'nor', pos: 'adv.', phonetic: '/nɔr/', definition: 'used to show that a negative statement also applies to another thing', definition_zh: '也不；且不', example_en: "I don't like coffee, nor does my brother.", example_zh: '我不喜歡咖啡，我弟弟也不喜歡。', tier: '進階' },
  { word: 'rather', pos: 'adv.', phonetic: '/ˈræðər/', definition: 'to a certain degree; more than a little', definition_zh: '相當；頗；稍微', example_en: 'The math test was rather difficult for everyone.', example_zh: '這次數學考試對每個人來說都相當困難。', tier: '進階' },
  { word: 'recently', pos: 'adv.', phonetic: '/ˈrisntli/', definition: 'not long ago; in the near past', definition_zh: '最近地', example_en: 'My family recently moved to a new apartment.', example_zh: '我們家最近搬到了一間新公寓。', tier: '進階' },
  { word: 'whenever', pos: 'adv.', phonetic: '/hwɛnˈɛvər/', definition: 'at any time that; every time that', definition_zh: '無論何時；每當', example_en: 'You can call me whenever you need help.', example_zh: '只要你需要幫忙，隨時都可以打給我。', tier: '進階' },
];

const UNIT31_ENTRIES = [
  { word: 'e-mail', pos: 'n.', phonetic: '/ˈiˌmeɪl/', definition: 'a message sent electronically from one computer to another', definition_zh: '電子郵件', example_en: 'She sent me an e-mail about the school trip.', example_zh: '她寄了一封關於校外教學的電子郵件給我。', tier: '基礎' },
  { word: 'treat', pos: 'n.', phonetic: '/trit/', definition: 'something special, such as food or an outing, that gives someone pleasure', definition_zh: '款待；請客', example_en: 'Dad took us out for a birthday treat.', example_zh: '爸爸帶我們出去慶生款待一番。', tier: '基礎' },
  { word: 'absence', pos: 'n.', phonetic: '/ˈæbsəns/', definition: 'the state of being away from a place', definition_zh: '缺席；不在', example_en: "The teacher noticed his absence from class today.", example_zh: '老師今天注意到他缺席了。', tier: '進階' },
  { word: 'acceptance', pos: 'n.', phonetic: '/əkˈsɛptəns/', definition: 'the act of agreeing to accept something', definition_zh: '接受；贊同', example_en: 'Her parents showed acceptance of her new plan.', example_zh: '她的父母對她的新計畫表示贊同。', tier: '進階' },
  { word: 'arrival', pos: 'n.', phonetic: '/əˈraɪvəl/', definition: 'the act of reaching a place', definition_zh: '抵達', example_en: 'We were happy about the arrival of summer vacation.', example_zh: '我們很開心暑假終於到來。', tier: '進階' },
  { word: 'assistance', pos: 'n.', phonetic: '/əˈsɪstəns/', definition: 'help that is given to someone', definition_zh: '援助；幫助', example_en: 'The lost tourist asked a police officer for assistance.', example_zh: '那位迷路的遊客向警察尋求協助。', tier: '進階' },
  { word: 'avoidance', pos: 'n.', phonetic: '/əˈvɔɪdəns/', definition: 'the act of staying away from something', definition_zh: '迴避；避免', example_en: 'His avoidance of the topic made everyone curious.', example_zh: '他對這個話題的迴避讓大家都很好奇。', tier: '進階' },
  { word: 'behavior', pos: 'n.', phonetic: '/bɪˈheɪvjər/', definition: 'the way a person acts or behaves', definition_zh: '行為；舉止', example_en: 'The teacher praised his good behavior in class.', example_zh: '老師稱讚他在課堂上的良好表現。', tier: '進階' },
  { word: 'bomber', pos: 'n.', phonetic: '/ˈbɑmər/', definition: 'an airplane that carries and drops bombs', definition_zh: '轟炸機', example_en: 'The museum has an old bomber from the war.', example_zh: '這間博物館有一台戰爭時期的舊轟炸機。', tier: '進階' },
  { word: 'citizenship', pos: 'n.', phonetic: '/ˈsɪtɪzənˌʃɪp/', definition: 'the legal right to belong to a country', definition_zh: '公民資格', example_en: 'He gained citizenship of Canada after ten years.', example_zh: '他在十年後取得了加拿大的公民資格。', tier: '進階' },
  { word: 'commentary', pos: 'n.', phonetic: '/ˈkɑmənˌtɛri/', definition: 'spoken comments about an event as it happens', definition_zh: '評論；實況報導', example_en: 'We listened to the live commentary during the game.', example_zh: '我們在比賽中收聽了現場實況報導。', tier: '進階' },
  { word: 'companion', pos: 'n.', phonetic: '/kəmˈpænjən/', definition: 'a person who spends time or travels with you', definition_zh: '同伴；夥伴', example_en: 'My dog is my best companion on walks.', example_zh: '我的狗是我散步時最好的同伴。', tier: '進階' },
  { word: 'comparison', pos: 'n.', phonetic: '/kəmˈpærɪsən/', definition: 'the act of comparing two or more things', definition_zh: '比較', example_en: 'There is no comparison between the two restaurants.', example_zh: '這兩間餐廳根本無法相比。', tier: '進階' },
  { word: 'confusion', pos: 'n.', phonetic: '/kənˈfjuʒən/', definition: 'a state of not being able to understand something clearly', definition_zh: '混淆；困惑', example_en: 'The strange map caused confusion among the tourists.', example_zh: '這張奇怪的地圖讓遊客們感到困惑。', tier: '進階' },
  { word: 'continuity', pos: 'n.', phonetic: '/ˌkɑntəˈnuəti/', definition: 'the state of continuing without a break', definition_zh: '連貫性；持續性', example_en: 'The story lacks continuity between the first chapters.', example_zh: '這個故事的前幾章缺乏連貫性。', tier: '進階' },
  { word: 'creation', pos: 'n.', phonetic: '/kriˈeɪʃən/', definition: 'the act of making something new', definition_zh: '創造；創作', example_en: "The artist's creation won first prize at school.", example_zh: '這位藝術家的創作在學校得到第一名。', tier: '進階' },
  { word: 'curiosity', pos: 'n.', phonetic: '/ˌkjʊriˈɑsəti/', definition: 'a strong desire to know or learn something', definition_zh: '好奇心', example_en: "The boy's curiosity led him to open the box.", example_zh: '這個男孩的好奇心讓他打開了那個盒子。', tier: '進階' },
  { word: 'data', pos: 'n.', phonetic: '/ˈdeɪtə/', definition: 'facts or information used for study or analysis', definition_zh: '資料', example_en: 'We collected data about students’ daily reading habits.', example_zh: '我們蒐集了關於學生每天閱讀習慣的資料。', tier: '進階' },
  { word: 'delivery', pos: 'n.', phonetic: '/dɪˈlɪvəri/', definition: 'the act of bringing goods to a place', definition_zh: '遞送；投遞', example_en: 'The pizza delivery arrived faster than we expected.', example_zh: '披薩外送比我們預期的還快到達。', tier: '進階' },
  { word: 'dependence', pos: 'n.', phonetic: '/dɪˈpɛndəns/', definition: 'the state of needing someone or something regularly', definition_zh: '依賴', example_en: 'Too much dependence on phones can be unhealthy.', example_zh: '過度依賴手機可能不利健康。', tier: '進階' },
  { word: 'directory', pos: 'n.', phonetic: '/dəˈrɛktəri/', definition: 'a book or list of names, addresses, or numbers', definition_zh: '名冊；電話簿', example_en: "I found her number in the school directory.", example_zh: '我在學校名冊裡找到了她的電話號碼。', tier: '進階' },
  { word: 'disappearance', pos: 'n.', phonetic: '/ˌdɪsəˈpɪrəns/', definition: 'the act of no longer being seen or found', definition_zh: '消失', example_en: 'The sudden disappearance of the cat worried everyone.', example_zh: '那隻貓的突然消失讓大家都很擔心。', tier: '進階' },
  { word: 'efficiency', pos: 'n.', phonetic: '/ɪˈfɪʃənsi/', definition: 'the ability to do something well without wasting time', definition_zh: '效率', example_en: "The new machine improved the factory's efficiency greatly.", example_zh: '這台新機器大大提升了工廠的效率。', tier: '進階' },
  { word: 'electron', pos: 'n.', phonetic: '/ɪˈlɛktrɑn/', definition: 'a very small particle with a negative electric charge', definition_zh: '電子', example_en: 'The science teacher explained how an electron moves.', example_zh: '科學老師解釋了電子是如何移動的。', tier: '進階' },
  { word: 'examiner', pos: 'n.', phonetic: '/ɪgˈzæmɪnər/', definition: 'a person who tests or checks something officially', definition_zh: '檢查者；主考官', example_en: 'The examiner asked each student several English questions.', example_zh: '主考官問了每位學生幾個英文問題。', tier: '進階' },
  { word: 'gathering', pos: 'n.', phonetic: '/ˈgæðərɪŋ/', definition: 'a meeting of people for a shared purpose', definition_zh: '聚會', example_en: 'We had a small gathering to celebrate her success.', example_zh: '我們辦了一場小聚會來慶祝她的成功。', tier: '進階' },
  { word: 'handling', pos: 'n.', phonetic: '/ˈhændlɪŋ/', definition: 'the way something is managed or dealt with', definition_zh: '處理', example_en: 'Everyone admired her calm handling of the problem.', example_zh: '大家都佩服她冷靜處理問題的方式。', tier: '進階' },
  { word: 'hole', pos: 'n.', phonetic: '/hoʊl/', definition: 'an empty space or opening in something', definition_zh: '洞；孔', example_en: 'The dog dug a big hole in the yard.', example_zh: '這隻狗在院子裡挖了一個大洞。', tier: '進階' },
  { word: 'humanitarian', pos: 'n.', phonetic: '/hjuˌmænəˈtɛriən/', definition: 'a person who works to help people in need', definition_zh: '人道主義者', example_en: 'The humanitarian traveled abroad to help disaster victims.', example_zh: '這位人道主義者出國幫助受災民眾。', tier: '進階' },
  { word: 'ignorance', pos: 'n.', phonetic: '/ˈɪgnərəns/', definition: 'a lack of knowledge or information about something', definition_zh: '無知', example_en: 'His ignorance of the rules caused a big mistake.', example_zh: '他對規則的無知造成了一個大錯誤。', tier: '進階' },
  { word: 'indicator', pos: 'n.', phonetic: '/ˈɪndɪˌkeɪtər/', definition: 'something that shows what a situation is like', definition_zh: '指標', example_en: 'Test scores are not the only indicator of ability.', example_zh: '考試分數並非能力的唯一指標。', tier: '進階' },
  { word: 'introduction', pos: 'n.', phonetic: '/ˌɪntrəˈdʌkʃən/', definition: 'the act of telling someone your name or presenting something new', definition_zh: '介紹', example_en: 'The teacher gave a short introduction before the movie.', example_zh: '老師在電影開始前做了簡短的介紹。', tier: '進階' },
  { word: 'lack', pos: 'n.', phonetic: '/læk/', definition: 'the state of not having enough of something', definition_zh: '缺少；不足', example_en: 'A lack of sleep made him feel tired all day.', example_zh: '睡眠不足讓他一整天都覺得很累。', tier: '進階' },
  { word: 'maintenance', pos: 'n.', phonetic: '/ˈmeɪntənəns/', definition: 'the work of keeping something in good condition', definition_zh: '維修；保養', example_en: 'The building needs regular maintenance to stay safe.', example_zh: '這棟建築物需要定期維修才能保持安全。', tier: '進階' },
  { word: 'majority', pos: 'n.', phonetic: '/məˈdʒɔrəti/', definition: 'more than half of a group of people or things', definition_zh: '多數', example_en: 'The majority of students agreed with the new rule.', example_zh: '大多數學生都同意這項新規定。', tier: '進階' },
  { word: 'mastery', pos: 'n.', phonetic: '/ˈmæstəri/', definition: 'complete knowledge or skill in something', definition_zh: '精通', example_en: 'Years of practice gave her mastery of the piano.', example_zh: '多年的練習讓她精通鋼琴。', tier: '進階' },
  { word: 'memorial', pos: 'n.', phonetic: '/məˈmɔriəl/', definition: 'something built to help people remember a person or event', definition_zh: '紀念碑', example_en: 'Students visited the memorial to learn about history.', example_zh: '學生們參觀紀念碑以了解歷史。', tier: '進階' },
  { word: 'messenger', pos: 'n.', phonetic: '/ˈmɛsəndʒər/', definition: 'a person who carries and delivers messages', definition_zh: '信使；送信人', example_en: 'The king sent a messenger with an important letter.', example_zh: '國王派了一位信使送出重要的信件。', tier: '進階' },
  { word: 'mixture', pos: 'n.', phonetic: '/ˈmɪkstʃər/', definition: 'something made by combining two or more things', definition_zh: '混合物', example_en: 'The cake batter is a mixture of flour and eggs.', example_zh: '蛋糕麵糊是麵粉和雞蛋的混合物。', tier: '進階' },
  { word: 'nationality', pos: 'n.', phonetic: '/ˌnæʃəˈnæləti/', definition: 'the country that a person legally belongs to', definition_zh: '國籍', example_en: 'Her nationality is Japanese, but she lives in Taiwan.', example_zh: '她的國籍是日本，但她住在台灣。', tier: '進階' },
  { word: 'necessity', pos: 'n.', phonetic: '/nəˈsɛsəti/', definition: 'something that is very important or needed', definition_zh: '必要性；必需品', example_en: 'Clean water is a necessity for every family.', example_zh: '乾淨的水對每個家庭來說都是必需品。', tier: '進階' },
  { word: 'negation', pos: 'n.', phonetic: '/nɪˈgeɪʃən/', definition: 'the act of saying that something is not true', definition_zh: '否定', example_en: 'His silence felt like a negation of her idea.', example_zh: '他的沉默感覺像是對她想法的否定。', tier: '進階' },
  { word: 'neighborhood', pos: 'n.', phonetic: '/ˈneɪbərˌhʊd/', definition: 'the area near where a person lives', definition_zh: '鄰近地區', example_en: 'There is a nice small park in our neighborhood.', example_zh: '我們家附近有一座不錯的小公園。', tier: '進階' },
  { word: 'occurrence', pos: 'n.', phonetic: '/əˈkɜrəns/', definition: 'something that happens', definition_zh: '發生；事件', example_en: 'Heavy traffic is a common occurrence on this road.', example_zh: '塞車在這條路上是很常見的事。', tier: '進階' },
  { word: 'operation', pos: 'n.', phonetic: '/ˌɑpəˈreɪʃən/', definition: 'the process of running a machine, or a medical surgery', definition_zh: '操作；手術', example_en: 'The doctor performed the operation early this morning.', example_zh: '醫生今天一早就進行了手術。', tier: '進階' },
  { word: 'opinion', pos: 'n.', phonetic: '/əˈpɪnjən/', definition: 'what a person thinks or believes about something', definition_zh: '意見；想法', example_en: 'I would like to know your opinion about this plan.', example_zh: '我想知道你對這個計畫的意見。', tier: '進階' },
  { word: 'opportunity', pos: 'n.', phonetic: '/ˌɑpərˈtunəti/', definition: 'a chance to do something good', definition_zh: '機會', example_en: 'Studying abroad gave her a great opportunity to grow.', example_zh: '出國留學給了她一個很棒的成長機會。', tier: '進階' },
  { word: 'peace', pos: 'n.', phonetic: '/pis/', definition: 'a state without war or fighting', definition_zh: '和平', example_en: 'People around the world hope for lasting peace.', example_zh: '世界各地的人都希望能有長久的和平。', tier: '進階' },
  { word: 'popularity', pos: 'n.', phonetic: '/ˌpɑpjəˈlærəti/', definition: 'the state of being liked by many people', definition_zh: '普及；聲望', example_en: "The singer's popularity grew after the new song.", example_zh: '這位歌手的人氣在新歌推出後提升了。', tier: '進階' },
  { word: 'possibility', pos: 'n.', phonetic: '/ˌpɑsəˈbɪləti/', definition: 'the chance that something might happen', definition_zh: '可能性', example_en: 'There is a small possibility that it will snow tonight.', example_zh: '今晚有一點下雪的可能性。', tier: '進階' },
  { word: 'preference', pos: 'n.', phonetic: '/ˈprɛfərəns/', definition: 'a stronger liking for one thing over another', definition_zh: '偏好', example_en: 'My preference is tea, but he prefers coffee.', example_zh: '我偏好茶，但他比較喜歡咖啡。', tier: '進階' },
  { word: 'presence', pos: 'n.', phonetic: '/ˈprɛzəns/', definition: 'the state of being in a certain place', definition_zh: '在場；出席', example_en: 'Her presence at the meeting made everyone feel calm.', example_zh: '她出席會議讓大家都感到安心。', tier: '進階' },
  { word: 'principle', pos: 'n.', phonetic: '/ˈprɪnsəpəl/', definition: "a basic rule that guides a person's behavior", definition_zh: '原則', example_en: "Honesty is an important principle in his life.", example_zh: '誠實是他人生中重要的原則。', tier: '進階' },
  { word: 'proposal', pos: 'n.', phonetic: '/prəˈpoʊzəl/', definition: 'a plan or suggestion that is offered for others to consider', definition_zh: '提議；提案', example_en: 'The class voted on the proposal for a picnic.', example_zh: '班上針對野餐的提議進行了投票。', tier: '進階' },
  { word: 'quality', pos: 'n.', phonetic: '/ˈkwɑləti/', definition: 'how good or bad something is', definition_zh: '品質', example_en: 'This shop only sells shoes of high quality.', example_zh: '這家店只賣高品質的鞋子。', tier: '進階' },
  { word: 'rapidity', pos: 'n.', phonetic: '/rəˈpɪdəti/', definition: 'the quality of happening very fast', definition_zh: '快速', example_en: 'The rescue team worked with great rapidity and skill.', example_zh: '救援隊以極快的速度和技巧工作。', tier: '進階' },
  { word: 'refusal', pos: 'n.', phonetic: '/rɪˈfjuzəl/', definition: 'the act of saying no to something', definition_zh: '拒絕', example_en: 'His refusal to apologize made his friend angry.', example_zh: '他拒絕道歉讓他的朋友很生氣。', tier: '進階' },
  { word: 'regularity', pos: 'n.', phonetic: '/ˌrɛgjəˈlærəti/', definition: 'the quality of happening often in the same pattern', definition_zh: '規律', example_en: 'He exercises with great regularity every single morning.', example_zh: '他每天早上都很有規律地運動。', tier: '進階' },
  { word: 'repetition', pos: 'n.', phonetic: '/ˌrɛpɪˈtɪʃən/', definition: 'the act of doing or saying something again', definition_zh: '重複', example_en: 'Repetition helps students remember new English words.', example_zh: '重複有助於學生記住新的英文單字。', tier: '進階' },
  { word: 'result', pos: 'n.', phonetic: '/rɪˈzʌlt/', definition: 'something that happens because of an earlier action', definition_zh: '結果', example_en: 'She was nervous about the result of the exam.', example_zh: '她對考試結果感到緊張。', tier: '進階' },
  { word: 'royalty', pos: 'n.', phonetic: '/ˈrɔɪəlti/', definition: 'members of a royal family, or money paid to a writer', definition_zh: '皇室成員；版稅', example_en: 'The royalty attended the ceremony in beautiful clothes.', example_zh: '皇室成員穿著華麗的服裝出席典禮。', tier: '進階' },
  { word: 'sample', pos: 'n.', phonetic: '/ˈsæmpəl/', definition: 'a small part of something used to show what the rest is like', definition_zh: '樣品；樣本', example_en: 'The store gave us a free sample of juice.', example_zh: '這家店給了我們一份免費的果汁試喝樣品。', tier: '進階' },
  { word: 'signal', pos: 'n.', phonetic: '/ˈsɪgnəl/', definition: 'a sound, action, or sign that gives information', definition_zh: '信號', example_en: 'The red light is a signal to stop.', example_zh: '紅燈是要求停止的信號。', tier: '進階' },
  { word: 'signature', pos: 'n.', phonetic: '/ˈsɪgnətʃər/', definition: "a person's name written by themselves", definition_zh: '簽名', example_en: 'Please leave your signature at the bottom here.', example_zh: '請在這裡的底部留下你的簽名。', tier: '進階' },
  { word: 'silence', pos: 'n.', phonetic: '/ˈsaɪləns/', definition: 'the state of being completely quiet', definition_zh: '沉默；安靜', example_en: 'The classroom was in silence during the test.', example_zh: '考試期間教室裡一片安靜。', tier: '進階' },
  { word: 'struggle', pos: 'n.', phonetic: '/ˈstrʌgəl/', definition: 'a difficult effort to achieve or deal with something', definition_zh: '掙扎；搏鬥', example_en: 'Learning a new language can be a real struggle.', example_zh: '學習一種新的語言可能是一種真正的掙扎。', tier: '進階' },
  { word: 'success', pos: 'n.', phonetic: '/səkˈsɛs/', definition: 'the achieving of something wanted or planned', definition_zh: '成功', example_en: 'Everyone celebrated the success of the school festival.', example_zh: '大家一起慶祝校慶園遊會的成功。', tier: '進階' },
  { word: 'surface', pos: 'n.', phonetic: '/ˈsɜrfɪs/', definition: 'the outside or top part of something', definition_zh: '表面', example_en: 'Dust covered the surface of the old table.', example_zh: '灰塵覆蓋著這張舊桌子的表面。', tier: '進階' },
  { word: 'task', pos: 'n.', phonetic: '/tæsk/', definition: 'a piece of work that must be done', definition_zh: '工作；任務', example_en: 'Cleaning the classroom was our task this week.', example_zh: '打掃教室是我們這週的任務。', tier: '進階' },
  { word: 'truth', pos: 'n.', phonetic: '/truθ/', definition: 'something that is true or a fact', definition_zh: '事實；真相', example_en: 'She finally told her mother the whole truth.', example_zh: '她終於把整件事的真相告訴媽媽。', tier: '進階' },
  { word: 'usage', pos: 'n.', phonetic: '/ˈjusɪdʒ/', definition: 'the way something is used', definition_zh: '使用', example_en: 'The teacher explained the correct usage of commas.', example_zh: '老師解釋了逗號的正確使用方式。', tier: '進階' },
  { word: 'value', pos: 'n.', phonetic: '/ˈvælju/', definition: 'how important, useful, or worthy something is', definition_zh: '價值', example_en: 'This old coin has great value to collectors.', example_zh: '這枚舊硬幣對收藏家來說很有價值。', tier: '進階' },
  { word: 'victory', pos: 'n.', phonetic: '/ˈvɪktəri/', definition: 'success in a game, war, or competition', definition_zh: '勝利', example_en: 'The whole team cheered after their big victory.', example_zh: '整個隊伍在獲得重大勝利後歡呼。', tier: '進階' },
];

const UNITS = [
  { n: 30, entries: UNIT30_ENTRIES },
  { n: 31, entries: UNIT31_ENTRIES },
];

async function main() {
  for (const u of UNITS) {
    const tag = `unit${u.n}`;
    console.log(`\n===== Unit ${u.n}：準備寫入 ${u.entries.length} 個新字 =====`);
    let inserted = 0, skipped = 0, failed = 0;

    for (const e of u.entries) {
      const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
      if (existing && existing.length) {
        console.log(`  已存在，跳過新增，改為補上 ${tag} 標籤: ${e.word}`);
        const newTags = Array.from(new Set([...(existing[0].tags || []), tag]));
        await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
        skipped++;
        continue;
      }
      const { error } = await supabase.from('words').insert({
        word: e.word,
        pos: e.pos,
        phonetic: e.phonetic,
        definition: e.definition,
        definition_zh: e.definition_zh,
        example_en: e.example_en,
        example_zh: e.example_zh,
        tags: ['cap_2000', tag, e.tier],
        level: 1,
      });
      if (error) { console.error(`  失敗: ${e.word}`, error.message); failed++; }
      else { console.log(`  成功: ${e.word}`); inserted++; }
    }
    console.log(`Unit ${u.n} 完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
