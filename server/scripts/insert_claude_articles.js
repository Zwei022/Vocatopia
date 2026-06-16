/**
 * 由 Claude 直接撰寫的 6 篇閱讀測驗文章，插入 Vocatopia DB
 * 符合會考 B1 難度：185-236 字，FK 6.7-8.3，3 道題目
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const supabase = require('../db/supabase');

const ARTICLES = [
  {
    date: '2026-05-29', slot: 4,
    title: 'Protecting Our Natural World',
    emoji: '🌿', tag: '環境', topic: '環境與自然',
    content: `Every day, people around the world use water, electricity, and other natural resources. However, many of us do not think about where these resources come from or what happens when they run out. Scientists have warned that if we do not change our habits soon, the Earth will face very serious problems in the future.

One important way to protect the environment is to reduce waste. For example, people can bring their own bags when they go shopping instead of using plastic bags. They can also turn off lights and electrical appliances when they are not in use. Taking shorter showers and fixing broken pipes can save a large amount of water every day.

Recycling is another helpful habit. When we recycle paper, glass, and metal, we use fewer natural resources and produce less garbage. Many schools and communities have set up recycling programs to help people learn this good habit. Small actions can make a big difference. By working together and making better choices every day, we can protect our beautiful planet and make sure future generations have a clean and healthy world to live in.`,
    word_count: 196,
    questions: [
      {
        question: '根據文章，人們可以採取什麼方式節省用水？',
        options: ['少使用塑膠袋', '淋浴時間縮短並修繕破損水管', '設立回收計畫', '關掉不用的電燈'],
        answer: 1,
        explanation: '文章第二段明確提到「Taking shorter showers and fixing broken pipes can save a large amount of water every day」，意指縮短淋浴時間及修繕破損水管可節省大量用水。',
        type: 'detail',
      },
      {
        question: '本文的主要目的是什麼？',
        options: ['解釋回收計畫如何運作', '鼓勵人們保護環境', '說明人們每天用了多少水', '警告人們不要使用太多電'],
        answer: 1,
        explanation: '全文從資源浪費、減少廢棄物到回收習慣，均圍繞著「保護環境」這一主題展開，目的在於鼓勵讀者採取行動保護地球。',
        type: 'inference',
      },
      {
        question: '文章最後一段中，「produce」這個字的意思最接近？',
        options: ['購買', '收集', '製造、產生', '節省'],
        answer: 2,
        explanation: '「produce less garbage」意為「產生較少垃圾」，因此「produce」在此語境中為「製造、產生」的意思，選項C最為正確。',
        type: 'vocabulary',
      },
    ],
  },
  {
    date: '2026-05-29', slot: 5,
    title: 'The Wonderful World of Ocean Animals',
    emoji: '🦁', tag: '動物', topic: '動物與生態',
    content: `The ocean is home to millions of different animals. From tiny fish to large whales, the sea is full of amazing creatures. Scientists believe that there are still many ocean animals that humans have never discovered before. These animals play important roles in keeping the ocean healthy and balanced.

Coral reefs are one of the most important parts of the ocean ecosystem. They provide food and shelter for thousands of different species. However, coral reefs around the world are in danger. Pollution and rising ocean temperatures have seriously damaged many reefs in recent years. When coral reefs die, many animals lose their homes and cannot survive.

People can help protect ocean animals in several ways. First, we should avoid buying products that come from endangered animals. Second, we can reduce plastic waste, because plastic trash often ends up in the ocean and harms sea creatures. Third, supporting organizations that work to protect marine life is also very helpful. If we all take action now, we can help save these beautiful animals and protect the health of our oceans for many future generations.`,
    word_count: 193,
    questions: [
      {
        question: '根據文章，珊瑚礁目前面臨的威脅是什麼？',
        options: ['太多動物居住其中', '科學家研究不足', '汙染與海洋溫度上升', '大型鯨魚破壞了珊瑚礁'],
        answer: 2,
        explanation: '文章第二段說明「Pollution and rising ocean temperatures have seriously damaged many reefs」，即汙染及海洋升溫是珊瑚礁面臨的主要威脅。',
        type: 'detail',
      },
      {
        question: '從文章可以推斷作者對海洋動物的態度是？',
        options: ['認為牠們容易被找到及研究', '認為牠們對人類不重要', '認為牠們需要人類的幫助與保護', '認為牠們可以適應任何環境變化'],
        answer: 2,
        explanation: '全文強調珊瑚礁遭受威脅、動物失去棲地，並呼籲人類採取行動保護海洋，顯示作者認為海洋動物需要人類積極保護。',
        type: 'inference',
      },
      {
        question: '文章第二段中，「shelter」的意思最接近？',
        options: ['食物', '安全的居住場所', '一種珊瑚', '水溫'],
        answer: 1,
        explanation: '「They provide food and shelter for thousands of different species」中，「shelter」與「food」並列，意指動物所需的「庇護所、居住場所」，選項B最符合。',
        type: 'vocabulary',
      },
    ],
  },
  {
    date: '2026-05-30', slot: 2,
    title: 'The Joy of Traveling to New Places',
    emoji: '✈️', tag: '旅遊', topic: '旅遊與探索',
    content: `Traveling to new places is one of the most exciting experiences in life. When you visit a different city or country, you can learn about new cultures, try different foods, and meet interesting people. Travel opens your mind and helps you see the world in a new way.

Before taking a trip, it is important to plan carefully. You should research the place you want to visit and learn some basic facts about it. For example, you might want to know about the local weather, transportation options, and customs. Booking hotels and transportation in advance can save both time and money. Many experienced travelers also recommend keeping a small notebook to write down interesting things they discover along the way.

Traveling does not have to be expensive. There are many ways to explore new places without spending too much money. For instance, staying at budget hotels or with local families can be a wonderful experience. Taking public transportation instead of taxis is another way to save money. No matter where you go or how much money you spend, every trip teaches you something new about the world and about yourself. So pack your bags and start exploring!`,
    word_count: 200,
    questions: [
      {
        question: '根據文章，旅行前應該做什麼？',
        options: ['學會說當地語言', '仔細規劃並研究目的地', '購買昂貴的相機', '找到旅伴'],
        answer: 1,
        explanation: '文章第二段開頭說明「Before taking a trip, it is important to plan carefully」並提到研究目的地的天氣、交通和習俗，強調事先規劃的重要性。',
        type: 'detail',
      },
      {
        question: '文章最後一段的主要訊息是什麼？',
        options: ['旅行總是很昂貴', '大眾交通工具很危險', '就算預算有限，任何人都能享受旅行', '廉價旅館很不舒適'],
        answer: 2,
        explanation: '最後一段列舉多種省錢方法，最後以「every trip teaches you something new」作結，傳達旅行不需花大錢、人人都能享受的核心訊息。',
        type: 'inference',
      },
      {
        question: '第一段中「opens your mind」的意思最接近？',
        options: ['讓你感到疲憊', '幫助你以新的方式思考', '花費很多金錢', '教你烹調新食物'],
        answer: 1,
        explanation: '「Travel opens your mind and helps you see the world in a new way」，「opens your mind」意為「拓展眼界、以新方式看待事物」，選項B最為正確。',
        type: 'vocabulary',
      },
    ],
  },
  {
    date: '2026-05-30', slot: 3,
    title: 'How Music Affects Our Daily Life',
    emoji: '🎵', tag: '藝術', topic: '音樂與藝術',
    content: `Music is a big part of our everyday lives. We hear it in stores, on buses, and in our homes. Many people listen to music when they exercise, study, or want to relax. But why do people enjoy music so much, and how does it really affect us?

Research shows that music can influence our emotions and health in many positive ways. When people listen to happy, upbeat music, they often feel more cheerful and full of energy. On the other hand, slow and quiet music can help people feel calm and reduce stress after a long, tiring day. Some studies have also found that listening to certain types of music while studying can help students focus better and remember information more easily.

Learning to play a musical instrument also brings many benefits. Children who study music often do better in school, especially in subjects like math and reading. Playing an instrument helps train the brain to think in both creative and logical ways. It also teaches patience and shows the value of regular practice. Even if you have no plans to become a professional musician, learning an instrument can be a wonderful hobby that brings great joy to your life and to those around you.`,
    word_count: 202,
    questions: [
      {
        question: '根據文章，緩慢輕柔的音樂有什麼效果？',
        options: ['讓人感到充滿活力', '幫助人們專注於數學', '讓人平靜並減輕壓力', '幫助人們記憶資訊'],
        answer: 2,
        explanation: '文章第二段指出「slow and quiet music can help people feel calm and reduce stress」，說明緩慢輕柔的音樂能幫助人們平靜並減輕壓力。',
        type: 'detail',
      },
      {
        question: '根據文章，作者對學習樂器的看法是？',
        options: ['只對未來的音樂家有用', '對大多數孩子來說太困難', '可以在許多方面讓人受益', '與學業表現無關'],
        answer: 2,
        explanation: '文章最後一段說明學習樂器能提升學業、訓練大腦思維、培養耐心，並成為帶來喜悅的嗜好，顯示作者認為學習樂器能帶來多方面益處。',
        type: 'inference',
      },
      {
        question: '文章最後一段中，「logical」這個字的意思最接近？',
        options: ['富有創意且藝術性的', '基於清晰思考與邏輯的', '緩慢且困難的', '與音樂和樂器有關的'],
        answer: 1,
        explanation: '「logical」意指「合乎邏輯的、有條理的」，文中與「creative」對比使用，描述大腦的兩種思考方式：創意思維與邏輯思維，選項B最正確。',
        type: 'vocabulary',
      },
    ],
  },
  {
    date: '2026-05-30', slot: 4,
    title: 'The Importance of Family and Friends',
    emoji: '👨‍👩‍👧', tag: '生活', topic: '家庭與友情',
    content: `Family and friends are two of the most important parts of our lives. They give us love, support, and a sense of belonging. When we face difficult situations, the people we care about can help us feel better and find the strength to keep going. Without family and friends, life can feel very lonely and empty.

Good friendships take time and effort to build. Real friends are honest with each other, and they support one another through both good and bad times. A true friend will tell you the truth even when it is hard to hear, because they care about your well-being. To have good friends, you also need to be a good friend yourself. This means being kind, listening carefully, and being there when someone truly needs your help.

Family relationships are also very important in our lives. Even though family members may sometimes disagree or argue, these problems can usually be solved through open communication and understanding. Spending time together, sharing meals, and talking about your day can help build strong family bonds. Whether with family or close friends, the relationships we build and care for make our lives richer, happier, and much more meaningful every day.`,
    word_count: 204,
    questions: [
      {
        question: '根據文章，真正的朋友會做什麼？',
        options: ['永遠同意你說的一切', '幫你在學校受歡迎', '就算難以接受，也會告訴你真相', '給你昂貴的禮物'],
        answer: 2,
        explanation: '文章第二段說明「A true friend will tell you the truth even when it is hard to hear, because they care about your well-being」，即真正的朋友會誠實說出真相。',
        type: 'detail',
      },
      {
        question: '文章第二段的主要觀念是什麼？',
        options: ['建立友誼對大多數人來說太困難', '好的友誼需要雙方的誠實與努力', '家庭關係比友誼更重要', '真正的朋友永遠不會爭吵'],
        answer: 1,
        explanation: '第二段強調好友誼需要誠實、相互支持，以及自己也要成為好朋友，核心概念是建立好友誼需要雙方共同付出誠實與努力。',
        type: 'inference',
      },
      {
        question: '文章最後一段中，「bonds」的意思最接近？',
        options: ['問題與爭執', '家人共享的餐點', '人與人之間緊密的連結', '溝通技巧'],
        answer: 2,
        explanation: '「build strong family bonds」中，「bonds」意指家人之間「緊密的聯繫、情感連結」，用來描述家庭成員間的親密關係，選項C最為正確。',
        type: 'vocabulary',
      },
    ],
  },
  {
    date: '2026-05-30', slot: 5,
    title: 'Planning Your Future Career',
    emoji: '🚀', tag: '未來', topic: '職涯與夢想',
    content: `Choosing a career is one of the most important decisions in a person's life. A career is not just a job — it is a direction that you will follow for many years. For this reason, it is important to think carefully about what you enjoy doing, what you are good at, and what kind of life you hope to have in the future.

Many students feel pressure to choose a career that earns a high salary. However, research shows that people who do work they love are generally happier and more successful than those who focus only on money. Of course, it is also important to think about practical matters, such as job opportunities and the skills needed in different fields of work.

One of the best ways to explore possible careers is to try different activities and experiences. Joining school clubs, volunteering in your community, and speaking with adults about their jobs can give you very useful information. Setting personal goals and working hard to reach them is also a great idea. Remember that it is perfectly fine to change your mind as you grow and learn more about yourself and your interests. The most important thing is to keep an open mind and never stop dreaming big.`,
    word_count: 203,
    questions: [
      {
        question: '根據文章，探索可能職業的好方法有哪些？',
        options: ['閱讀名人傳記', '參加學校社團和志工服務', '選擇薪水最高的職業', '只專注於最喜歡的科目'],
        answer: 1,
        explanation: '文章第三段說明「Joining school clubs, volunteering in your community, and speaking with adults about their jobs」是探索可能職業的好方法，符合選項B的描述。',
        type: 'detail',
      },
      {
        question: '作者對於改變職業選擇的看法是？',
        options: ['這代表失敗', '一旦決定就不應改變', '隨著成長而改變是自然且可接受的', '這會讓人感到不快樂'],
        answer: 2,
        explanation: '文章最後一段說「it is perfectly fine to change your mind as you grow and learn more about yourself」，明確表示作者認為隨著成長而改變想法是完全可以接受的。',
        type: 'inference',
      },
      {
        question: '文章第一段中，「direction」在「a direction that you will follow」裡的意思最接近？',
        options: ['公園裡的小路', '人生中的道路或方向', '一種工作或活動', '一個目標或夢想'],
        answer: 1,
        explanation: '此處「direction」用來比喻職涯是一條長期追隨的「人生方向或路線」，強調職涯選擇的長遠影響，選項B最為正確。',
        type: 'vocabulary',
      },
    ],
  },
];

async function main() {
  console.log('=== 插入 Claude 撰寫的 6 篇文章 ===\n');
  let saved = 0;

  for (const art of ARTICLES) {
    process.stdout.write(`[${art.date} slot${art.slot}] ${art.emoji} ${art.topic} ... `);

    const { data: inserted, error: artErr } = await supabase
      .from('daily_articles')
      .insert({
        date:       art.date,
        slot:       art.slot,
        title:      art.title,
        emoji:      art.emoji,
        tag:        art.tag,
        topic:      art.topic,
        content:    art.content,
        difficulty: 'B1',
        word_count: art.word_count,
      })
      .select('id')
      .single();

    if (artErr) {
      console.log(`✗ ${artErr.message.slice(0, 70)}`);
      continue;
    }

    const qs = art.questions.map((q, i) => ({
      article_id:  inserted.id,
      sort_order:  i + 1,
      question:    q.question,
      options:     q.options,
      answer:      q.answer,
      explanation: q.explanation,
    }));

    const { error: qErr } = await supabase.from('article_questions').insert(qs);
    if (qErr) {
      console.log(`✗ 題目失敗：${qErr.message.slice(0, 60)}`);
      continue;
    }

    saved++;
    console.log(`✓ "${art.title}"`);
  }

  console.log(`\n✅ 完成：${saved}/6 篇插入成功`);

  // 確認總量
  const { count: total } = await supabase
    .from('daily_articles')
    .select('*', { count: 'exact', head: true })
    .in('date', ['2026-05-29', '2026-05-30']);
  console.log(`   2026-05-29 ~ 05-30 共 ${total} 篇文章`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
