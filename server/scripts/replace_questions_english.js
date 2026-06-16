/**
 * 將所有文章的題目和選項全部換成英文版
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const supabase = require('../db/supabase');

const ALL_QUESTIONS = [
  // ── 2026-05-28 ──────────────────────────────────────────────────
  {
    article_id: '8786347f-7ec6-46c1-82a6-c6644d629435', // The Buzz About Bees
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what is the most important job of bees?',
        options: ['Making honey for humans to eat', 'Carrying pollen from flower to flower', 'Providing food for birds and animals', 'Building nests in natural habitats'],
        answer: 1,
        explanation: 'The article states that bees\' most important job is pollination — carrying pollen as they fly from flower to flower, which allows plants to produce fruits, vegetables, and seeds.',
      },
      {
        sort_order: 2,
        question: 'What would most likely happen if all bees disappeared from the Earth?',
        options: ['People would stop eating sweet foods', 'Many fruits and vegetables would no longer grow', 'Farmers would use fewer pesticides than before', 'Climate change would slow down immediately'],
        answer: 1,
        explanation: 'The article explains that foods like apples, berries, and almonds depend on bees for pollination. Without bees, these plants could not reproduce, causing many foods to disappear.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the word "vital" is closest in meaning to ______.',
        options: ['simple and easy', 'very important and necessary', 'slow and careful', 'beautiful and colorful'],
        answer: 1,
        explanation: '"Vital" means extremely important or necessary. In the article, "a vital process" describes pollination as an essential process that plants cannot survive without.',
      },
    ],
  },
  {
    article_id: '02e95795-a1aa-491d-941e-e9f1c7138b3a', // Exploring Taiwan's Night Markets
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, which of the following can visitors NOT find at a night market?',
        options: ['Local snacks and dishes', 'Trendy clothes and souvenirs', 'Fun games at stalls', 'Library books and magazines'],
        answer: 3,
        explanation: 'The article mentions food, games, trendy clothes, and souvenirs as things found at night markets, but never mentions library books or magazines.',
      },
      {
        sort_order: 2,
        question: 'What is the author\'s main purpose in writing this article?',
        options: ['To compare night markets in different countries', 'To encourage readers to experience Taiwan\'s night markets', 'To explain how night market vendors earn money', 'To warn readers about the dangers of street food'],
        answer: 1,
        explanation: 'Throughout the article, the author describes the exciting atmosphere, delicious food, and community spirit of night markets in positive terms, clearly aiming to attract readers to visit.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the word "dynamic" is closest in meaning to ______.',
        options: ['dangerous and crowded', 'quiet and peaceful', 'full of energy and activity', 'traditional and old-fashioned'],
        answer: 2,
        explanation: '"Dynamic" describes something full of energy, movement, and activity. The article uses it to show that night markets are lively, exciting places — not quiet or boring.',
      },
    ],
  },
  {
    article_id: '67f3cf3b-7bf3-43f0-9643-ad139d2c70bf', // How the Internet Changed Our Lives
    questions: [
      {
        sort_order: 1,
        question: 'Before the Internet existed, how did people send messages to each other?',
        options: ['Through email', 'Through social media platforms', 'By writing and sending letters', 'By making video calls'],
        answer: 2,
        explanation: 'The article states that before the Internet, people had to "write letters to send messages." Email and video calls are Internet-based technologies that did not exist before the Internet.',
      },
      {
        sort_order: 2,
        question: 'What does the author believe people should do when using the Internet?',
        options: ['Avoid using it as much as possible', 'Only use it for communication with friends', 'Verify whether information found online is true', 'Stop using all social media platforms immediately'],
        answer: 2,
        explanation: 'The article warns that the Internet can be used to spread false information, and advises readers "to check whether the information we read online is true," which means verifying its accuracy.',
      },
      {
        sort_order: 3,
        question: 'In the last paragraph, the word "mislead" is closest in meaning to ______.',
        options: ['to help people make correct decisions', 'to cause people to believe something false', 'to encourage others to check their facts', 'to share helpful and accurate knowledge'],
        answer: 1,
        explanation: '"Mislead" means to cause someone to believe something that is not true. In the article, it is used in the context of people spreading false information that can trick or confuse others.',
      },
    ],
  },
  {
    article_id: 'a3b4c390-7c54-47cd-9a42-f9d448b12d37', // The Importance of Sports and Leisure
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, who especially benefits from sports and leisure activities?',
        options: ['Professional athletes training for competitions', 'Senior citizens looking to stay active', 'Students of all ages', 'People who work in outdoor jobs'],
        answer: 2,
        explanation: 'The article states that engaging in sports and leisure activities is "especially for students," highlighting that young people particularly benefit from such activities.',
      },
      {
        sort_order: 2,
        question: 'What is the main message of this article?',
        options: ['Sports should only be practiced during school hours', 'Leisure activities are more valuable than academic study', 'Regular physical activity benefits everyone\'s overall well-being', 'Playing sports automatically improves academic grades'],
        answer: 2,
        explanation: 'The article consistently emphasizes the positive effects of sports and leisure on health, happiness, and overall well-being, making this its central message.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the word "crucial" is closest in meaning to ______.',
        options: ['harmful and potentially dangerous', 'extremely important', 'enjoyable and entertaining', 'simple and effortless'],
        answer: 1,
        explanation: '"Crucial" means extremely important or essential. The article uses it to emphasize that engaging in physical activities is not just helpful, but absolutely necessary for good health.',
      },
    ],
  },
  {
    article_id: '6bbc7658-f47f-4aca-83b3-d7c8849f6d42', // A Taste of Taiwanese Culture
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what makes Taiwanese culture unique?',
        options: ['It follows only ancient traditions from the past', 'It is a blend of traditional and modern influences', 'It is exactly the same as Chinese culture', 'It is mainly focused on food and nothing else'],
        answer: 1,
        explanation: 'The article describes Taiwanese culture as "a vibrant blend of traditions and modern influences," meaning it combines old and new elements in a unique way.',
      },
      {
        sort_order: 2,
        question: 'What can readers most likely conclude about Taiwan after reading this article?',
        options: ['Taiwan is difficult for foreign visitors to understand', 'Taiwan has a rich culture that offers something for everyone', 'Taiwan is mainly known for its business and technology', 'Taiwanese traditions are slowly disappearing due to modernization'],
        answer: 1,
        explanation: 'The article presents Taiwan\'s culture positively and broadly — food, traditions, modern life — suggesting it is rich and diverse, with something to offer all kinds of visitors.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the word "vibrant" is closest in meaning to ______.',
        options: ['calm and very relaxing', 'old and deeply historical', 'full of color, energy, and life', 'plain and straightforward'],
        answer: 2,
        explanation: '"Vibrant" describes something that is lively, colorful, and full of energy. The article uses it to show that Taiwanese culture is exciting and full of life, not dull or faded.',
      },
    ],
  },

  // ── 2026-05-29 ──────────────────────────────────────────────────
  {
    article_id: '07de3805-5328-4033-867d-a4abbf1975a6', // The Charm of Taiwanese Night Markets
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, which food is described as a "unique taste of Taiwan"?',
        options: ['Bubble tea', 'Oyster omelet', 'Shaved ice', 'Stinky tofu'],
        answer: 3,
        explanation: 'The article describes stinky tofu as "a unique taste of Taiwan," suggesting it is a distinctly Taiwanese food experience not easily found elsewhere.',
      },
      {
        sort_order: 2,
        question: 'Why does the author call visiting a night market "an unforgettable experience"?',
        options: ['Because the food there is always extremely spicy', 'Because everything sold is sold at very low prices', 'Because the lively atmosphere and variety of activities make it special', 'Because night markets are only open for a short time each year'],
        answer: 2,
        explanation: 'The article describes a mix of delicious food, arcade games, clothes, and a lively social atmosphere — all contributing to an experience that is hard to forget.',
      },
      {
        sort_order: 3,
        question: 'In the article, the word "bustling" is closest in meaning to ______.',
        options: ['dark and completely silent', 'very busy and full of activity', 'neatly organized and clean', 'empty and deserted'],
        answer: 1,
        explanation: '"Bustling" means full of energetic activity and movement. The article uses it to describe night markets as lively, busy places where many people gather and things are always happening.',
      },
    ],
  },
  {
    article_id: '62075a63-d9ac-4666-9219-69310d80be07', // The Rise of Smart Homes
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what can a smart doorbell do?',
        options: ['Automatically lock all the doors in the house', 'Turn off lights when no one is at home', 'Show who is at the door and let you talk to them', 'Send daily news updates to your smartphone'],
        answer: 2,
        explanation: 'The article states that "smart doorbells can show you who is at your door, even when you\'re not home, and allow you to communicate with them," which matches option C.',
      },
      {
        sort_order: 2,
        question: 'What is the author\'s overall attitude toward smart home technology?',
        options: ['Strongly against it because the setup is too complex', 'Mostly positive, believing the benefits outweigh the challenges', 'Worried that it will cause many people to lose their jobs', 'Unsure whether it will ever become widely popular'],
        answer: 1,
        explanation: 'While the author mentions that setup can seem complex, the overall tone is positive — emphasizing convenience, security, energy savings, and calling smart homes "a compelling option for modern living."',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the word "optimize" is closest in meaning to ______.',
        options: ['to make something work as well as possible', 'to turn something on and off repeatedly', 'to connect two devices together remotely', 'to watch or monitor someone\'s activities'],
        answer: 0,
        explanation: '"Optimize" means to make something as effective or efficient as possible. In the article, smart thermostats "optimize energy usage," meaning they manage energy in the best possible way.',
      },
    ],
  },
  {
    article_id: 'f5b82912-5eae-458e-a7a3-62877763aa3a', // Staying Fit and Healthy
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what do endorphins do for the body?',
        options: ['They build stronger muscles and bones', 'They help the body digest food more easily', 'They improve blood flow and circulation', 'They naturally lift a person\'s mood'],
        answer: 3,
        explanation: 'The article explains that during exercise, "our bodies release endorphins, which are natural mood lifters," clearly stating that endorphins improve how we feel emotionally.',
      },
      {
        sort_order: 2,
        question: 'What does the author suggest about how people should exercise?',
        options: ['Exercise must be done at a gym to be truly effective', 'The best exercises are always competitive team sports', 'Any enjoyable physical activity can count as good exercise', 'Everyone must exercise for at least one full hour every day'],
        answer: 2,
        explanation: 'The article says "find activities that you enjoy" and lists walking, cycling, swimming, and dancing as examples, suggesting that any form of enjoyable movement counts.',
      },
      {
        sort_order: 3,
        question: 'In the second paragraph, the word "incorporate" is closest in meaning to ______.',
        options: ['to remove something from a daily routine', 'to include or add something into daily life', 'to practice something completely alone', 'to make something more challenging or difficult'],
        answer: 1,
        explanation: '"Incorporate" means to include or integrate something into an existing routine. Here, it means adding exercise into everyday life without necessarily changing your whole schedule.',
      },
    ],
  },
  {
    article_id: 'c409fb9a-03a0-4a9f-97b2-e98fc1a3652d', // Protecting Our Natural World
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, which action can help save water?',
        options: ['Using fewer plastic bags when shopping', 'Setting up school recycling programs', 'Taking shorter showers and fixing broken pipes', 'Turning off electrical appliances when not in use'],
        answer: 2,
        explanation: 'The article specifically states that "Taking shorter showers and fixing broken pipes can save a large amount of water every day," directly connecting these actions to water conservation.',
      },
      {
        sort_order: 2,
        question: 'What is the main purpose of this article?',
        options: ['To explain in detail how recycling programs are set up', 'To encourage people to protect the natural environment', 'To show how much water people use around the world', 'To warn people about the risks of using too much electricity'],
        answer: 1,
        explanation: 'The article covers waste reduction, water saving, and recycling — all pointing toward environmental protection as its central theme and calling on readers to take action.',
      },
      {
        sort_order: 3,
        question: 'In the last paragraph, the word "produce" is closest in meaning to ______.',
        options: ['to buy or purchase goods', 'to collect and store materials', 'to create or generate something', 'to save or reduce an amount'],
        answer: 2,
        explanation: '"Produce less garbage" means to create or generate less waste. In this context, "produce" is used as a verb meaning to make or generate, not related to buying or saving.',
      },
    ],
  },
  {
    article_id: '008cff53-2ec2-4fb6-b98b-c65993de97e6', // The Wonderful World of Ocean Animals
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what has damaged coral reefs in recent years?',
        options: ['Too many animals living inside them', 'Overfishing by commercial fishing boats', 'Pollution and rising ocean temperatures', 'Scientists conducting too many research studies'],
        answer: 2,
        explanation: 'The article clearly states that "Pollution and rising ocean temperatures have seriously damaged many reefs in recent years," making option C the correct answer.',
      },
      {
        sort_order: 2,
        question: 'What does the author believe about human responsibility for the ocean?',
        options: ['There is nothing individuals can do to make a difference', 'Only governments have the power to protect ocean animals', 'Individual actions and choices can help protect ocean life', 'Ocean animals are strong enough to survive any environment changes'],
        answer: 2,
        explanation: 'The article lists specific actions readers can take — avoiding products from endangered animals, reducing plastic, and supporting conservation groups — showing that individuals can help.',
      },
      {
        sort_order: 3,
        question: 'In the second paragraph, the word "shelter" is closest in meaning to ______.',
        options: ['food or nutrition for animals', 'a safe place to live and hide', 'a type of underwater plant', 'the temperature of surrounding water'],
        answer: 1,
        explanation: '"Shelter" means a place that provides protection and safety. The article uses it alongside "food" to describe two basic things coral reefs provide for sea creatures.',
      },
    ],
  },

  // ── 2026-05-30 ──────────────────────────────────────────────────
  {
    article_id: '0e4911aa-46ad-4dee-b878-66600e594873', // The Joy of Making Dumplings
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what are common ingredients used in dumpling filling?',
        options: ['Beef, carrots, and mushrooms', 'Chicken, potatoes, and cheese', 'Ground pork, shrimp, chives, and cabbage', 'Tofu, spinach, and corn'],
        answer: 2,
        explanation: 'The article directly states that "Common fillings include ground pork, shrimp, chives, and cabbage, seasoned with soy sauce, ginger, and sesame oil."',
      },
      {
        sort_order: 2,
        question: 'Why does the author say making dumplings is "not just about cooking"?',
        options: ['Because dumplings are too complicated for beginners to make', 'Because it brings people together and keeps cultural traditions alive', 'Because dumplings must always be prepared in very large quantities', 'Because the recipe needs many rare and expensive ingredients'],
        answer: 1,
        explanation: 'The article describes making dumplings as "a family affair" and "about connection and tradition," showing that it is a social and cultural experience, not just a cooking task.',
      },
      {
        sort_order: 3,
        question: 'In the last paragraph, the word "symbolizing" is closest in meaning to ______.',
        options: ['cooking or carefully preparing food', 'sharing a meal with other people', 'representing or standing for something', 'folding and shaping dough skillfully'],
        answer: 2,
        explanation: '"Symbolizing" means representing or standing for something beyond its literal meaning. The article says sharing dumplings symbolizes "warmth and togetherness" — not just food, but unity.',
      },
    ],
  },
  {
    article_id: '02b4070c-9c65-4dad-afc0-54f15d66ded0', // The Joy of Traveling to New Places
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what should travelers do before taking a trip?',
        options: ['Learn to speak the local language fluently', 'Find a travel partner to join them', 'Research the destination and plan carefully', 'Buy expensive cameras and photography equipment'],
        answer: 2,
        explanation: 'The article states "Before taking a trip, it is important to plan carefully" and advises researching weather, transportation, and local customs in advance.',
      },
      {
        sort_order: 2,
        question: 'What is the main message of the last paragraph?',
        options: ['Traveling is always very expensive for most people', 'Budget hotels are usually uncomfortable and unsafe', 'Anyone can enjoy traveling even without spending a lot of money', 'Public transportation is the most exciting way to travel'],
        answer: 2,
        explanation: 'The last paragraph focuses on budget travel tips — affordable hotels, public transport — and ends with "every trip teaches you something new," suggesting travel is for everyone regardless of budget.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, the phrase "opens your mind" is closest in meaning to ______.',
        options: ['makes you feel tired and uncertain', 'helps you think in new and broader ways', 'requires spending a large amount of money', 'teaches you how to cook different foods'],
        answer: 1,
        explanation: '"Opens your mind" is an idiom meaning to expand your thinking and see things from new perspectives. Travel does this by exposing you to different cultures and ways of life.',
      },
    ],
  },
  {
    article_id: 'a84b0d2e-6ec0-4cc4-9bd9-013f927e8a82', // How Music Affects Our Daily Life
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what effect does slow, quiet music have on listeners?',
        options: ['It makes people feel more energetic and active', 'It helps students focus specifically on mathematics', 'It can help people feel calm and less stressed', 'It makes it easier to memorize and recall information'],
        answer: 2,
        explanation: 'The article states that "slow and quiet music can help people feel calm and reduce stress," linking this type of music directly to relaxation and reduced anxiety.',
      },
      {
        sort_order: 2,
        question: 'What does the author believe about learning a musical instrument?',
        options: ['It is only truly useful for people aiming to become musicians', 'It is too difficult and time-consuming for most children', 'It can benefit people in many areas beyond just playing music', 'It has no real connection to how students perform academically'],
        answer: 2,
        explanation: 'The article mentions benefits including better school performance, brain training, patience, and joy as a hobby — showing instruments benefit people in many life areas, not just music.',
      },
      {
        sort_order: 3,
        question: 'In the last paragraph, the word "logical" is closest in meaning to ______.',
        options: ['creative and highly imaginative', 'based on clear thinking and sound reasoning', 'slow and very challenging', 'directly related to music and performance'],
        answer: 1,
        explanation: '"Logical" means following clear, step-by-step thinking and reasoning. The article contrasts it with "creative," showing that learning music develops both imaginative and rational thinking skills.',
      },
    ],
  },
  {
    article_id: '8fcb69df-a8ca-48b9-99fc-7e9f5c91a622', // The Importance of Family and Friends
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, what does a true friend do?',
        options: ['Always agree with everything you say and do', 'Give expensive gifts when you are feeling sad', 'Help you become more popular among classmates', 'Tell you the truth even when it is difficult to hear'],
        answer: 3,
        explanation: 'The article states that "A true friend will tell you the truth even when it is hard to hear, because they care about your well-being," making honesty the key quality of true friendship.',
      },
      {
        sort_order: 2,
        question: 'What is the main idea of the second paragraph?',
        options: ['Building friendships is simply too difficult for most people', 'Good friendships require honesty and effort from both people', 'Family relationships are always more important than friendships', 'True friends should never have disagreements with each other'],
        answer: 1,
        explanation: 'The second paragraph emphasizes that real friends are honest, support each other, and that "to have good friends, you need to be a good friend yourself" — all pointing to mutual effort.',
      },
      {
        sort_order: 3,
        question: 'In the last paragraph, the word "bonds" is closest in meaning to ______.',
        options: ['problems and disagreements that arise between people', 'meals and activities that family members share', 'strong connections and ties between people', 'communication skills that people work to develop'],
        answer: 2,
        explanation: '"Bonds" refers to deep emotional connections or ties between people. "Build strong family bonds" means creating lasting, meaningful relationships within the family.',
      },
    ],
  },
  {
    article_id: '5895ce80-82fa-4eb2-bf1a-ef64ce60c891', // Planning Your Future Career
    questions: [
      {
        sort_order: 1,
        question: 'According to the article, which activity is suggested as a good way to explore possible careers?',
        options: ['Choosing the career option with the highest salary', 'Studying only your favorite subjects at school', 'Joining school clubs and doing volunteer work', 'Reading biographies of famous scientists and inventors'],
        answer: 2,
        explanation: 'The article recommends "Joining school clubs, volunteering in your community, and speaking with adults about their jobs" as effective ways to explore different career possibilities.',
      },
      {
        sort_order: 2,
        question: 'What does the author think about changing your mind about a career choice?',
        options: ['It is always a clear sign of failure and poor judgment', 'It should never happen once a person has made a decision', 'It is natural and completely acceptable as a person grows', 'It will always lead to unhappiness and confusion'],
        answer: 2,
        explanation: 'The article says "it is perfectly fine to change your mind as you grow and learn more about yourself," showing the author views this as a normal, healthy part of personal development.',
      },
      {
        sort_order: 3,
        question: 'In the first paragraph, "direction" in "a direction that you will follow" is closest in meaning to ______.',
        options: ['a physical road or walking path in a park', 'the route or course a person takes through life', 'a specific type of task or assignment', 'a personal goal or ambition to achieve'],
        answer: 1,
        explanation: 'Here "direction" is used as a metaphor for the overall path or course of one\'s working life. Calling a career "a direction" emphasizes it is a long-term life journey, not just a single job.',
      },
    ],
  },
];

async function main() {
  console.log('=== 替換所有題目為英文版 ===\n');

  const articleIds = ALL_QUESTIONS.map(a => a.article_id);

  // 1. 刪除所有現有題目
  console.log(`[1/2] 刪除 ${articleIds.length} 篇文章的現有題目...`);
  const { error: delErr } = await supabase
    .from('article_questions')
    .delete()
    .in('article_id', articleIds);
  if (delErr) { console.error('刪除失敗：', delErr.message); process.exit(1); }
  console.log('      刪除完成\n');

  // 2. 插入英文題目
  console.log('[2/2] 插入英文題目...');
  let saved = 0;

  for (const { article_id, questions } of ALL_QUESTIONS) {
    const rows = questions.map(q => ({ ...q, article_id }));
    const { error } = await supabase.from('article_questions').insert(rows);
    if (error) {
      console.log(`  ✗ ${article_id.slice(0, 8)}… 失敗：${error.message}`);
    } else {
      saved++;
      process.stdout.write('  ✓ ');
    }
  }

  console.log(`\n\n✅ 完成：${saved}/${ALL_QUESTIONS.length} 篇題目已更新為英文`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
