/**
 * Unit 29（其他形容詞 Other Adjectives）完整處理
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT = 'unit29';
const BASIC = `able best better common convenient dangerous dark dear different else enough foreign free helpful loud lucky magic modern only other possible public ready real same sorry sure wonderful`.split(/\s+/);
const ADV = `accidental actual additional advanced advantageous advisory alike alive alone ancient artistic asleep available aware brief casual certain classic classical comparative concerned continual creative criminal cultural desirous double doubtful dramatic educational elective electrical electronic empty encouraging entire eventual fair fancy fantastic following formal former general grand historic horrible imaginary impossible inclusive indicative individual industrial informative insistent instant instrumental lacking latest latter likely main major marvelous meaningful minor missing musical necessary negative numerous objective operational partial particular peaceful periodical personal positive practical precious primary private productive professional progressive promising protective rapid reasonable recent respective royal satisfactory scientific secondary selective separate silent similar skilled soft speedy spiritual sticky stressful sudden suggestive super symbolic tearful universal useless usual valuable whole willing worthy`.split(/\s+/);

const MISSING_ENTRIES = [
  { word: 'accidental', pos: 'adj.', phonetic: '/ˌæksəˈdɛntl/', definition: 'happening by chance, not planned', definition_zh: '意外的；偶然的', example_en: 'Their meeting at the airport was purely accidental.', example_zh: '他們在機場相遇純屬意外。', tier: '進階' },
  { word: 'actual', pos: 'adj.', phonetic: '/ˈæktʃuəl/', definition: 'real and true, not just imagined', definition_zh: '實際的；真實的', example_en: 'The actual cost was higher than we expected.', example_zh: '實際的費用比我們預期的還高。', tier: '進階' },
  { word: 'additional', pos: 'adj.', phonetic: '/əˈdɪʃənl/', definition: 'more than what already exists', definition_zh: '額外的；附加的', example_en: 'We need additional chairs for the party.', example_zh: '我們需要額外的椅子來辦派對。', tier: '進階' },
  { word: 'advanced', pos: 'adj.', phonetic: '/ədˈvænst/', definition: 'at a high or complex level', definition_zh: '高等的；先進的', example_en: 'She is taking an advanced math class this year.', example_zh: '她今年在上進階數學課。', tier: '進階' },
  { word: 'advantageous', pos: 'adj.', phonetic: '/ˌædvənˈteɪdʒəs/', definition: 'giving you a better chance of success', definition_zh: '有利的', example_en: 'A good location is advantageous for a new shop.', example_zh: '好的地點對新開的店很有利。', tier: '進階' },
  { word: 'advisory', pos: 'adj.', phonetic: '/ədˈvaɪzəri/', definition: 'giving advice rather than making decisions', definition_zh: '提供諮詢的；顧問的', example_en: "The teacher joined the school's advisory committee.", example_zh: '那位老師加入了學校的顧問委員會。', tier: '進階' },
  { word: 'artistic', pos: 'adj.', phonetic: '/ɑrˈtɪstɪk/', definition: 'having skill or interest in art', definition_zh: '藝術的；有藝術天分的', example_en: 'My little brother is very artistic and loves drawing.', example_zh: '我弟弟很有藝術天分且熱愛畫畫。', tier: '進階' },
  { word: 'comparative', pos: 'adj.', phonetic: '/kəmˈpærətɪv/', definition: 'measured or judged by comparing with something else', definition_zh: '比較的', example_en: 'The report gives a comparative study of two cities.', example_zh: '這份報告針對兩座城市做了比較研究。', tier: '進階' },
  { word: 'concerned', pos: 'adj.', phonetic: '/kənˈsɜrnd/', definition: 'worried about something', definition_zh: '關心的；擔心的', example_en: 'My parents are concerned about my grades this term.', example_zh: '我爸媽很擔心我這學期的成績。', tier: '進階' },
  { word: 'continual', pos: 'adj.', phonetic: '/kənˈtɪnjuəl/', definition: 'happening again and again over a period of time', definition_zh: '不停的；頻繁的', example_en: 'The continual noise from next door kept me awake.', example_zh: '隔壁不斷傳來的噪音讓我睡不著。', tier: '進階' },
  { word: 'creative', pos: 'adj.', phonetic: '/kriˈeɪtɪv/', definition: 'able to make new and interesting things', definition_zh: '有創意的', example_en: 'The students came up with a creative idea for the show.', example_zh: '學生們為這場表演想出了一個有創意的點子。', tier: '進階' },
  { word: 'criminal', pos: 'adj.', phonetic: '/ˈkrɪmənl/', definition: 'connected with crime', definition_zh: '犯罪的', example_en: 'Stealing a car is a serious criminal act.', example_zh: '偷車是一種嚴重的犯罪行為。', tier: '進階' },
  { word: 'cultural', pos: 'adj.', phonetic: '/ˈkʌltʃərəl/', definition: 'related to the customs and ideas of a society', definition_zh: '文化的', example_en: "The festival celebrates the town's cultural history.", example_zh: '這個節慶慶祝了小鎮的文化歷史。', tier: '進階' },
  { word: 'desirous', pos: 'adj.', phonetic: '/dɪˈzaɪrəs/', definition: 'wanting or wishing for something strongly', definition_zh: '渴望的', example_en: 'He was desirous of becoming a professional pianist.', example_zh: '他渴望成為一位職業鋼琴家。', tier: '進階' },
  { word: 'doubtful', pos: 'adj.', phonetic: '/ˈdaʊtfəl/', definition: 'not sure or not likely', definition_zh: '懷疑的；不確定的', example_en: "I'm doubtful that he will finish the race today.", example_zh: '我懷疑他今天能不能完成比賽。', tier: '進階' },
  { word: 'dramatic', pos: 'adj.', phonetic: '/drəˈmætɪk/', definition: 'sudden and noticeable, or exciting', definition_zh: '戲劇性的', example_en: 'There was a dramatic change in the weather last night.', example_zh: '昨晚天氣有了戲劇性的變化。', tier: '進階' },
  { word: 'elective', pos: 'adj.', phonetic: '/ɪˈlɛktɪv/', definition: 'chosen freely, not required', definition_zh: '選修的', example_en: 'Art is an elective course at our school.', example_zh: '美術在我們學校是一門選修課。', tier: '進階' },
  { word: 'electrical', pos: 'adj.', phonetic: '/ɪˈlɛktrɪkl/', definition: 'related to electricity', definition_zh: '與電有關的', example_en: 'There was an electrical problem with the washing machine.', example_zh: '洗衣機有電力方面的問題。', tier: '進階' },
  { word: 'electronic', pos: 'adj.', phonetic: '/ɪˌlɛkˈtrɑnɪk/', definition: 'operated by electronic devices like computers', definition_zh: '電子的', example_en: 'My mom bought a new electronic dictionary for me.', example_zh: '我媽媽幫我買了一台新的電子字典。', tier: '進階' },
  { word: 'encouraging', pos: 'adj.', phonetic: '/ɪnˈkɜrɪdʒɪŋ/', definition: 'making someone feel confident or hopeful', definition_zh: '鼓勵的', example_en: 'The coach gave us some encouraging words before the game.', example_zh: '教練在比賽前給了我們一些鼓勵的話。', tier: '進階' },
  { word: 'eventual', pos: 'adj.', phonetic: '/ɪˈvɛntʃuəl/', definition: 'happening at the end of a process', definition_zh: '最後的；終究的', example_en: "Hard work led to her eventual success in the contest.", example_zh: '努力最終讓她在比賽中獲得成功。', tier: '進階' },
  { word: 'historic', pos: 'adj.', phonetic: '/hɪˈstɔrɪk/', definition: 'important in history', definition_zh: '有歷史意義的', example_en: 'We visited a historic castle during our trip to Europe.', example_zh: '我們在歐洲旅行時參觀了一座具有歷史意義的城堡。', tier: '進階' },
  { word: 'horrible', pos: 'adj.', phonetic: '/ˈhɔrəbl/', definition: 'very unpleasant or shocking', definition_zh: '可怕的', example_en: 'The smell from the trash can was horrible.', example_zh: '垃圾桶傳來的味道很可怕。', tier: '進階' },
  { word: 'imaginary', pos: 'adj.', phonetic: '/ɪˈmædʒəˌnɛri/', definition: 'existing only in the mind, not real', definition_zh: '假想的；虛構的', example_en: 'The little girl talks to an imaginary friend every day.', example_zh: '那個小女孩每天都會跟一個假想的朋友說話。', tier: '進階' },
  { word: 'inclusive', pos: 'adj.', phonetic: '/ɪnˈklusɪv/', definition: 'including everything or everyone', definition_zh: '包括的；含括的', example_en: 'The hotel price is inclusive of breakfast and Wi-Fi.', example_zh: '這間飯店的價格包含早餐和無線網路。', tier: '進階' },
  { word: 'indicative', pos: 'adj.', phonetic: '/ɪnˈdɪkətɪv/', definition: 'showing or suggesting something', definition_zh: '顯示的；指示的', example_en: 'Her smile was indicative of how happy she felt.', example_zh: '她的笑容顯示出她有多開心。', tier: '進階' },
  { word: 'individual', pos: 'adj.', phonetic: '/ˌɪndəˈvɪdʒuəl/', definition: 'relating to one single person or thing', definition_zh: '個人的；個別的', example_en: 'Each student has an individual desk in the new classroom.', example_zh: '新教室裡每個學生都有自己的個人書桌。', tier: '進階' },
  { word: 'informative', pos: 'adj.', phonetic: '/ɪnˈfɔrmətɪv/', definition: 'giving useful and interesting information', definition_zh: '增廣知識的', example_en: 'The museum tour was very informative for the students.', example_zh: '這趟博物館之旅對學生們來說很有教育意義。', tier: '進階' },
  { word: 'insistent', pos: 'adj.', phonetic: '/ɪnˈsɪstənt/', definition: 'saying firmly that something must happen', definition_zh: '堅持的', example_en: 'My grandmother was insistent that we stay for dinner.', example_zh: '我奶奶堅持要我們留下來吃晚餐。', tier: '進階' },
  { word: 'instant', pos: 'adj.', phonetic: '/ˈɪnstənt/', definition: 'happening immediately', definition_zh: '立即的', example_en: 'The website gives you instant access to the results.', example_zh: '這個網站讓你能立即取得結果。', tier: '進階' },
  { word: 'instrumental', pos: 'adj.', phonetic: '/ˌɪnstrəˈmɛntl/', definition: 'playing an important part in making something happen', definition_zh: '起作用的；有幫助的', example_en: 'Her advice was instrumental in solving the problem.', example_zh: '她的建議在解決問題上起了關鍵作用。', tier: '進階' },
  { word: 'lacking', pos: 'adj.', phonetic: '/ˈlækɪŋ/', definition: 'not having enough of something needed', definition_zh: '欠缺的', example_en: 'The old computer is lacking in memory space.', example_zh: '那台舊電腦記憶體空間不足。', tier: '進階' },
  { word: 'latest', pos: 'adj.', phonetic: '/ˈleɪtɪst/', definition: 'most recent', definition_zh: '最新的', example_en: "Have you seen the singer's latest music video?", example_zh: '你看過那位歌手最新的音樂錄影帶了嗎？', tier: '進階' },
  { word: 'latter', pos: 'adj.', phonetic: '/ˈlætər/', definition: 'the second of two things mentioned', definition_zh: '後者的', example_en: 'Of the two plans, I prefer the latter one.', example_zh: '這兩個計畫中，我比較喜歡後面那一個。', tier: '進階' },
  { word: 'major', pos: 'adj.', phonetic: '/ˈmeɪdʒər/', definition: 'very important or large', definition_zh: '重要的；主要的', example_en: 'Traffic is a major problem in this city.', example_zh: '交通是這座城市的一大問題。', tier: '進階' },
  { word: 'marvelous', pos: 'adj.', phonetic: '/ˈmɑrvələs/', definition: 'wonderful and impressive', definition_zh: '令人驚嘆的', example_en: 'The fireworks show last night was marvelous.', example_zh: '昨晚的煙火秀真是令人驚嘆。', tier: '進階' },
  { word: 'meaningful', pos: 'adj.', phonetic: '/ˈminɪŋfəl/', definition: 'having a real purpose or importance', definition_zh: '意義深遠的', example_en: 'Volunteering at the shelter was a meaningful experience.', example_zh: '在收容所當志工是一段很有意義的經驗。', tier: '進階' },
  { word: 'minor', pos: 'adj.', phonetic: '/ˈmaɪnər/', definition: 'not very important or serious', definition_zh: '次要的；輕微的', example_en: 'He only suffered a minor injury in the accident.', example_zh: '他在意外中只受了輕傷。', tier: '進階' },
  { word: 'musical', pos: 'adj.', phonetic: '/ˈmjuzɪkl/', definition: 'related to or good at music', definition_zh: '音樂的', example_en: 'She comes from a very musical family.', example_zh: '她來自一個非常有音樂天分的家庭。', tier: '進階' },
  { word: 'necessary', pos: 'adj.', phonetic: '/ˈnɛsəˌsɛri/', definition: 'needed in order to achieve something', definition_zh: '必要的', example_en: 'It is necessary to bring an umbrella today.', example_zh: '今天有必要帶把傘。', tier: '進階' },
  { word: 'numerous', pos: 'adj.', phonetic: '/ˈnumərəs/', definition: 'existing in large numbers', definition_zh: '許多的', example_en: 'There are numerous ways to solve this math problem.', example_zh: '解決這道數學題有很多種方法。', tier: '進階' },
  { word: 'objective', pos: 'adj.', phonetic: '/əbˈdʒɛktɪv/', definition: 'based on facts, not personal feelings', definition_zh: '客觀的', example_en: 'A good judge should stay objective during the trial.', example_zh: '好的法官在審判時應該保持客觀。', tier: '進階' },
  { word: 'operational', pos: 'adj.', phonetic: '/ˌɑpəˈreɪʃənl/', definition: 'working and ready to be used', definition_zh: '運作中的', example_en: 'The new subway line will be operational next month.', example_zh: '新的捷運線下個月將開始營運。', tier: '進階' },
  { word: 'partial', pos: 'adj.', phonetic: '/ˈpɑrʃəl/', definition: 'not complete; only part of something', definition_zh: '部分的', example_en: 'We got only a partial view of the mountain from the room.', example_zh: '我們從房間只能看到山的一部分景色。', tier: '進階' },
  { word: 'particular', pos: 'adj.', phonetic: '/pərˈtɪkjələr/', definition: 'special or specific', definition_zh: '特別的；特定的', example_en: 'Is there a particular reason you chose this color?', example_zh: '你選這個顏色有什麼特別的原因嗎？', tier: '進階' },
  { word: 'peaceful', pos: 'adj.', phonetic: '/ˈpisfəl/', definition: 'calm and quiet, without trouble', definition_zh: '和平的；平靜的', example_en: 'The lake looked peaceful in the early morning.', example_zh: '清晨時湖面看起來很平靜。', tier: '進階' },
  { word: 'periodical', pos: 'adj.', phonetic: '/ˌpɪriˈɑdɪkl/', definition: 'happening at regular times', definition_zh: '定期的', example_en: 'The clinic sends periodical reminders for check-ups.', example_zh: '診所會定期發送健康檢查的提醒。', tier: '進階' },
  { word: 'positive', pos: 'adj.', phonetic: '/ˈpɑzətɪv/', definition: 'hopeful and confident; certain', definition_zh: '肯定的；積極的', example_en: 'Try to stay positive even when things go wrong.', example_zh: '就算事情出錯，也要試著保持積極。', tier: '進階' },
  { word: 'practical', pos: 'adj.', phonetic: '/ˈpræktɪkl/', definition: 'useful and sensible, not just theoretical', definition_zh: '實際的', example_en: 'Wearing comfortable shoes is a practical choice for hiking.', example_zh: '穿舒適的鞋子是登山時實際的選擇。', tier: '進階' },
  { word: 'precious', pos: 'adj.', phonetic: '/ˈprɛʃəs/', definition: 'very valuable or important', definition_zh: '珍貴的', example_en: 'Time with family is precious to me.', example_zh: '和家人相處的時間對我來說很珍貴。', tier: '進階' },
  { word: 'primary', pos: 'adj.', phonetic: '/ˈpraɪˌmɛri/', definition: 'main or most important', definition_zh: '主要的', example_en: 'The primary goal of the trip is to relax.', example_zh: '這趟旅行的主要目的是放鬆。', tier: '進階' },
  { word: 'private', pos: 'adj.', phonetic: '/ˈpraɪvɪt/', definition: 'belonging to one person, not for public use', definition_zh: '私人的', example_en: 'Please knock before entering my private room.', example_zh: '進我的私人房間前請先敲門。', tier: '進階' },
  { word: 'productive', pos: 'adj.', phonetic: '/prəˈdʌktɪv/', definition: 'producing a lot of good results', definition_zh: '有成效的', example_en: 'We had a productive meeting this morning.', example_zh: '我們今天早上開了一場很有成效的會議。', tier: '進階' },
  { word: 'professional', pos: 'adj.', phonetic: '/prəˈfɛʃənl/', definition: 'relating to a job that needs special training', definition_zh: '專業的', example_en: 'The dancer gave a very professional performance.', example_zh: '那位舞者展現出非常專業的表演。', tier: '進階' },
  { word: 'progressive', pos: 'adj.', phonetic: '/prəˈgrɛsɪv/', definition: 'developing or improving gradually', definition_zh: '逐漸的；先進的', example_en: 'The school follows a progressive teaching method.', example_zh: '這所學校採用漸進式的教學方法。', tier: '進階' },
  { word: 'promising', pos: 'adj.', phonetic: '/ˈprɑmɪsɪŋ/', definition: 'likely to be successful in the future', definition_zh: '有前途的', example_en: 'She is a promising young writer.', example_zh: '她是一位有前途的年輕作家。', tier: '進階' },
  { word: 'protective', pos: 'adj.', phonetic: '/prəˈtɛktɪv/', definition: 'keeping someone or something safe from harm', definition_zh: '保護的', example_en: 'Workers must wear protective gloves in the factory.', example_zh: '工人在工廠裡必須戴上防護手套。', tier: '進階' },
  { word: 'reasonable', pos: 'adj.', phonetic: '/ˈrizənəbl/', definition: 'fair and sensible', definition_zh: '合理的', example_en: 'The price of the used bike seems reasonable.', example_zh: '這台二手腳踏車的價格似乎很合理。', tier: '進階' },
  { word: 'recent', pos: 'adj.', phonetic: '/ˈrisənt/', definition: 'happened not long ago', definition_zh: '最近的', example_en: 'In recent years, more people ride bicycles to work.', example_zh: '近年來，越來越多人騎腳踏車上班。', tier: '進階' },
  { word: 'respective', pos: 'adj.', phonetic: '/rɪˈspɛktɪv/', definition: 'belonging to each person separately', definition_zh: '各自的', example_en: 'After the trip, they went back to their respective homes.', example_zh: '旅行結束後，他們各自回到自己的家。', tier: '進階' },
  { word: 'satisfactory', pos: 'adj.', phonetic: '/ˌsætɪsˈfæktəri/', definition: 'good enough to be acceptable', definition_zh: '令人滿意的', example_en: 'His test score was satisfactory but not excellent.', example_zh: '他的考試成績還算令人滿意，但不算優秀。', tier: '進階' },
  { word: 'scientific', pos: 'adj.', phonetic: '/ˌsaɪənˈtɪfɪk/', definition: 'relating to science', definition_zh: '科學的', example_en: 'The students did a scientific experiment in class.', example_zh: '學生們在課堂上做了一個科學實驗。', tier: '進階' },
  { word: 'secondary', pos: 'adj.', phonetic: '/ˈsɛkənˌdɛri/', definition: 'less important than something else', definition_zh: '次要的', example_en: 'Getting good grades is secondary to staying healthy.', example_zh: '保持健康比拿到好成績更重要。', tier: '進階' },
  { word: 'selective', pos: 'adj.', phonetic: '/səˈlɛktɪv/', definition: 'choosing carefully from a group', definition_zh: '挑選的；有選擇性的', example_en: 'The university is very selective about its students.', example_zh: '那所大學對於招收學生非常挑剔。', tier: '進階' },
  { word: 'separate', pos: 'adj.', phonetic: '/ˈsɛpərɪt/', definition: 'not joined or connected to something else', definition_zh: '分開的', example_en: 'Please keep the wet clothes in a separate bag.', example_zh: '請把濕的衣服放在另一個袋子裡。', tier: '進階' },
  { word: 'similar', pos: 'adj.', phonetic: '/ˈsɪmələr/', definition: 'almost the same as something else', definition_zh: '相似的', example_en: 'My sister and I have similar taste in music.', example_zh: '我和我姊姊在音樂品味上很相似。', tier: '進階' },
  { word: 'skilled', pos: 'adj.', phonetic: '/skɪld/', definition: 'having the training to do something well', definition_zh: '有技能的', example_en: 'We need a skilled worker to fix the roof.', example_zh: '我們需要一位有技術的工人來修屋頂。', tier: '進階' },
  { word: 'soft', pos: 'adj.', phonetic: '/sɔft/', definition: 'not hard or rough; gentle', definition_zh: '柔軟的；柔和的', example_en: "The kitten's fur felt very soft.", example_zh: '那隻小貓的毛摸起來很柔軟。', tier: '進階' },
  { word: 'speedy', pos: 'adj.', phonetic: '/ˈspidi/', definition: 'moving or happening quickly', definition_zh: '迅速的', example_en: 'We wish him a speedy recovery from his cold.', example_zh: '我們祝他感冒能快點康復。', tier: '進階' },
  { word: 'spiritual', pos: 'adj.', phonetic: '/ˈspɪrɪtʃuəl/', definition: 'relating to the human spirit, not the body', definition_zh: '精神的；心靈的', example_en: 'Reading gives me a sense of spiritual peace.', example_zh: '閱讀讓我感到心靈平靜。', tier: '進階' },
  { word: 'stressful', pos: 'adj.', phonetic: '/ˈstrɛsfəl/', definition: 'causing worry or pressure', definition_zh: '有壓力的', example_en: 'Exam week can be very stressful for students.', example_zh: '考試週對學生來說可能壓力很大。', tier: '進階' },
  { word: 'sudden', pos: 'adj.', phonetic: '/ˈsʌdn/', definition: 'happening quickly and unexpectedly', definition_zh: '突然的', example_en: 'There was a sudden knock on the door.', example_zh: '突然傳來一陣敲門聲。', tier: '進階' },
  { word: 'suggestive', pos: 'adj.', phonetic: '/səgˈdʒɛstɪv/', definition: 'making you think of something else', definition_zh: '引發聯想的', example_en: "The song's melody is suggestive of a rainy day.", example_zh: '這首歌的旋律讓人聯想到下雨天。', tier: '進階' },
  { word: 'symbolic', pos: 'adj.', phonetic: '/sɪmˈbɑlɪk/', definition: 'representing something else with a special meaning', definition_zh: '象徵的', example_en: 'The white dove is symbolic of peace.', example_zh: '白鴿象徵著和平。', tier: '進階' },
  { word: 'tearful', pos: 'adj.', phonetic: '/ˈtɪrfəl/', definition: 'crying or about to cry', definition_zh: '淚流滿面的', example_en: 'She gave a tearful speech at graduation.', example_zh: '她在畢業典禮上發表了一段淚流滿面的演說。', tier: '進階' },
  { word: 'universal', pos: 'adj.', phonetic: '/ˌjunəˈvɜrsl/', definition: 'shared by everyone or found everywhere', definition_zh: '普遍的；全體的', example_en: 'Music is often called a universal language.', example_zh: '音樂常被稱為一種普世的語言。', tier: '進階' },
  { word: 'useless', pos: 'adj.', phonetic: '/ˈjusləs/', definition: 'not useful; having no purpose', definition_zh: '無用的', example_en: 'This old phone is completely useless now.', example_zh: '這支舊手機現在完全沒用了。', tier: '進階' },
  { word: 'usual', pos: 'adj.', phonetic: '/ˈjuʒuəl/', definition: 'normal or expected', definition_zh: '平常的', example_en: 'He arrived at the usual time this morning.', example_zh: '他今天早上在平常的時間抵達。', tier: '進階' },
  { word: 'valuable', pos: 'adj.', phonetic: '/ˈvæljəbl/', definition: 'worth a lot of money or very useful', definition_zh: '寶貴的', example_en: "Don't waste valuable time on video games.", example_zh: '別把寶貴的時間浪費在電動上。', tier: '進階' },
  { word: 'willing', pos: 'adj.', phonetic: '/ˈwɪlɪŋ/', definition: 'ready and happy to do something', definition_zh: '樂意的', example_en: 'My classmate was willing to share her notes with me.', example_zh: '我的同學很樂意跟我分享她的筆記。', tier: '進階' },
  { word: 'worthy', pos: 'adj.', phonetic: '/ˈwɜrði/', definition: 'deserving respect, attention, or effort', definition_zh: '值得的', example_en: 'This charity is worthy of our support.', example_zh: '這個慈善機構值得我們的支持。', tier: '進階' },
];

async function main() {
  const allWords = [...BASIC.map(w => ({ word: w, tier: '基礎' })), ...ADV.map(w => ({ word: w, tier: '進階' }))];
  console.log(`Unit 29 書上共 ${allWords.length} 字（基礎 ${BASIC.length} + 進階 ${ADV.length}）`);

  const matched = [];
  const missing = [];
  for (const { word, tier } of allWords) {
    const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) matched.push({ ...data[0], tier });
    else missing.push({ word, tier });
  }
  console.log(`已有 ${matched.length} 字，缺少 ${missing.length} 字`);

  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = Array.from(new Set([...(m.tags || []), UNIT]));
    if (tags.includes('user_lookup') || tags.includes('user_custom')) {
      tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      promoted++;
    }
    if (tags.length === (m.tags || []).length && tags.every(t => (m.tags || []).includes(t))) continue;
    const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`已為 ${tagged} 個字加上/更新 ${UNIT} 標籤（其中 ${promoted} 個做了 user_lookup/user_custom 升格）`);

  let inserted = 0, skipped = 0, failed = 0;
  for (const e of MISSING_ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 ${UNIT} 標籤`);
      let tags = Array.from(new Set([...(existing[0].tags || []), UNIT]));
      if (tags.includes('user_lookup') || tags.includes('user_custom')) {
        tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      }
      await supabase.from('words').update({ tags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic, definition: e.definition,
      definition_zh: e.definition_zh, example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', UNIT, e.tier], level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`補字完成：新增 ${inserted}、跳過(已存在) ${skipped}、失敗 ${failed}`);

  const { data: finalData, error: finalErr } = await supabase.from('words').select('id').contains('tags', [UNIT]);
  if (finalErr) console.error('驗證查詢失敗:', finalErr.message);
  else console.log(`\n驗證：資料庫內 ${UNIT} 標籤總數 = ${finalData.length}，書上清單總數 = ${allWords.length}，${finalData.length === allWords.length ? '✅ 一致' : '❌ 不一致，需檢查'}`);
}

main().catch(err => { console.error(err); process.exit(1); });
