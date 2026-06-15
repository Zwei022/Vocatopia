/**
 * 將所有題目的詳解（explanation）更新為繁體中文
 * 題目和選項維持英文
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const supabase = require('../db/supabase');

const UPDATES = [
  // ── 2026-05-28 slot1: The Buzz About Bees ──────────────────────
  { article_id: '8786347f-7ec6-46c1-82a6-c6644d629435', sort_order: 1, explanation: '文章第一段明確指出蜜蜂「最重要的工作」是授粉，而非製造蜂蜜。蜜蜂飛行時將花粉從一朵花帶往另一朵，協助植物繁殖，是不可或缺的生態功能。' },
  { article_id: '8786347f-7ec6-46c1-82a6-c6644d629435', sort_order: 2, explanation: '文章說明蘋果、莓果、杏仁等食物都依賴蜜蜂授粉，若蜜蜂消失，這些植物便無法繁殖，人類的食物來源將大幅減少，因此選項B正確。' },
  { article_id: '8786347f-7ec6-46c1-82a6-c6644d629435', sort_order: 3, explanation: '「vital」意為「極為重要、不可或缺的」。文中「a vital process」形容授粉是植物生存絕對必要的過程，與「非常重要且必要的」最為吻合。' },

  // ── 2026-05-28 slot2: Exploring Taiwan's Night Markets ─────────
  { article_id: '02e95795-a1aa-491d-941e-e9f1c7138b3a', sort_order: 1, explanation: '文章提到夜市有食物、遊戲、流行服飾和紀念品，但從未提及圖書館書籍或雜誌，因此選項D（Library books and magazines）是文章中未出現的項目。' },
  { article_id: '02e95795-a1aa-491d-941e-e9f1c7138b3a', sort_order: 2, explanation: '全文以正面語氣描述夜市的美食、熱鬧氣氛與社群凝聚力，目的在於吸引讀者親身體驗台灣夜市文化，因此主旨是鼓勵讀者前往。' },
  { article_id: '02e95795-a1aa-491d-941e-e9f1c7138b3a', sort_order: 3, explanation: '「dynamic」意為「充滿活力與變化的」。文章用此字描述夜市是社區生活的活躍中心，強調其生氣蓬勃的特質，而非安靜或傳統。' },

  // ── 2026-05-28 slot3: How the Internet Changed Our Lives ───────
  { article_id: '67f3cf3b-7bf3-43f0-9643-ad139d2c70bf', sort_order: 1, explanation: '文章第一段說明網路出現前人們必須「write letters to send messages」（寄信傳遞訊息）。電子郵件與視訊通話都是網路時代的產物，在網路發明前並不存在。' },
  { article_id: '67f3cf3b-7bf3-43f0-9643-ad139d2c70bf', sort_order: 2, explanation: '文章最後呼籲「to check whether the information we read online is true」（查證網路資訊是否為真），顯示作者認為使用網路時應謹慎驗證資訊的正確性。' },
  { article_id: '67f3cf3b-7bf3-43f0-9643-ad139d2c70bf', sort_order: 3, explanation: '「mislead」意為「誤導、使人產生錯誤的想法」。文章在討論假訊息的語境中使用此字，說明有人利用網路讓他人相信不實內容。' },

  // ── 2026-05-28 slot4: The Importance of Sports and Leisure ─────
  { article_id: 'a3b4c390-7c54-47cd-9a42-f9d448b12d37', sort_order: 1, explanation: '文章開頭強調運動與休閒對「everyone, especially for students」（每個人，尤其是學生）特別重要，因此學生是文章特別點名的受益群體。' },
  { article_id: 'a3b4c390-7c54-47cd-9a42-f9d448b12d37', sort_order: 2, explanation: '文章全篇圍繞運動與休閒對身心健康的正面影響展開，中心訊息是規律的身體活動對每個人的整體健康都有益，而非僅限於學業或特定族群。' },
  { article_id: 'a3b4c390-7c54-47cd-9a42-f9d448b12d37', sort_order: 3, explanation: '「crucial」意為「極其重要、關鍵性的」。文章使用此字強調運動與休閒不只是有益，而是維持良好健康不可缺少的要素，程度遠強於「有趣」或「簡單」。' },

  // ── 2026-05-28 slot5: A Taste of Taiwanese Culture ─────────────
  { article_id: '6bbc7658-f47f-4aca-83b3-d7c8849f6d42', sort_order: 1, explanation: '文章形容台灣文化是「a vibrant blend of traditions and modern influences」（傳統與現代影響的活躍融合），點出其結合新舊元素的獨特性。' },
  { article_id: '6bbc7658-f47f-4aca-83b3-d7c8849f6d42', sort_order: 2, explanation: '文章涵蓋台灣的飲食、傳統與現代生活，以正面筆調呈現多元文化面貌，讓讀者感受到台灣文化豐富、多樣，對各類訪客都有所提供。' },
  { article_id: '6bbc7658-f47f-4aca-83b3-d7c8849f6d42', sort_order: 3, explanation: '「vibrant」意為「充滿生命力、色彩鮮明且活力十足的」。文章以此字描述台灣文化，強調其鮮活與多元，而非沉靜或單調。' },

  // ── 2026-05-29 slot1: The Charm of Taiwanese Night Markets ──────
  { article_id: '07de3805-5328-4033-867d-a4abbf1975a6', sort_order: 1, explanation: '文章提到臭豆腐是「a unique taste of Taiwan」（台灣獨特的滋味），將其標榜為最能代表台灣特色的食物體驗，因此選項D正確。' },
  { article_id: '07de3805-5328-4033-867d-a4abbf1975a6', sort_order: 2, explanation: '文章描述夜市結合美食、遊戲、服飾及熱鬧社交氣氛，多元體驗共同構成令人難忘的夜晚，作者以「infectious」（感染力強）形容現場氛圍。' },
  { article_id: '07de3805-5328-4033-867d-a4abbf1975a6', sort_order: 3, explanation: '「bustling」意為「熙來攘往、非常熱鬧繁忙的」。文章用此字描述夜市街道變身為充滿攤位與人潮的活躍場所，強調其生氣勃勃的樣貌。' },

  // ── 2026-05-29 slot2: The Rise of Smart Homes ──────────────────
  { article_id: '62075a63-d9ac-4666-9219-69310d80be07', sort_order: 1, explanation: '文章明確指出「smart doorbells can show you who is at your door, even when you\'re not home, and allow you to communicate with them」，即智慧門鈴可顯示來訪者並讓屋主遠端對話。' },
  { article_id: '62075a63-d9ac-4666-9219-69310d80be07', sort_order: 2, explanation: '雖然文章提到初期設定可能複雜，但整體語氣正面，強調智慧家庭在便利性、安全性與節能方面的長期效益，並稱其為「compelling option」（引人注目的選擇）。' },
  { article_id: '62075a63-d9ac-4666-9219-69310d80be07', sort_order: 3, explanation: '「optimize」意為「使某事達到最佳效果或效率」。文中智慧恆溫器「optimize energy usage」，即以最有效的方式管理能源使用，與「使某事盡可能運作良好」吻合。' },

  // ── 2026-05-29 slot3: Staying Fit and Healthy ──────────────────
  { article_id: 'f5b82912-5eae-458e-a7a3-62877763aa3a', sort_order: 1, explanation: '文章說明運動時「our bodies release endorphins, which are natural mood lifters」（身體釋放內啡肽，是天然的情緒提升物質），清楚說明內啡肽的功能是改善心情。' },
  { article_id: 'f5b82912-5eae-458e-a7a3-62877763aa3a', sort_order: 2, explanation: '文章鼓勵讀者「find activities that you enjoy」（找到自己喜歡的活動），並列舉散步、騎車、游泳、跳舞等多種選擇，說明任何喜歡的身體活動都算運動。' },
  { article_id: 'f5b82912-5eae-458e-a7a3-62877763aa3a', sort_order: 3, explanation: '「incorporate」意為「將某事納入或融入現有的日常生活中」。文中指不需大幅改變生活就能把運動加入每天的行程，強調融入而非取代原有習慣。' },

  // ── 2026-05-29 slot4: Protecting Our Natural World ─────────────
  { article_id: 'c409fb9a-03a0-4a9f-97b2-e98fc1a3652d', sort_order: 1, explanation: '文章第二段明確提到「Taking shorter showers and fixing broken pipes can save a large amount of water every day」，直接將這兩個行為與節水效果連結，選項C正確。' },
  { article_id: 'c409fb9a-03a0-4a9f-97b2-e98fc1a3652d', sort_order: 2, explanation: '全文從減少廢棄物、節約用水到回收習慣，均圍繞「保護環境」這一主題展開，並呼籲讀者每天做出更好的選擇，目的是鼓勵環保行動。' },
  { article_id: 'c409fb9a-03a0-4a9f-97b2-e98fc1a3652d', sort_order: 3, explanation: '「produce」在此作動詞，意為「產生、製造」。「produce less garbage」即「產生較少垃圾」，與「創造或產生某物」的意思最為吻合，選項C正確。' },

  // ── 2026-05-29 slot5: The Wonderful World of Ocean Animals ──────
  { article_id: '008cff53-2ec2-4fb6-b98b-c65993de97e6', sort_order: 1, explanation: '文章第二段清楚說明「Pollution and rising ocean temperatures have seriously damaged many reefs in recent years」，指出汙染與海洋升溫是珊瑚礁受損的主要原因。' },
  { article_id: '008cff53-2ec2-4fb6-b98b-c65993de97e6', sort_order: 2, explanation: '文章列出個人可採取的具體行動：避免購買瀕危動物製品、減少塑膠垃圾、支持保育組織，顯示作者相信個人行動對保護海洋確實有效。' },
  { article_id: '008cff53-2ec2-4fb6-b98b-c65993de97e6', sort_order: 3, explanation: '「shelter」意為「庇護所、安全的居住場所」。文章說珊瑚礁為數千種生物提供「food and shelter」，shelter與food並列，指動物賴以生存的安全棲身之所。' },

  // ── 2026-05-30 slot1: The Joy of Making Dumplings ──────────────
  { article_id: '0e4911aa-46ad-4dee-b878-66600e594873', sort_order: 1, explanation: '文章直接列出常見餃子餡料：「ground pork, shrimp, chives, and cabbage, seasoned with soy sauce, ginger, and sesame oil」，與選項C完全吻合。' },
  { article_id: '0e4911aa-46ad-4dee-b878-66600e594873', sort_order: 2, explanation: '文章形容包餃子是「a family affair」（家庭活動）、「about connection and tradition」（關於連結與傳統），說明這不只是烹飪，更是一種凝聚情感與傳承文化的過程。' },
  { article_id: '0e4911aa-46ad-4dee-b878-66600e594873', sort_order: 3, explanation: '「symbolizing」意為「象徵、代表某種意義」。文章說分享餃子象徵「warmth and togetherness」（溫暖與團結），表示餃子超越食物本身，承載更深層的文化意涵。' },

  // ── 2026-05-30 slot2: The Joy of Traveling to New Places ────────
  { article_id: '02b4070c-9c65-4dad-afc0-54f15d66ded0', sort_order: 1, explanation: '文章第二段開頭說明「Before taking a trip, it is important to plan carefully」，並建議研究目的地的天氣、交通與習俗，強調出發前仔細規劃的重要性。' },
  { article_id: '02b4070c-9c65-4dad-afc0-54f15d66ded0', sort_order: 2, explanation: '最後一段提供多種省錢旅遊建議，最後以「every trip teaches you something new」作結，傳達旅行不需花大錢、任何人都能享受的核心訊息，選項C正確。' },
  { article_id: '02b4070c-9c65-4dad-afc0-54f15d66ded0', sort_order: 3, explanation: '「opens your mind」是英文慣用語，意為「拓展眼界、以新的方式思考與看待事物」。旅行讓人接觸不同文化與生活方式，因此能幫助人們從新角度理解世界。' },

  // ── 2026-05-30 slot3: How Music Affects Our Daily Life ──────────
  { article_id: 'a84b0d2e-6ec0-4cc4-9bd9-013f927e8a82', sort_order: 1, explanation: '文章第二段指出「slow and quiet music can help people feel calm and reduce stress」，直接說明緩慢輕柔的音樂能讓人平靜並減輕壓力，選項C正確。' },
  { article_id: 'a84b0d2e-6ec0-4cc4-9bd9-013f927e8a82', sort_order: 2, explanation: '文章最後一段提到學樂器的好處包括：提升學業成績、訓練大腦、培養耐心，並成為帶來喜悅的嗜好，顯示學樂器能在音樂以外的多個生活層面帶來益處。' },
  { article_id: 'a84b0d2e-6ec0-4cc4-9bd9-013f927e8a82', sort_order: 3, explanation: '「logical」意為「合乎邏輯的、基於清晰推理的」。文中與「creative」（創意的）對比使用，描述大腦的兩種思維模式：感性的創意思考與理性的邏輯推演。' },

  // ── 2026-05-30 slot4: The Importance of Family and Friends ──────
  { article_id: '8fcb69df-a8ca-48b9-99fc-7e9f5c91a622', sort_order: 1, explanation: '文章第二段說明「A true friend will tell you the truth even when it is hard to hear, because they care about your well-being」，強調真正的朋友即使說出難聽的真話，也是出於真心關懷。' },
  { article_id: '8fcb69df-a8ca-48b9-99fc-7e9f5c91a622', sort_order: 2, explanation: '第二段強調好友誼需要誠實、在順逆境中相互支持，且「to have good friends, you need to be a good friend yourself」，核心概念是友誼需要雙方共同的誠實與付出。' },
  { article_id: '8fcb69df-a8ca-48b9-99fc-7e9f5c91a622', sort_order: 3, explanation: '「bonds」意為「人與人之間緊密的情感連結或紐帶」。「Build strong family bonds」指建立持久且深厚的家庭關係，而非指具體的物品或技能。' },

  // ── 2026-05-30 slot5: Planning Your Future Career ───────────────
  { article_id: '5895ce80-82fa-4eb2-bf1a-ef64ce60c891', sort_order: 1, explanation: '文章第三段推薦「Joining school clubs, volunteering in your community, and speaking with adults about their jobs」作為探索職涯的有效方法，與選項C的描述直接對應。' },
  { article_id: '5895ce80-82fa-4eb2-bf1a-ef64ce60c891', sort_order: 2, explanation: '文章明確表示「it is perfectly fine to change your mind as you grow and learn more about yourself」，說明隨著成長而改變職涯想法是完全正常且可接受的，選項C正確。' },
  { article_id: '5895ce80-82fa-4eb2-bf1a-ef64ce60c891', sort_order: 3, explanation: '此處「direction」用作隱喻，意指一個人在職涯與人生中所走的「道路或方向」。文章以此強調職涯選擇具有長遠影響，是需要深思的人生方向，而非單一工作任務。' },
];

async function main() {
  console.log(`=== 更新 ${UPDATES.length} 則詳解為繁體中文 ===\n`);
  let ok = 0;

  for (const u of UPDATES) {
    const { error } = await supabase
      .from('article_questions')
      .update({ explanation: u.explanation })
      .eq('article_id', u.article_id)
      .eq('sort_order', u.sort_order);

    if (error) {
      console.log(`✗ ${u.article_id.slice(0,8)} Q${u.sort_order}: ${error.message}`);
    } else {
      ok++;
      process.stdout.write('✓ ');
    }
  }

  console.log(`\n\n✅ 完成：${ok}/${UPDATES.length} 則詳解已更新為繁體中文`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
