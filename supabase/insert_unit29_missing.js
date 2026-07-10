/**
 * 補齊 Unit 29（其他形容詞 Other Adjectives）在 words 表裡缺少的 80 個字（皆為進階學習篇）。
 * 內容依 cambridge-style-examples 技能規範原創生成（非抄書），
 * 欄位對齊現有 words 表格式，並加上 tags: ['cap_2000','unit29','進階']。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'accidental', pos: 'adj.', phonetic: '/ˌæksəˈdɛntəl/', definition: 'happening by chance, not planned', definition_zh: '偶然的；意外的', example_en: 'Their meeting at the mall was totally accidental.', example_zh: '他們在購物中心相遇完全是偶然的。' },
  { word: 'actual', pos: 'adj.', phonetic: '/ˈæktʃuəl/', definition: 'real and true, not what people imagined', definition_zh: '實際的；真實的', example_en: 'The actual test was easier than we expected.', example_zh: '實際的考試比我們預期的簡單。' },
  { word: 'additional', pos: 'adj.', phonetic: '/əˈdɪʃənəl/', definition: 'more than what already exists', definition_zh: '額外的；附加的', example_en: 'We need additional chairs for the class party.', example_zh: '班上的派對我們需要額外的椅子。' },
  { word: 'advanced', pos: 'adj.', phonetic: '/ədˈvænst/', definition: 'at a high or difficult level', definition_zh: '高等的；先進的', example_en: 'My sister joined the advanced math class this year.', example_zh: '我姊姊今年加入了高等數學班。' },
  { word: 'advantageous', pos: 'adj.', phonetic: '/ˌædvənˈteɪdʒəs/', definition: 'helpful and giving a benefit', definition_zh: '有利的', example_en: 'Learning English early is advantageous for students.', example_zh: '及早學英文對學生是有利的。' },
  { word: 'advisory', pos: 'adj.', phonetic: '/ədˈvaɪzəri/', definition: 'giving advice or suggestions', definition_zh: '提供諮詢的', example_en: 'The teacher joined an advisory group for new students.', example_zh: '老師加入了一個為新生提供諮詢的小組。' },
  { word: 'artistic', pos: 'adj.', phonetic: '/ɑrˈtɪstɪk/', definition: 'good at or related to art', definition_zh: '藝術的；有藝術天分的', example_en: 'Her artistic drawings won first prize at school.', example_zh: '她富藝術性的畫作在學校獲得第一名。' },
  { word: 'comparative', pos: 'adj.', phonetic: '/kəmˈpærətɪv/', definition: 'judged by comparing with something else', definition_zh: '比較的', example_en: 'We did a comparative study of two cities.', example_zh: '我們做了兩座城市的比較研究。' },
  { word: 'concerned', pos: 'adj.', phonetic: '/kənˈsɜrnd/', definition: 'worried or caring about something', definition_zh: '關心的；擔心的', example_en: 'My parents are concerned about my exam results.', example_zh: '我爸媽很擔心我的考試成績。' },
  { word: 'continual', pos: 'adj.', phonetic: '/kənˈtɪnjuəl/', definition: 'happening again and again over time', definition_zh: '不停的；反覆的', example_en: 'The continual noise from the road kept us awake.', example_zh: '馬路上不停的噪音讓我們無法入睡。' },
  { word: 'creative', pos: 'adj.', phonetic: '/kriˈeɪtɪv/', definition: 'good at making new and interesting things', definition_zh: '有創意的', example_en: 'The art teacher always gives us creative projects.', example_zh: '美術老師總是給我們有創意的作業。' },
  { word: 'criminal', pos: 'adj.', phonetic: '/ˈkrɪmənəl/', definition: 'related to crime or breaking the law', definition_zh: '犯罪的', example_en: 'Stealing is a criminal act in every country.', example_zh: '偷竊在每個國家都是犯罪行為。' },
  { word: 'cultural', pos: 'adj.', phonetic: '/ˈkʌltʃərəl/', definition: 'related to the customs and arts of a group of people', definition_zh: '文化的', example_en: 'The festival shows the cultural diversity of Taiwan.', example_zh: '這個節慶展現了台灣的文化多樣性。' },
  { word: 'desirous', pos: 'adj.', phonetic: '/dɪˈzaɪrəs/', definition: 'wanting something very much', definition_zh: '渴望的', example_en: 'He was desirous of winning the singing contest.', example_zh: '他渴望贏得歌唱比賽。' },
  { word: 'doubtful', pos: 'adj.', phonetic: '/ˈdaʊtfəl/', definition: 'not sure that something is true or will happen', definition_zh: '懷疑的；不確定的', example_en: "I'm doubtful that it will rain today.", example_zh: '我懷疑今天會不會下雨。' },
  { word: 'dramatic', pos: 'adj.', phonetic: '/drəˈmætɪk/', definition: 'sudden and very noticeable', definition_zh: '戲劇性的；顯著的', example_en: 'There was a dramatic change in the weather.', example_zh: '天氣有了戲劇性的變化。' },
  { word: 'elective', pos: 'adj.', phonetic: '/ɪˈlɛktɪv/', definition: 'able to be chosen, not required', definition_zh: '選修的；選舉的', example_en: 'Art is an elective course at our school.', example_zh: '美術在我們學校是選修課。' },
  { word: 'electrical', pos: 'adj.', phonetic: '/ɪˈlɛktrɪkəl/', definition: 'related to electricity', definition_zh: '與電有關的', example_en: 'The fan stopped because of an electrical problem.', example_zh: '電風扇因為電路問題而停止運轉。' },
  { word: 'electronic', pos: 'adj.', phonetic: '/ɪˌlɛkˈtrɑnɪk/', definition: 'using small parts like chips to work automatically', definition_zh: '電子的', example_en: 'Most students now use electronic dictionaries.', example_zh: '現在大部分學生都使用電子字典。' },
  { word: 'encouraging', pos: 'adj.', phonetic: '/ɪnˈkɜrɪdʒɪŋ/', definition: 'making someone feel confident or hopeful', definition_zh: '鼓勵的', example_en: 'The coach gave us an encouraging smile before the race.', example_zh: '教練在比賽前給了我們一個鼓勵的微笑。' },
  { word: 'eventual', pos: 'adj.', phonetic: '/ɪˈvɛntʃuəl/', definition: 'happening at the end of a process', definition_zh: '最後的', example_en: 'Hard work led to his eventual success.', example_zh: '努力使他最終獲得成功。' },
  { word: 'historic', pos: 'adj.', phonetic: '/hɪˈstɔrɪk/', definition: 'important in history', definition_zh: '在歷史上重要的', example_en: 'The old temple is a historic site in our town.', example_zh: '這座古老的廟宇是我們鎮上具歷史意義的景點。' },
  { word: 'horrible', pos: 'adj.', phonetic: '/ˈhɔrəbəl/', definition: 'very bad or unpleasant', definition_zh: '可怕的；糟糕的', example_en: 'We had a horrible time waiting in the heavy rain.', example_zh: '我們在大雨中等待的過程很糟糕。' },
  { word: 'imaginary', pos: 'adj.', phonetic: '/ɪˈmædʒəˌnɛri/', definition: 'existing only in the mind, not real', definition_zh: '假想的；想像的', example_en: 'The little boy often talks to his imaginary friend.', example_zh: '這個小男孩常常跟他假想的朋友說話。' },
  { word: 'inclusive', pos: 'adj.', phonetic: '/ɪnˈklusɪv/', definition: 'including everything or everyone', definition_zh: '包括的；包容的', example_en: 'The trip price is inclusive of meals and hotel.', example_zh: '這趟旅行的價格包含餐點和住宿。' },
  { word: 'indicative', pos: 'adj.', phonetic: '/ɪnˈdɪkətɪv/', definition: 'showing or suggesting something', definition_zh: '指示的；顯示的', example_en: 'Her smile was indicative of her good mood.', example_zh: '她的笑容顯示出她的好心情。' },
  { word: 'individual', pos: 'adj.', phonetic: '/ˌɪndəˈvɪdʒuəl/', definition: 'belonging to or relating to one single person', definition_zh: '個人的；個別的', example_en: 'Each student has an individual desk in this class.', example_zh: '這班每個學生都有自己個人的書桌。' },
  { word: 'informative', pos: 'adj.', phonetic: '/ɪnˈfɔrmətɪv/', definition: 'giving useful information', definition_zh: '增廣知識的；資訊豐富的', example_en: 'The museum tour was very informative and fun.', example_zh: '這場博物館導覽既有趣又增廣見聞。' },
  { word: 'insistent', pos: 'adj.', phonetic: '/ɪnˈsɪstənt/', definition: 'saying or asking for something firmly and repeatedly', definition_zh: '堅持的', example_en: 'My mom was insistent that I wear a coat.', example_zh: '我媽媽堅持要我穿外套。' },
  { word: 'instant', pos: 'adj.', phonetic: '/ˈɪnstənt/', definition: 'happening immediately', definition_zh: '立即的', example_en: 'The new app gives instant results for the quiz.', example_zh: '這個新的應用程式會立即顯示測驗結果。' },
  { word: 'instrumental', pos: 'adj.', phonetic: '/ˌɪnstrəˈmɛntəl/', definition: 'playing an important part in making something happen', definition_zh: '起作用的；有幫助的', example_en: 'The teacher was instrumental in helping him improve.', example_zh: '這位老師在幫助他進步上起了作用。' },
  { word: 'lacking', pos: 'adj.', phonetic: '/ˈlækɪŋ/', definition: 'not having enough of something', definition_zh: '欠缺的', example_en: 'The old computer was lacking in memory space.', example_zh: '這台舊電腦記憶體空間不足。' },
  { word: 'latest', pos: 'adj.', phonetic: '/ˈleɪtɪst/', definition: 'most recent or newest', definition_zh: '最新的', example_en: 'Have you heard the singer\'s latest song yet?', example_zh: '你聽過那位歌手最新的歌了嗎？' },
  { word: 'latter', pos: 'adj.', phonetic: '/ˈlætər/', definition: 'the second of two things already mentioned', definition_zh: '後者的', example_en: 'Of the two plans, I prefer the latter one.', example_zh: '這兩個計畫中，我比較喜歡後者。' },
  { word: 'major', pos: 'adj.', phonetic: '/ˈmeɪdʒər/', definition: 'more important or larger than others', definition_zh: '重要的；主要的', example_en: 'Traffic safety is a major concern for parents.', example_zh: '交通安全是家長主要關心的事。' },
  { word: 'meaningful', pos: 'adj.', phonetic: '/ˈminɪŋfəl/', definition: 'having a clear and important meaning', definition_zh: '意義深遠的', example_en: 'Volunteering gave her a meaningful summer vacation.', example_zh: '當志工讓她度過了意義深遠的暑假。' },
  { word: 'minor', pos: 'adj.', phonetic: '/ˈmaɪnər/', definition: 'small and not very important', definition_zh: '次要的；少數的', example_en: 'It was just a minor mistake in the report.', example_zh: '那只是報告裡一個小小的錯誤。' },
  { word: 'musical', pos: 'adj.', phonetic: '/ˈmjuzɪkəl/', definition: 'related to or having music', definition_zh: '音樂的', example_en: 'She has a lot of musical talent for her age.', example_zh: '以她的年紀來說，她很有音樂天分。' },
  { word: 'necessary', pos: 'adj.', phonetic: '/ˈnɛsəˌsɛri/', definition: 'needed in order to do something', definition_zh: '必要的', example_en: 'Water is necessary for all living things.', example_zh: '水對所有生物來說都是必要的。' },
  { word: 'numerous', pos: 'adj.', phonetic: '/ˈnjumərəs/', definition: 'existing in large numbers', definition_zh: '數不清的；許多的', example_en: 'There are numerous stars in the night sky.', example_zh: '夜空中有數不清的星星。' },
  { word: 'objective', pos: 'adj.', phonetic: '/əbˈdʒɛktɪv/', definition: 'based on facts, not personal feelings', definition_zh: '客觀的', example_en: 'The judge tried to give an objective opinion.', example_zh: '這位裁判試著給出客觀的意見。' },
  { word: 'operational', pos: 'adj.', phonetic: '/ˌɑpəˈreɪʃənəl/', definition: 'working and ready to be used', definition_zh: '運轉的；營運的', example_en: 'The new elevator is now fully operational.', example_zh: '這座新電梯現在已經可以正常運轉了。' },
  { word: 'partial', pos: 'adj.', phonetic: '/ˈpɑrʃəl/', definition: 'not complete, only part of something', definition_zh: '部分的', example_en: 'We only got a partial view of the stage.', example_zh: '我們只能看到舞台的部分景象。' },
  { word: 'particular', pos: 'adj.', phonetic: '/pərˈtɪkjələr/', definition: 'special or specific, not general', definition_zh: '特別的；特定的', example_en: 'This particular song always makes me happy.', example_zh: '這首特別的歌總是讓我心情愉快。' },
  { word: 'peaceful', pos: 'adj.', phonetic: '/ˈpisfəl/', definition: 'calm and quiet, without trouble', definition_zh: '和平的；平靜的', example_en: 'The village by the lake looks so peaceful.', example_zh: '湖邊那座村莊看起來好平靜。' },
  { word: 'periodical', pos: 'adj.', phonetic: '/ˌpɪriˈɑdɪkəl/', definition: 'happening at regular times', definition_zh: '定期的', example_en: 'We have periodical checkups at the school clinic.', example_zh: '我們在學校診所有定期的健康檢查。' },
  { word: 'positive', pos: 'adj.', phonetic: '/ˈpɑzətɪv/', definition: 'hopeful and confident about something', definition_zh: '肯定的；積極的', example_en: 'Try to stay positive before the big game.', example_zh: '大賽前試著保持積極的心態。' },
  { word: 'practical', pos: 'adj.', phonetic: '/ˈpræktɪkəl/', definition: 'useful and sensible in a real situation', definition_zh: '實際的；實用的', example_en: 'She gave me some practical tips for the trip.', example_zh: '她給了我一些關於這趟旅行的實用建議。' },
  { word: 'precious', pos: 'adj.', phonetic: '/ˈprɛʃəs/', definition: 'very valuable and important', definition_zh: '珍貴的', example_en: 'Family time is precious for busy parents.', example_zh: '對忙碌的父母而言，家庭時光很珍貴。' },
  { word: 'primary', pos: 'adj.', phonetic: '/ˈpraɪˌmɛri/', definition: 'most important or basic', definition_zh: '主要的', example_en: 'Her primary goal is to pass the entrance exam.', example_zh: '她主要的目標是通過入學考試。' },
  { word: 'private', pos: 'adj.', phonetic: '/ˈpraɪvɪt/', definition: 'belonging to one person, not shared with others', definition_zh: '私人的', example_en: 'He keeps his diary in a private drawer.', example_zh: '他把日記放在私人的抽屜裡。' },
  { word: 'productive', pos: 'adj.', phonetic: '/prəˈdʌktɪv/', definition: 'able to produce a lot or good results', definition_zh: '多產的；富有成效的', example_en: 'We had a productive discussion about the project.', example_zh: '我們對這個計畫進行了很有成效的討論。' },
  { word: 'professional', pos: 'adj.', phonetic: '/prəˈfɛʃənəl/', definition: 'relating to a job that needs special training', definition_zh: '專業的', example_en: 'He gave a professional performance at the concert.', example_zh: '他在音樂會上有專業的表現。' },
  { word: 'progressive', pos: 'adj.', phonetic: '/prəˈgrɛsɪv/', definition: 'happening or developing gradually', definition_zh: '逐漸的；先進的', example_en: 'The school made progressive changes to the schedule.', example_zh: '學校對課表做了逐步的改變。' },
  { word: 'promising', pos: 'adj.', phonetic: '/ˈprɑmɪsɪŋ/', definition: 'likely to be successful in the future', definition_zh: '很有前途的', example_en: 'He is a promising young player on the team.', example_zh: '他是隊上一名很有前途的年輕球員。' },
  { word: 'protective', pos: 'adj.', phonetic: '/prəˈtɛktɪv/', definition: 'trying to keep someone or something safe', definition_zh: '保護的', example_en: 'Wear protective gear when you ride a bike.', example_zh: '騎腳踏車時要穿戴保護裝備。' },
  { word: 'reasonable', pos: 'adj.', phonetic: '/ˈrizənəbəl/', definition: 'fair and sensible', definition_zh: '合理的', example_en: 'The shop offers snacks at a reasonable price.', example_zh: '這家店提供價格合理的零食。' },
  { word: 'recent', pos: 'adj.', phonetic: '/ˈrisənt/', definition: 'happening not long ago', definition_zh: '最近的', example_en: 'In recent years, more students study abroad.', example_zh: '近年來，越來越多學生出國留學。' },
  { word: 'respective', pos: 'adj.', phonetic: '/rɪˈspɛktɪv/', definition: 'belonging separately to each person mentioned', definition_zh: '各自的', example_en: 'The players went back to their respective teams.', example_zh: '球員們回到了各自的隊伍。' },
  { word: 'satisfactory', pos: 'adj.', phonetic: '/ˌsætɪsˈfæktəri/', definition: 'good enough to be acceptable', definition_zh: '令人滿意的', example_en: 'His test score was satisfactory this semester.', example_zh: '這學期他的考試成績令人滿意。' },
  { word: 'scientific', pos: 'adj.', phonetic: '/ˌsaɪənˈtɪfɪk/', definition: 'related to science', definition_zh: '科學的', example_en: 'We learned about scientific methods in class.', example_zh: '我們在課堂上學到了科學方法。' },
  { word: 'secondary', pos: 'adj.', phonetic: '/ˈsɛkənˌdɛri/', definition: 'less important than something else', definition_zh: '次要的', example_en: 'Winning is secondary; having fun matters most.', example_zh: '獲勝是次要的，享受樂趣才最重要。' },
  { word: 'selective', pos: 'adj.', phonetic: '/səˈlɛktɪv/', definition: 'careful about choosing only the best things', definition_zh: '挑選的', example_en: 'She is quite selective about what she eats.', example_zh: '她對於吃什麼相當挑選。' },
  { word: 'separate', pos: 'adj.', phonetic: '/ˈsɛpərɪt/', definition: 'not joined or connected to something else', definition_zh: '分開的', example_en: 'The twins asked for separate rooms this year.', example_zh: '這對雙胞胎今年要求要有分開的房間。' },
  { word: 'similar', pos: 'adj.', phonetic: '/ˈsɪmələr/', definition: 'almost the same as something else', definition_zh: '一樣的；相似的', example_en: 'Her handwriting is similar to her sister\'s.', example_zh: '她的字跡和她姊姊的很相似。' },
  { word: 'skilled', pos: 'adj.', phonetic: '/skɪld/', definition: 'having the ability to do something well', definition_zh: '有技能的', example_en: 'We need skilled workers to fix the roof.', example_zh: '我們需要有技能的工人來修理屋頂。' },
  { word: 'soft', pos: 'adj.', phonetic: '/sɔft/', definition: 'not hard or rough to touch', definition_zh: '柔和的；軟的', example_en: "The kitten's fur felt very soft and warm.", example_zh: '小貓的毛摸起來非常柔軟又溫暖。' },
  { word: 'speedy', pos: 'adj.', phonetic: '/ˈspidi/', definition: 'happening quickly', definition_zh: '迅速的', example_en: 'We wish the injured player a speedy recovery.', example_zh: '我們祝福受傷的球員迅速康復。' },
  { word: 'spiritual', pos: 'adj.', phonetic: '/ˈspɪrɪtʃuəl/', definition: 'related to the mind or soul, not the body', definition_zh: '精神的', example_en: 'She finds spiritual comfort in quiet music.', example_zh: '她從安靜的音樂中找到精神上的慰藉。' },
  { word: 'stressful', pos: 'adj.', phonetic: '/ˈstrɛsfəl/', definition: 'causing worry or pressure', definition_zh: '有壓力的', example_en: 'Exam week can be very stressful for students.', example_zh: '考試週對學生來說壓力很大。' },
  { word: 'sudden', pos: 'adj.', phonetic: '/ˈsʌdən/', definition: 'happening quickly and without warning', definition_zh: '突然的', example_en: 'There was a sudden change in the weather.', example_zh: '天氣有了突然的變化。' },
  { word: 'suggestive', pos: 'adj.', phonetic: '/səgˈdʒɛstɪv/', definition: 'making people think of something', definition_zh: '引發聯想的', example_en: 'The old photo is suggestive of happier times.', example_zh: '這張舊照片讓人聯想到更快樂的時光。' },
  { word: 'symbolic', pos: 'adj.', phonetic: '/sɪmˈbɑlɪk/', definition: 'representing an idea rather than being real', definition_zh: '象徵的', example_en: 'The white dove is symbolic of peace.', example_zh: '白鴿象徵著和平。' },
  { word: 'tearful', pos: 'adj.', phonetic: '/ˈtɪrfəl/', definition: 'crying or ready to cry', definition_zh: '淚流滿面的', example_en: 'She gave a tearful speech at graduation.', example_zh: '她在畢業典禮上發表了淚流滿面的演說。' },
  { word: 'universal', pos: 'adj.', phonetic: '/ˌjunəˈvɜrsəl/', definition: 'shared by or affecting everyone', definition_zh: '普遍的；全體的', example_en: 'Kindness is a universal value in every culture.', example_zh: '善良是每個文化都普遍重視的價值。' },
  { word: 'useless', pos: 'adj.', phonetic: '/ˈjuslɪs/', definition: 'not helpful or effective', definition_zh: '無用的', example_en: "It's useless to complain about the rain.", example_zh: '抱怨下雨是沒用的。' },
  { word: 'usual', pos: 'adj.', phonetic: '/ˈjuʒuəl/', definition: 'happening most of the time; normal', definition_zh: '平常的', example_en: 'He took his usual seat by the window.', example_zh: '他坐在他平常靠窗的座位。' },
  { word: 'valuable', pos: 'adj.', phonetic: '/ˈvæljuəbəl/', definition: 'worth a lot or very useful', definition_zh: '寶貴的', example_en: 'She gave me valuable advice about studying.', example_zh: '她給了我關於讀書的寶貴建議。' },
  { word: 'willing', pos: 'adj.', phonetic: '/ˈwɪlɪŋ/', definition: 'happy to do something without complaining', definition_zh: '樂意的', example_en: 'He is always willing to help his classmates.', example_zh: '他總是樂意幫助他的同學。' },
  { word: 'worthy', pos: 'adj.', phonetic: '/ˈwɜrði/', definition: 'deserving attention, respect, or effort', definition_zh: '值得的', example_en: 'This story is worthy of being made into a movie.', example_zh: '這個故事值得被拍成電影。' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit 29 進階學習篇）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit29 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit29']));
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
      tags: ['cap_2000', 'unit29', '進階'],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
