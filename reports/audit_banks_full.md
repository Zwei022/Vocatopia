# Vocatopia 題庫完整審查（六份 question bank）

產生日期：2026-08-07  
審查模式：唯讀；未修改任何題庫資料。

## 結論摘要

共檢查 **6 份檔案、1,189 筆頂層資料、1,632 個作答單元**。先執行 JSON/schema、必要欄位、answer 邊界、optionsZh 長度、重複 id 與異體字掃描，再逐檔切成 **20 批（每批最多 100 個作答單元）**，核對題幹或文章／dialogue、選項、中文選項、答案及詳解。

確認 **133 個高嚴重度答案錯誤**：目前工作版本的 answer 被改到錯誤選項；題意與詳解中的英文答案詞仍共同支持 Git 基準版本原有的選項。分布為 vocab_practice 76、phrase 49、reading 8。

結構檢查沒有發現 JSON 解析失敗、必要欄位缺漏、answer 越界、optionsZh 數量不符或檔內重複 id。掃描器亦未命中指定的簡體／日文漢字變體；但字形掃描只能排除字表內的已知字形，不能取代人工語意判讀。

## 各檔案統計

| 檔案 | 頂層資料 | 作答單元 | 結構錯誤 | 重複 id | 已知異體字命中 | 高嚴重度答案錯誤 |
|---|---:|---:|---:|---:|---:|---:|
| question_bank_vocab_practice.json | 312 | 312 | 0 | 0 | 0 | 76 |
| question_bank_grammar.json | 312 | 312 | 0 | 0 | 0 | 0 |
| question_bank_cloze.json | 81 | 341 | 0 | 0 | 0 | 0 |
| question_bank_reading.json | 92 | 275 | 0 | 0 | 0 | 8 |
| question_bank_phrase.json | 312 | 312 | 0 | 0 | 0 | 49 |
| question_bank_listening.json | 80 | 80 | 0 | 0 | 0 | 0 |

## 語意複核批次與覆蓋

每一批均核對：(1) answer 所指選項能否完成題意；(2) optionsZh 是否逐項對應；(3) explanation 是否支持答案且排除干擾項；(4) reading/cloze 是否有文章依據；(5) listening 是否有 dialogue 依據。

| 批次 | 檔案 | 作答單元範圍 | 覆蓋數 |
|---:|---|---:|---:|
| 1 | question_bank_vocab_practice.json | 1–100 | 100 |
| 2 | question_bank_vocab_practice.json | 101–200 | 100 |
| 3 | question_bank_vocab_practice.json | 201–300 | 100 |
| 4 | question_bank_vocab_practice.json | 301–312 | 12 |
| 5 | question_bank_grammar.json | 1–100 | 100 |
| 6 | question_bank_grammar.json | 101–200 | 100 |
| 7 | question_bank_grammar.json | 201–300 | 100 |
| 8 | question_bank_grammar.json | 301–312 | 12 |
| 9 | question_bank_cloze.json | 1–100 | 100 |
| 10 | question_bank_cloze.json | 101–200 | 100 |
| 11 | question_bank_cloze.json | 201–300 | 100 |
| 12 | question_bank_cloze.json | 301–341 | 41 |
| 13 | question_bank_reading.json | 1–100 | 100 |
| 14 | question_bank_reading.json | 101–200 | 100 |
| 15 | question_bank_reading.json | 201–275 | 75 |
| 16 | question_bank_phrase.json | 1–100 | 100 |
| 17 | question_bank_phrase.json | 101–200 | 100 |
| 18 | question_bank_phrase.json | 201–300 | 100 |
| 19 | question_bank_phrase.json | 301–312 | 12 |
| 20 | question_bank_listening.json | 1–80 | 80 |

## 結構性問題

未發現結構性錯誤。

## 逐項問題清單

### question_bank_vocab_practice.json

- **高｜答案錯誤｜vocab_5**
  - 題幹：Because the traffic was terrible, the bus _____ at the station twenty minutes later than usual.
  - 錯誤內容：目前 answer 指向「(A) escaped」。
  - 建議修正：answer 應指向「(B) arrived」。
  - 判定依據：arrive 指抵達。公車比平常晚到站，故選 arrived；depart 是出發，語意相反。
- **高｜答案錯誤｜vocab_17**
  - 題幹：When Amy didn't know a word, she looked it up in a _____.
  - 錯誤內容：目前 answer 指向「(D) calendar」。
  - 建議修正：answer 應指向「(C) dictionary」。
  - 判定依據：dictionary 指字典。查詢不懂的單字要用字典，故選 dictionary。
- **高｜答案錯誤｜vocab_23**
  - 題幹：Be careful! Don't _____ the glass cup while washing it.
  - 錯誤內容：目前 answer 指向「(B) clean」。
  - 建議修正：answer 應指向「(A) break」。
  - 判定依據：break 指打破。洗杯子時要小心避免打破，故選 break。
- **高｜答案錯誤｜vocab_24**
  - 題幹：Every morning, Ken puts his books and lunch box into his _____.
  - 錯誤內容：目前 answer 指向「(B) wallet」。
  - 建議修正：answer 應指向「(D) backpack」。
  - 判定依據：backpack 指背包。把書和便當放進背包準備上學，故選 backpack。
- **高｜答案錯誤｜vocab_25**
  - 題幹：The movie will _____ at seven o'clock, so let's hurry.
  - 錯誤內容：目前 answer 指向「(B) end」。
  - 建議修正：answer 應指向「(D) begin」。
  - 判定依據：begin 指開始。電影七點要開始了必須趕快，故選 begin；end 結束語意相反。
- **高｜答案錯誤｜vocab_29**
  - 題幹：The night market was so _____ that we could hardly move.
  - 錯誤內容：目前 answer 指向「(C) peaceful」。
  - 建議修正：answer 應指向「(B) crowded」。
  - 判定依據：crowded 指擁擠的。夜市人多到幾乎無法移動，故選 crowded；peaceful、silent 皆與擁擠情境相反。
- **高｜答案錯誤｜vocab_31**
  - 題幹：The cake Grandma made was so _____ that everyone asked for a second piece.
  - 錯誤內容：目前 answer 指向「(D) spicy」。
  - 建議修正：answer 應指向「(C) delicious」。
  - 判定依據：delicious 指美味的。大家都要求再吃一塊，暗示蛋糕非常好吃，故選 delicious。
- **高｜答案錯誤｜vocab_38**
  - 題幹：This sofa is so _____ that I always fall asleep on it.
  - 錯誤內容：目前 answer 指向「(C) heavy」。
  - 建議修正：answer 應指向「(B) comfortable」。
  - 判定依據：comfortable 指舒適的。坐在上面總是不小心睡著，暗示沙發很舒適，故選 comfortable。
- **高｜答案錯誤｜vocab_41**
  - 題幹：Jason likes to _____ stamps from different countries as his hobby.
  - 錯誤內容：目前 answer 指向「(C) sell」。
  - 建議修正：answer 應指向「(B) collect」。
  - 判定依據：collect 指收集。當作興趣收集各國郵票，故選 collect。
- **高｜答案錯誤｜vocab_42**
  - 題幹：Living near the MRT station is very _____ for people who work in the city.
  - 錯誤內容：目前 answer 指向「(C) noisy」。
  - 建議修正：answer 應指向「(B) convenient」。
  - 判定依據：convenient 指方便的。住在捷運站附近對上班族來說很方便，故選 convenient。
- **高｜答案錯誤｜vocab_46**
  - 題幹：Because her little sister was afraid of the dark, Amy decided to _____ her to the bathroom at night.
  - 錯誤內容：目前 answer 指向「(A) lead」。
  - 建議修正：answer 應指向「(C) accompany」。
  - 判定依據：accompany 指陪同。妹妹怕黑，所以決定晚上陪她去廁所，故選 accompany。
- **高｜答案錯誤｜vocab_47**
  - 題幹：Since the flight was delayed for hours, all the passengers waiting at the gate became increasingly _____.
  - 錯誤內容：目前 answer 指向「(A) curious」。
  - 建議修正：answer 應指向「(D) anxious」。
  - 判定依據：anxious 指焦慮的。班機延誤數小時使乘客越來越焦慮，故選 anxious。
- **高｜答案錯誤｜vocab_48**
  - 題幹：After training every day for a whole year, the young athlete finally managed to _____ her Olympic dream.
  - 錯誤內容：目前 answer 指向「(A) attempt」。
  - 建議修正：answer 應指向「(B) achieve」。
  - 判定依據：achieve 指達成。訓練一整年終於達成奧運夢想，故選 achieve。
- **高｜答案錯誤｜vocab_54**
  - 題幹：Because the road was under construction, drivers were told to _____ that area during rush hour.
  - 錯誤內容：目前 answer 指向「(A) repair」。
  - 建議修正：answer 應指向「(C) avoid」。
  - 判定依據：avoid 指避免。道路施工，駕駛被告知尖峰時間要避開該區域，故選 avoid。
- **高｜答案錯誤｜vocab_55**
  - 題幹：Even though it was her first speech contest, Mia looked very _____ standing on the stage.
  - 錯誤內容：目前 answer 指向「(C) ashamed」。
  - 建議修正：answer 應指向「(D) confident」。
  - 判定依據：confident 指有自信的。雖是第一次參加演講比賽，Mia 站上台看起來很有自信，故選 confident。
- **高｜答案錯誤｜vocab_60**
  - 題幹：Many students _____ their teacher because she always helps them patiently after class.
  - 錯誤內容：目前 answer 指向「(A) envy」。
  - 建議修正：answer 應指向「(C) admire」。
  - 判定依據：admire 指欽佩。老師總是耐心幫助學生，因此許多學生欽佩她，故選 admire。
- **高｜答案錯誤｜vocab_65**
  - 題幹：The manager was late again; _____, his car had broken down on the highway.
  - 錯誤內容：目前 answer 指向「(A) definitely」。
  - 建議修正：answer 應指向「(C) apparently」。
  - 判定依據：apparently 指據說、顯然。經理又遲到了，據說他的車在高速公路上拋錨，故選 apparently。
- **高｜答案錯誤｜vocab_67**
  - 題幹：The design team spent all week trying to _____ a new solution for the packaging problem.
  - 錯誤內容：目前 answer 指向「(C) come across」。
  - 建議修正：answer 應指向「(B) come up with」。
  - 判定依據：come up with 指想出。設計團隊整週都在設法想出包裝新方案，故選 come up with。
- **高｜答案錯誤｜vocab_71**
  - 題幹：Although the plan wasn't finalized, the manager said the event would _____ happen next month.
  - 錯誤內容：目前 answer 指向「(D) possibly」。
  - 建議修正：answer 應指向「(A) definitely」。
  - 判定依據：definitely 指確定地。雖然計畫尚未定案，經理仍表示活動下個月一定會舉行，故選 definitely。
- **高｜答案錯誤｜vocab_73**
  - 題幹：Before opening the new store, the company needed to _____ a detailed market survey.
  - 錯誤內容：目前 answer 指向「(C) carry over」。
  - 建議修正：answer 應指向「(D) carry out」。
  - 判定依據：carry out 指執行。開新店前公司需要先執行詳細的市場調查，故選 carry out。
- **高｜答案錯誤｜vocab_78**
  - 題幹：A _____ roommate always keeps the noise down when others are sleeping.
  - 錯誤內容：目前 answer 指向「(C) selfish」。
  - 建議修正：answer 應指向「(B) considerate」。
  - 判定依據：considerate 指體貼的。體貼的室友總會在別人睡覺時放低音量，故選 considerate。
- **高｜答案錯誤｜vocab_79**
  - 題幹：On the way to the airport, their car suddenly _____, so they had to call a taxi.
  - 錯誤內容：目前 answer 指向「(B) break out」。
  - 建議修正：answer 應指向「(A) break down」。
  - 判定依據：break down 指故障。前往機場途中車子突然故障，只好叫計程車，故選 break down。
- **高｜答案錯誤｜vocab_80**
  - 題幹：Because the storm warning had just been issued and the organizers worried about safety, they decided to _____ the outdoor concert.
  - 錯誤內容：目前 answer 指向「(C) call on」。
  - 建議修正：answer 應指向「(B) call off」。
  - 判定依據：call off 指取消。暴風警報剛發布，主辦單位擔心安全便決定取消戶外演唱會，故選 call off。
- **高｜答案錯誤｜vocab_82**
  - 題幹：Although the theory sounded strange to most scientists at the time, later experiments were able to _____ that it was actually correct.
  - 錯誤內容：目前 answer 指向「(D) imagine」。
  - 建議修正：answer 應指向「(C) demonstrate」。
  - 判定依據：demonstrate 指證明。理論當初聽起來很怪，但後來的實驗證明它是對的，故選 demonstrate。
- **高｜答案錯誤｜vocab_89**
  - 題幹：While cleaning out the old attic that her grandmother had left untouched for decades, she happened to _____ a collection of handwritten letters.
  - 錯誤內容：目前 answer 指向「(C) go along」。
  - 建議修正：answer 應指向「(D) come across」。
  - 判定依據：come across 指偶然發現。整理祖母多年未動的閣樓時，她偶然發現一疊手寫信件，故選 come across。
- **高｜答案錯誤｜vocab_91**
  - 題幹：Since the airline had canceled the flight without warning and many passengers missed important events, the company agreed to _____ them with vouchers.
  - 錯誤內容：目前 answer 指向「(C) complain」。
  - 建議修正：answer 應指向「(D) compensate」。
  - 判定依據：compensate 指補償。航空公司無預警取消班機導致乘客錯過重要行程，公司同意以票券補償，故選 compensate。
- **高｜答案錯誤｜vocab_99**
  - 題幹：Although it took her nearly two years after the divorce, she finally began to _____ the fact that her old life was truly over.
  - 錯誤內容：目前 answer 指向「(C) keep in touch with」。
  - 建議修正：answer 應指向「(B) come to terms with」。
  - 判定依據：come to terms with 指接受(難以接受的事實)。離婚近兩年後，她才終於開始接受舊生活真正結束的事實，故選 come to terms with。
- **高｜答案錯誤｜vocab_100**
  - 題幹：Because the young executive was so determined to get promoted, he worked overtime every night, often _____ his health and family time.
  - 錯誤內容：目前 answer 指向「(A) in charge of」。
  - 建議修正：answer 應指向「(C) at the expense of」。
  - 判定依據：at the expense of 指以...為代價。年輕主管為了升遷每晚加班，常以健康與家庭時間為代價，故選 at the expense of。
- **高｜答案錯誤｜vocab_101**
  - 題幹：Although losing his job seemed like a disaster at the time, it turned out to be _____, since it pushed him to start the business he had always dreamed of.
  - 錯誤內容：目前 answer 指向「(A) a drop in the ocean」。
  - 建議修正：answer 應指向「(D) a blessing in disguise」。
  - 判定依據：a blessing in disguise 指因禍得福。失業當時看似災難，卻促使他開始夢想已久的事業，故選 a blessing in disguise。
- **高｜答案錯誤｜vocab_104**
  - 題幹：Although he dreaded going to the dentist, he finally decided to _____ and book the appointment he had been avoiding for months.
  - 錯誤內容：目前 answer 指向「(B) beat around the bush」。
  - 建議修正：answer 應指向「(C) bite the bullet」。
  - 判定依據：bite the bullet 指咬緊牙關面對。雖然害怕看牙醫，他終於決定硬著頭皮預約已拖延數月的看診，故選 bite the bullet。
- **高｜答案錯誤｜vocab_110**
  - 題幹：Because the contractor was under pressure to finish the building before the deadline, he began to _____, which later caused serious safety problems.
  - 錯誤內容：目前 answer 指向「(C) cut in line」。
  - 建議修正：answer 應指向「(D) cut corners」。
  - 判定依據：cut corners 指偷工減料。承包商為了趕在期限前完工開始偷工減料，之後造成嚴重的安全問題，故選 cut corners。
- **高｜答案錯誤｜vocab_112**
  - 題幹：After stepping on her foot by accident, Tom quickly turned to _____ to the woman on the train.
  - 錯誤內容：目前 answer 指向「(A) complain」。
  - 建議修正：answer 應指向「(C) apologize」。
  - 判定依據：apologize 指道歉。不小心踩到別人的腳應該道歉，故選 apologize；complain 抱怨語意不符。
- **高｜答案錯誤｜vocab_113**
  - 題幹：I really _____ your help with my math homework; I could not have finished it without you.
  - 錯誤內容：目前 answer 指向「(A) blame」。
  - 建議修正：answer 應指向「(C) appreciate」。
  - 判定依據：appreciate 指感激。他人幫忙寫功課應心懷感激，故選 appreciate。
- **高｜答案錯誤｜vocab_115**
  - 題幹：All students are required to _____ the school assembly every Monday morning.
  - 錯誤內容：目前 answer 指向「(A) leave」。
  - 建議修正：answer 應指向「(D) attend」。
  - 判定依據：attend 指出席。學生每週一早上都必須出席週會，故選 attend。
- **高｜答案錯誤｜vocab_116**
  - 題幹：The whole family gathered together to _____ Grandpa's eightieth birthday.
  - 錯誤內容：目前 answer 指向「(C) cancel」。
  - 建議修正：answer 應指向「(D) celebrate」。
  - 判定依據：celebrate 指慶祝。全家聚在一起慶祝爺爺八十歲生日，故選 celebrate。
- **高｜答案錯誤｜vocab_117**
  - 題幹：Several customers began to _____ loudly when the restaurant took over an hour to serve their food.
  - 錯誤內容：目前 answer 指向「(C) apologize」。
  - 建議修正：answer 應指向「(A) complain」。
  - 判定依據：complain 指抱怨。上菜等超過一小時，顧客開始大聲抱怨，故選 complain。
- **高｜答案錯誤｜vocab_118**
  - 題幹：This bottle of juice _____ a lot of sugar, so you shouldn't drink too much of it.
  - 錯誤內容：目前 answer 指向「(C) produces」。
  - 建議修正：answer 應指向「(B) contains」。
  - 判定依據：contain 指含有。果汁含糖量高，不宜喝太多，故選 contains。
- **高｜答案錯誤｜vocab_120**
  - 題幹：It is important to _____ your temper instead of shouting at others when you are angry.
  - 錯誤內容：目前 answer 指向「(C) express」。
  - 建議修正：answer 應指向「(D) control」。
  - 判定依據：control 指控制。生氣時應控制脾氣而非對人吼叫，故選 control。
- **高｜答案錯誤｜vocab_121**
  - 題幹：Doctors are working hard to find a new medicine to _____ the disease.
  - 錯誤內容：目前 answer 指向「(C) catch」。
  - 建議修正：answer 應指向「(B) cure」。
  - 判定依據：cure 指治癒。醫生努力研發新藥治癒疾病，故選 cure。
- **高｜答案錯誤｜vocab_122**
  - 題幹：The heavy storm _____ many houses along the coast last night.
  - 錯誤內容：目前 answer 指向「(D) protected」。
  - 建議修正：answer 應指向「(B) damaged」。
  - 判定依據：damage 指損害。強烈風暴損毀了沿海許多房屋，故選 damaged。
- **高｜答案錯誤｜vocab_123**
  - 題幹：Every December, families _____ their houses with colorful lights and ornaments.
  - 錯誤內容：目前 answer 指向「(D) clean」。
  - 建議修正：answer 應指向「(A) decorate」。
  - 判定依據：decorate 指裝飾。十二月家家戶戶用彩燈和裝飾品裝飾房子，故選 decorate。
- **高｜答案錯誤｜vocab_125**
  - 題幹：The company promises to _____ your package within three days.
  - 錯誤內容：目前 answer 指向「(D) buy」。
  - 建議修正：answer 應指向「(C) deliver」。
  - 判定依據：deliver 指遞送。公司承諾三天內遞送包裹，故選 deliver。
- **高｜答案錯誤｜vocab_126**
  - 題幹：Can you _____ what the thief looked like to the police officer?
  - 錯誤內容：目前 answer 指向「(D) forget」。
  - 建議修正：answer 應指向「(B) describe」。
  - 判定依據：describe 指描述。向警察描述小偷的外貌，故選 describe。
- **高｜答案錯誤｜vocab_127**
  - 題幹：Scientists are trying to _____ a cheaper way to produce clean energy.
  - 錯誤內容：目前 answer 指向「(D) reject」。
  - 建議修正：answer 應指向「(C) develop」。
  - 判定依據：develop 指開發。科學家嘗試開發更便宜的乾淨能源生產方式，故選 develop。
- **高｜答案錯誤｜vocab_131**
  - 題幹：The teacher decided to _____ the class into four small groups for the project.
  - 錯誤內容：目前 answer 指向「(D) join」。
  - 建議修正：answer 應指向「(B) divide」。
  - 判定依據：divide 指分成。老師決定將班級分成四小組進行專案，故選 divide。
- **高｜答案錯誤｜vocab_175**
  - 題幹：The small dog began to bark loudly when a stranger tried to _____ its owner.
  - 錯誤內容：目前 answer 指向「(A) follow」。
  - 建議修正：answer 應指向「(D) attack」。
  - 判定依據：attack 指攻擊。陌生人試圖攻擊主人，小狗因此大聲吠叫，故選 attack。
- **高｜答案錯誤｜vocab_177**
  - 題幹：The car _____ on the highway caused a long traffic jam this morning.
  - 錯誤內容：目前 answer 指向「(A) opinion」。
  - 建議修正：answer 應指向「(B) accident」。
  - 判定依據：accident 指意外事故。高速公路上的意外事故造成今早長長的塞車，故選 accident。
- **高｜答案錯誤｜vocab_181**
  - 題幹：I read an interesting _____ about ocean pollution in the newspaper this morning.
  - 錯誤內容：目前 answer 指向「(A) message」。
  - 建議修正：answer 應指向「(C) article」。
  - 判定依據：article 指文章。今早在報紙上讀到一篇關於海洋污染的有趣文章，故選 article。
- **高｜答案錯誤｜vocab_183**
  - 題幹：Reading books every day is good exercise for your _____.
  - 錯誤內容：目前 answer 指向「(B) skin」。
  - 建議修正：answer 應指向「(A) brain」。
  - 判定依據：brain 指大腦。每天讀書對大腦是很好的運動，故選 brain。
- **高｜答案錯誤｜vocab_184**
  - 題幹：After graduating from college, she started her _____ as a nurse.
  - 錯誤內容：目前 answer 指向「(C) hobby」。
  - 建議修正：answer 應指向「(D) career」。
  - 判定依據：career 指職業生涯。大學畢業後她展開護理師的職業生涯，故選 career。
- **高｜答案錯誤｜vocab_185**
  - 題幹：This trip to Japan may be my only _____ to see cherry blossoms in person.
  - 錯誤內容：目前 answer 指向「(C) change」。
  - 建議修正：answer 應指向「(A) chance」。
  - 判定依據：chance 指機會。這趟日本行可能是親眼看櫻花的唯一機會，故選 chance。
- **高｜答案錯誤｜vocab_186**
  - 題幹：The main _____ in the movie is a brave young girl who saves her village.
  - 錯誤內容：目前 answer 指向「(C) actor」。
  - 建議修正：answer 應指向「(B) character」。
  - 判定依據：character 指角色。電影主角是拯救村莊的勇敢女孩，故選 character。
- **高｜答案錯誤｜vocab_187**
  - 題幹：As a good _____, you should follow the laws of your country.
  - 錯誤內容：目前 answer 指向「(C) guest」。
  - 建議修正：answer 應指向「(A) citizen」。
  - 判定依據：citizen 指公民。身為好公民應遵守國家的法律，故選 citizen。
- **高｜答案錯誤｜vocab_189**
  - 題幹：The teacher wrote a short _____ on my essay to explain what I should improve.
  - 錯誤內容：目前 answer 指向「(C) contact」。
  - 建議修正：answer 應指向「(B) comment」。
  - 判定依據：comment 指評語。老師在作文上寫了簡短評語說明該改進之處，故選 comment。
- **高｜答案錯誤｜vocab_190**
  - 題幹：The two neighbors had a _____ over where to put the fence between their yards.
  - 錯誤內容：目前 answer 指向「(C) opinion」。
  - 建議修正：answer 應指向「(A) conflict」。
  - 判定依據：conflict 指衝突。兩位鄰居因院子間籬笆位置起了衝突，故選 conflict。
- **高｜答案錯誤｜vocab_191**
  - 題幹：It took a lot of _____ for her to speak in front of the whole school.
  - 錯誤內容：目前 answer 指向「(C) fear」。
  - 建議修正：answer 應指向「(D) courage」。
  - 判定依據：courage 指勇氣。在全校面前演講需要很大的勇氣，故選 courage。
- **高｜答案錯誤｜vocab_192**
  - 題幹：Stealing money from other people is a serious _____.
  - 錯誤內容：目前 answer 指向「(C) mistake」。
  - 建議修正：answer 應指向「(B) crime」。
  - 判定依據：crime 指犯罪。偷別人的錢是嚴重的犯罪行為，故選 crime。
- **高｜答案錯誤｜vocab_193**
  - 題幹：The company faced a financial _____ after losing its biggest customer.
  - 錯誤內容：目前 answer 指向「(C) progress」。
  - 建議修正：answer 應指向「(B) crisis」。
  - 判定依據：crisis 指危機。公司失去最大客戶後面臨財務危機，故選 crisis。
- **高｜答案錯誤｜vocab_194**
  - 題幹：Traveling to different countries helps you understand other people's _____.
  - 錯誤內容：目前 answer 指向「(C) climate」。
  - 建議修正：answer 應指向「(A) culture」。
  - 判定依據：culture 指文化。到不同國家旅行有助於了解他人的文化，故選 culture。
- **高｜答案錯誤｜vocab_195**
  - 題幹：Taking off your shoes before entering a house is a common _____ in Taiwan.
  - 錯誤內容：目前 answer 指向「(C) course」。
  - 建議修正：answer 應指向「(A) custom」。
  - 判定依據：custom 指習俗。進屋前脫鞋在台灣是常見習俗，故選 custom。
- **高｜答案錯誤｜vocab_196**
  - 題幹：The class held a _____ about whether students should wear uniforms.
  - 錯誤內容：目前 answer 指向「(D) conversation」。
  - 建議修正：answer 應指向「(B) debate」。
  - 判定依據：debate 指辯論。班上針對是否該穿制服舉行辯論，故選 debate。
- **高｜答案錯誤｜vocab_197**
  - 題幹：She earned a _____ in biology from the university last year.
  - 錯誤內容：目前 answer 指向「(D) class」。
  - 建議修正：answer 應指向「(A) degree」。
  - 判定依據：degree 指學位。她去年從大學取得生物學學位，故選 degree。
- **高｜答案錯誤｜vocab_198**
  - 題幹：His strong _____ to become a doctor pushed him to study very hard.
  - 錯誤內容：目前 answer 指向「(D) fear」。
  - 建議修正：answer 應指向「(A) desire」。
  - 判定依據：desire 指渴望。想成為醫生的強烈渴望驅使他努力讀書，故選 desire。
- **高｜答案錯誤｜vocab_199**
  - 題幹：The _____ between the two cities is about two hundred kilometers.
  - 錯誤內容：目前 answer 指向「(D) area」。
  - 建議修正：answer 應指向「(C) distance」。
  - 判定依據：distance 指距離。兩城市間的距離約兩百公里，故選 distance。
- **高｜答案錯誤｜vocab_200**
  - 題幹：It is the manager's _____ to make sure all workers follow safety rules.
  - 錯誤內容：目前 answer 指向「(D) habit」。
  - 建議修正：answer 應指向「(B) duty」。
  - 判定依據：duty 指職責。確保員工遵守安全規則是經理的職責，故選 duty。
- **高｜答案錯誤｜vocab_266**
  - 題幹：My grandfather is still very _____; he goes hiking every weekend.
  - 錯誤內容：目前 answer 指向「(A) rude」。
  - 建議修正：answer 應指向「(D) active」。
  - 判定依據：active 指活躍的。祖父仍很活躍，每週末都去健行，故選 active。
- **高｜答案錯誤｜vocab_267**
  - 題幹：The museum displays many _____ tools used thousands of years ago.
  - 錯誤內容：目前 answer 指向「(A) local」。
  - 建議修正：answer 應指向「(D) ancient」。
  - 判定依據：ancient 指古代的。博物館展示許多數千年前使用的古老工具，故選 ancient；modern 現代的語意相反。
- **高｜答案錯誤｜vocab_269**
  - 題幹：She wasn't _____ that her phone had fallen out of her bag.
  - 錯誤內容：目前 answer 指向「(A) proud」。
  - 建議修正：answer 應指向「(C) aware」。
  - 判定依據：aware 指知道、意識到的。她沒意識到手機從包包掉出來了，故選 aware。
- **高｜答案錯誤｜vocab_270**
  - 題幹：It was very _____ of the boy to jump into the river to save the drowning dog.
  - 錯誤內容：目前 answer 指向「(B) lazy」。
  - 建議修正：answer 應指向「(D) brave」。
  - 判定依據：brave 指勇敢的。男孩跳入河中救溺水的狗是很勇敢的行為，故選 brave。
- **高｜答案錯誤｜vocab_272**
  - 題幹：Even during the fire drill, the teacher stayed _____ and led the students outside.
  - 錯誤內容：目前 answer 指向「(C) worried」。
  - 建議修正：answer 應指向「(A) calm」。
  - 判定依據：calm 指冷靜的。即使消防演習期間，老師仍保持冷靜帶學生到戶外，故選 calm。
- **高｜答案錯誤｜vocab_273**
  - 題幹：It was _____ of him to leave the door unlocked all night.
  - 錯誤內容：目前 answer 指向「(C) polite」。
  - 建議修正：answer 應指向「(B) careless」。
  - 判定依據：careless 指粗心的。整晚沒鎖門是粗心的行為，故選 careless；careful 小心的語意相反。
- **高｜答案錯誤｜vocab_274**
  - 題幹：The night market sells lots of _____ but delicious snacks.
  - 錯誤內容：目前 answer 指向「(C) valuable」。
  - 建議修正：answer 應指向「(B) cheap」。
  - 判定依據：cheap 指便宜的。夜市賣許多便宜卻美味的小吃，故選 cheap；expensive 昂貴語意相反。
- **高｜答案錯誤｜vocab_275**
  - 題幹：The _____ fox found a way to get the grapes without climbing the tree.
  - 錯誤內容：目前 answer 指向「(C) foolish」。
  - 建議修正：answer 應指向「(A) clever」。
  - 判定依據：clever 指聰明的。這隻聰明的狐狸不用爬樹就找到方法拿到葡萄，故選 clever。
- **高｜答案錯誤｜vocab_277**
  - 題幹：The building project is now _____ and the new library will open next week.
  - 錯誤內容：目前 answer 指向「(C) formal」。
  - 建議修正：answer 應指向「(B) complete」。
  - 判定依據：complete 指完成的。工程已完成，新圖書館下週開幕，故選 complete。
- **高｜答案錯誤｜vocab_278**
  - 題幹：Swimming alone in the deep sea can be very _____.
  - 錯誤內容：目前 answer 指向「(D) calm」。
  - 建議修正：answer 應指向「(C) dangerous」。
  - 判定依據：dangerous 指危險的。獨自在深海游泳很危險，故選 dangerous；safe 安全語意相反。
- **高｜答案錯誤｜vocab_280**
  - 題幹：Being a _____ student, Mary always finishes her homework before playing games.
  - 錯誤內容：目前 answer 指向「(D) rude」。
  - 建議修正：answer 應指向「(B) diligent」。
  - 判定依據：diligent 指勤奮的。身為勤奮的學生，Mary 總是先完成作業才玩遊戲，故選 diligent。

### question_bank_grammar.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

### question_bank_cloze.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

### question_bank_reading.json

- **高｜答案錯誤｜reading_0 / question 2**
  - 題幹：How can a student get a free movie ticket?
  - 錯誤內容：目前 answer 指向「(C) By bringing a friend to the library」。
  - 建議修正：answer 應指向「(D) By reading 5 books and writing a note about each」。
  - 判定依據：Finish all 5（讀 5 本並各寫短文）才能拿到免費電影票，選 C；帶朋友是得到書籤，不是電影票。
- **高｜答案錯誤｜reading_1 / question 1**
  - 題幹：What is the main purpose of Grandma's email?
  - 錯誤內容：目前 answer 指向「(B) To invite Anna to come and live with her」。
  - 建議修正：answer 應指向「(D) To thank Anna for the card and say she looks forward to the visit」。
  - 判定依據：信中先感謝生日卡，又說期待下個月相見、一起烤餅乾，主要目的為感謝並表達期待，選 B。
- **高｜答案錯誤｜reading_4 / question 3**
  - 題幹：What does "sorts through" in the second paragraph most likely mean?
  - 錯誤內容：目前 answer 指向「(B) Hides」。
  - 建議修正：answer 應指向「(D) Organizes」。
  - 判定依據：後面用 like cleaning a messy room（像整理凌亂的房間）作比喻，可推知 sorts through 意為「整理」，選 B。
- **高｜答案錯誤｜reading_5 / question 1**
  - 題幹：By what time should students arrive at the school gate?
  - 錯誤內容：目前 answer 指向「(A) 4:00 p.m.」。
  - 建議修正：answer 應指向「(D) 8:00 a.m.」。
  - 判定依據：8:00 在校門口集合、8:30 巴士就開（別遲到），所以最晚 8:00 必須到，選 A。
- **高｜答案錯誤｜reading_6 / question 2**
  - 題幹：Why did Karl von Frisch win the Nobel Prize?
  - 錯誤內容：目前 answer 指向「(B) He grew a new kind of flower for bees」。
  - 建議修正：answer 應指向「(D) He discovered how bees communicate through dance」。
  - 判定依據：第三段說他花了多年觀察蜜蜂、弄懂牠們的舞蹈語言，因此在 1973 年獲諾貝爾獎，選 B。
- **高｜答案錯誤｜reading_6 / question 3**
  - 題幹：What does the writer suggest in the last paragraph?
  - 錯誤內容：目前 answer 指向「(C) We should eat less honey to protect bees」。
  - 建議修正：answer 應指向「(B) Bees play an important role in helping our food supply」。
  - 判定依據：末段說蜜蜂幫助植物結種、若蜜蜂消失許多蔬果也會消失，暗示保護蜜蜂就是保護糧食，選 C。
- **高｜答案錯誤｜reading_9 / question 3**
  - 題幹：What does this story mainly show?
  - 錯誤內容：目前 answer 指向「(B) Old radios sound better than modern music players」。
  - 建議修正：answer 應指向「(A) Simple things can bring people closer and create lasting memories」。
  - 判定依據：故事透過廣播機連接祖孫兩代、讓 Sam 每年回訪直到廣播沉默，主旨是簡單的事物可以拉近人心並留下深刻回憶，選 B。
- **高｜答案錯誤｜reading_49 / question 2**
  - 題幹：Why do bakers often put dough in a warm place?
  - 錯誤內容：目前 answer 指向「(A) It helps the flour turn white」。
  - 建議修正：answer 應指向「(C) Warm temperatures help yeast work faster」。
  - 判定依據：文中說 Warm temperatures help yeast work faster，故麵包師常把麵團放在溫暖處，選 A。

### question_bank_phrase.json

- **高｜答案錯誤｜phrase_1**
  - 題幹：I have been waiting _____ the bus stop for almost half an hour.
  - 錯誤內容：目前 answer 指向「(A) on」。
  - 建議修正：answer 應指向「(B) at」。
  - 判定依據：表示在某個定點用介系詞 at。at the bus stop 指在公車站等車，故選 at。
- **高｜答案錯誤｜phrase_26**
  - 題幹：Please _____ your room before dinner.
  - 錯誤內容：目前 answer 指向「(C) clean out」。
  - 建議修正：answer 應指向「(D) clean up」。
  - 判定依據：晚餐前要把房間「整理乾淨」，故選 clean up。
- **高｜答案錯誤｜phrase_33**
  - 題幹：Whether we go hiking tomorrow will _____ the weather.
  - 錯誤內容：目前 answer 指向「(D) depend at」。
  - 建議修正：answer 應指向「(A) depend on」。
  - 判定依據：是否去健行「取決於」天氣，故選 depend on。
- **高｜答案錯誤｜phrase_34**
  - 題幹：This old bicycle used to _____ my grandfather.
  - 錯誤內容：目前 answer 指向「(B) belong with」。
  - 建議修正：answer 應指向「(A) belong to」。
  - 判定依據：這台舊腳踏車以前「屬於」爺爺，故選 belong to。
- **高｜答案錯誤｜phrase_35**
  - 題幹：I don't _____ your opinion about the new rule.
  - 錯誤內容：目前 answer 指向「(A) agree at」。
  - 建議修正：answer 應指向「(D) agree with」。
  - 判定依據：表達不「同意」對方的意見，故選 agree with。
- **高｜答案錯誤｜phrase_65**
  - 題幹：The new manager soon _____ strong resistance from the staff.
  - 錯誤內容：目前 answer 指向「(C) came up with」。
  - 建議修正：answer 應指向「(D) came up against」。
  - 判定依據：新經理很快就「遭遇」員工強烈的抵制，故選 came up against。
- **高｜答案錯誤｜phrase_74**
  - 題幹：You can always _____ your best friend in times of trouble.
  - 錯誤內容：目前 answer 指向「(C) count up」。
  - 建議修正：answer 應指向「(B) count on」。
  - 判定依據：遇到困難時總能「依靠」最好的朋友，故選 count on。
- **高｜答案錯誤｜phrase_75**
  - 題幹：It's not easy to _____ such a difficult customer.
  - 錯誤內容：目前 answer 指向「(D) deal in」。
  - 建議修正：answer 應指向「(C) deal with」。
  - 判定依據：「應付」難搞的顧客並不容易，故選 deal with。
- **高｜答案錯誤｜phrase_80**
  - 題幹：The heavy traffic can partly _____ why he arrived so late.
  - 錯誤內容：目前 answer 指向「(A) account with」。
  - 建議修正：answer 應指向「(D) account for」。
  - 判定依據：塞車可以部分「解釋」他為何遲到，故選 account for。
- **高｜答案錯誤｜phrase_81**
  - 題幹：Jenny stayed home today because she _____ a bad cold.
  - 錯誤內容：目前 answer 指向「(C) came up with」。
  - 建議修正：answer 應指向「(B) came down with」。
  - 判定依據：Jenny 今天請假在家是因為她「染上」重感冒，故選 came down with。
- **高｜答案錯誤｜phrase_82**
  - 題幹：The new manager decided to _____ the old, inefficient system completely.
  - 錯誤內容：目前 answer 指向「(D) do over with」。
  - 建議修正：answer 應指向「(C) do away with」。
  - 判定依據：新經理決定完全「廢除」舊有沒效率的制度，故選 do away with。
- **高｜答案錯誤｜phrase_94**
  - 題幹：You should always _____ your important files in case your computer crashes.
  - 錯誤內容：目前 answer 指向「(B) back down」。
  - 建議修正：answer 應指向「(A) back up」。
  - 判定依據：應該隨時「備份」重要檔案以防電腦當機，故選 back up。
- **高｜答案錯誤｜phrase_95**
  - 題幹：Before the trip to France, I want to _____ my French.
  - 錯誤內容：目前 answer 指向「(B) brush off on」。
  - 建議修正：answer 應指向「(A) brush up on」。
  - 判定依據：去法國前想「複習」法文，故選 brush up on。
- **高｜答案錯誤｜phrase_112**
  - 題幹：My car _____ on the highway, so I had to call for help.
  - 錯誤內容：目前 answer 指向「(B) broke up」。
  - 建議修正：answer 應指向「(D) broke down」。
  - 判定依據：break down 指（車輛、機器）故障。車子在高速公路上故障，故選 broke down；break up 是分手、break into 是闖入。
- **高｜答案錯誤｜phrase_113**
  - 題幹：She didn't want to _____ the topic of money at the dinner table.
  - 錯誤內容：目前 answer 指向「(B) bring about」。
  - 建議修正：answer 應指向「(C) bring up」。
  - 判定依據：bring up 指提起、提出話題。她不想在餐桌上提起錢的話題，故選 bring up；bring back 是帶回、恢復。
- **高｜答案錯誤｜phrase_116**
  - 題幹：We arrived at the hotel early, but we couldn't _____ until three o'clock.
  - 錯誤內容：目前 answer 指向「(C) check up」。
  - 建議修正：answer 應指向「(D) check in」。
  - 判定依據：check in 指辦理入住。太早到飯店，三點才能辦理入住，故選 check in；check out 是退房。
- **高｜答案錯誤｜phrase_117**
  - 題幹：The old bookstore had to _____ after forty years of business.
  - 錯誤內容：目前 answer 指向「(C) close off」。
  - 建議修正：answer 應指向「(A) close down」。
  - 判定依據：close down 指（店家）歇業、關閉。老書店經營四十年後歇業，故選 close down；close up 是打烊。
- **高｜答案錯誤｜phrase_119**
  - 題幹：The doctor told him to _____ sugar in order to stay healthy.
  - 錯誤內容：目前 answer 指向「(C) cut in」。
  - 建議修正：answer 應指向「(D) cut down on」。
  - 判定依據：cut down on 指減少。醫生要他減少糖分攝取以維持健康，故選 cut down on；cut off 是切斷。
- **高｜答案錯誤｜phrase_177**
  - 題幹：During the holiday, I finally had time to _____ some much-needed sleep.
  - 錯誤內容：目前 answer 指向「(C) catch up with」。
  - 建議修正：answer 應指向「(D) catch up on」。
  - 判定依據：catch up on 指補做落後的事。假期終於有時間補足睡眠，故選 catch up on；catch up with 是趕上某人。
- **高｜答案錯誤｜phrase_178**
  - 題幹：After being away for years, it took him a while to _____ his old classmates.
  - 錯誤內容：目前 answer 指向「(C) catch on with」。
  - 建議修正：answer 應指向「(A) catch up with」。
  - 判定依據：catch up with 指（在消息或進度上）趕上某人。離開多年後花時間才跟老同學敘舊、跟上近況，故選 catch up with。
- **高｜答案錯誤｜phrase_180**
  - 題幹：The whole class started _____ the last ten seconds before the bell rang.
  - 錯誤內容：目前 answer 指向「(C) counting on」。
  - 建議修正：answer 應指向「(D) counting down」。
  - 判定依據：count down 指倒數。下課鈴響前全班開始倒數最後十秒，故選 counting down；count on 是依靠。
- **高｜答案錯誤｜phrase_181**
  - 題幹：It's not easy to _____ such a strict and demanding customer.
  - 錯誤內容：目前 answer 指向「(D) deal for」。
  - 建議修正：answer 應指向「(A) deal with」。
  - 判定依據：deal with 指應付、處理。應付嚴格苛刻的顧客並不容易，故選 deal with；deal in 是經營、買賣。
- **高｜答案錯誤｜phrase_182**
  - 題幹：You should always _____ your important files in case your laptop breaks.
  - 錯誤內容：目前 answer 指向「(B) back down」。
  - 建議修正：answer 應指向「(A) back up」。
  - 判定依據：back up 指備份。應隨時備份重要檔案以防筆電故障，故選 back up；back down 是讓步、放棄。
- **高｜答案錯誤｜phrase_183**
  - 題幹：After the loud argument, he finally had to _____ and apologize.
  - 錯誤內容：目前 answer 指向「(B) back into」。
  - 建議修正：answer 應指向「(D) back down」。
  - 判定依據：back down 指讓步、退讓。激烈爭吵後他最終讓步並道歉，故選 back down；back up 是備份。
- **高｜答案錯誤｜phrase_186**
  - 題幹：Before the interview, I want to _____ my presentation skills.
  - 錯誤內容：目前 answer 指向「(B) brush over on」。
  - 建議修正：answer 應指向「(C) brush up on」。
  - 判定依據：brush up on 指複習、加強。面試前想加強自己的簡報技巧，故選 brush up on。
- **高｜答案錯誤｜phrase_220**
  - 題幹：Tommy stayed home from school today because he _____ a bad fever.
  - 錯誤內容：目前 answer 指向「(C) came along with」。
  - 建議修正：answer 應指向「(A) came down with」。
  - 判定依據：come down with 指染上（疾病）。Tommy 今天請假在家是因為染上重感冒，故選 came down with。
- **高｜答案錯誤｜phrase_221**
  - 題幹：The school decided to _____ the outdated dress code completely.
  - 錯誤內容：目前 answer 指向「(D) do out with」。
  - 建議修正：answer 應指向「(C) do away with」。
  - 判定依據：do away with 指廢除、擺脫。學校決定完全廢除過時的服儀規定，故選 do away with。
- **高｜答案錯誤｜phrase_224**
  - 題幹：We didn't plan to meet, but we happened to _____ each other outside the library.
  - 錯誤內容：目前 answer 指向「(C) come into」。
  - 建議修正：answer 應指向「(A) come across」。
  - 判定依據：come across 指偶然遇見（或發現）。沒約好卻在圖書館外巧遇，故選 came across；come into 是進入。
- **高｜答案錯誤｜phrase_227**
  - 題幹：The strong wind almost _____ the tent during the campsite storm.
  - 錯誤內容：目前 answer 指向「(B) blew up」。
  - 建議修正：answer 應指向「(C) blew away」。
  - 判定依據：blow away 指被風吹走。露營時暴風差點把帳篷吹走，故選 blew away；blow out 是吹熄。
- **高｜答案錯誤｜phrase_228**
  - 題幹：Please remember to _____ the candles before you leave the room.
  - 錯誤內容：目前 answer 指向「(B) blow up」。
  - 建議修正：answer 應指向「(A) blow out」。
  - 判定依據：blow out 指吹熄。離開房間前記得吹熄蠟燭，故選 blow out；blow up 是爆炸。
- **高｜答案錯誤｜phrase_229**
  - 題幹：The tired old bridge finally _____ after decades of heavy use.
  - 錯誤內容：目前 answer 指向「(B) broke up」。
  - 建議修正：answer 應指向「(A) broke down」。
  - 判定依據：break down 指損壞、倒塌。老舊的橋在數十年使用後終於損壞，故選 broke down；break out 是爆發。
- **高｜答案錯誤｜phrase_236**
  - 題幹：Before the guests arrive, we need to completely _____ the storage closet.
  - 錯誤內容：目前 answer 指向「(C) put on」。
  - 建議修正：answer 應指向「(B) clean out」。
  - 判定依據：clean out 指徹底清空。客人來之前要徹底清空儲藏室，故選 clean out；clean up 是整理乾淨。
- **高｜答案錯誤｜phrase_237**
  - 題幹：Whether the picnic happens tomorrow will completely _____ the weather.
  - 錯誤內容：目前 answer 指向「(D) depend to」。
  - 建議修正：answer 應指向「(C) depend on」。
  - 判定依據：depend on 指取決於。野餐是否舉行完全取決於天氣，故選 depend on。
- **高｜答案錯誤｜phrase_238**
  - 題幹：I really don't _____ your decision to quit the team without telling anyone.
  - 錯誤內容：目前 answer 指向「(A) agree to」。
  - 建議修正：answer 應指向「(B) agree with」。
  - 判定依據：agree with 指同意（某人的看法或做法）。表達不同意在沒告知任何人的情況下退隊的決定，故選 agree with。
- **高｜答案錯誤｜phrase_239**
  - 題幹：This antique clock used to _____ my great-grandmother a hundred years ago.
  - 錯誤內容：目前 answer 指向「(B) belong for」。
  - 建議修正：answer 應指向「(D) belong to」。
  - 判定依據：belong to 指屬於。這個古董鐘一百年前屬於我的曾祖母，故選 belong to。
- **高｜答案錯誤｜phrase_241**
  - 題幹：The store owner had to _____ dozens of angry customers after the price increase.
  - 錯誤內容：目前 answer 指向「(D) deal for」。
  - 建議修正：answer 應指向「(A) deal with」。
  - 判定依據：deal with 指應付、處理。漲價後店主必須應付數十位憤怒的顧客，故選 deal with。
- **高｜答案錯誤｜phrase_242**
  - 題幹：The company's new logo _____ a lot of criticism online.
  - 錯誤內容：目前 answer 指向「(C) came out with」。
  - 建議修正：answer 應指向「(D) came up against」。
  - 判定依據：come up against 指遭遇（阻力、反對）。公司新標誌在網路上遭遇不少批評，故選 came up against。
- **高｜答案錯誤｜phrase_252**
  - 題幹：You can always _____ your grandmother to make you feel better.
  - 錯誤內容：目前 answer 指向「(C) count out on」。
  - 建議修正：answer 應指向「(B) count on」。
  - 判定依據：count on 指依靠。心情不好時總能依靠奶奶讓你好過一些，故選 count on。
- **高｜答案錯誤｜phrase_255**
  - 題幹：I'm not sure she'll agree, but _____, we should ask her first.
  - 錯誤內容：目前 answer 指向「(A) at any moment」。
  - 建議修正：answer 應指向「(C) at any rate」。
  - 判定依據：at any rate 指無論如何。不確定她是否會同意，但無論如何該先問她，故選 at any rate。
- **高｜答案錯誤｜phrase_260**
  - 題幹：My little cousin gets upset _____; almost anything can make him cry.
  - 錯誤內容：目前 answer 指向「(A) out of the blue」。
  - 建議修正：answer 應指向「(D) at the drop of a hat」。
  - 判定依據：at the drop of a hat 指動不動就。表弟動不動就難過，幾乎任何小事都能讓他哭，故選 at the drop of a hat。
- **高｜答案錯誤｜phrase_268**
  - 題幹：_____, the underdog team ended up winning the championship.
  - 錯誤內容：目前 answer 指向「(A) By all means」。
  - 建議修正：answer 應指向「(D) Against all odds」。
  - 判定依據：against all odds 指儘管困難重重。實力較弱的隊伍儘管困難重重最終贏得冠軍，故選 Against all odds。
- **高｜答案錯誤｜phrase_269**
  - 題幹：_____, the museum's new exhibit has received mostly positive reviews.
  - 錯誤內容：目前 answer 指向「(B) By the way」。
  - 建議修正：answer 應指向「(A) By and large」。
  - 判定依據：by and large 指整體而言。整體而言博物館的新展覽獲得大多正面評價，故選 By and large。
- **高｜答案錯誤｜phrase_274**
  - 題幹：The lifeguard told everyone to leave the pool _____.
  - 錯誤內容：目前 answer 指向「(A) in once」。
  - 建議修正：answer 應指向「(C) at once」。
  - 判定依據：at once 指立刻。救生員要求大家立刻離開泳池，故選 at once。
- **高｜答案錯誤｜phrase_281**
  - 題幹：_____ the weather report, a typhoon will hit the island this weekend.
  - 錯誤內容：目前 answer 指向「(A) Owing to」。
  - 建議修正：answer 應指向「(D) According to」。
  - 判定依據：according to 指根據。根據氣象報告，這週末颱風將侵襲該島，故選 According to。
- **高｜答案錯誤｜phrase_286**
  - 題幹：_____, this year's science fair was a great success for our school.
  - 錯誤內容：目前 answer 指向「(A) At once」。
  - 建議修正：answer 應指向「(B) All in all」。
  - 判定依據：all in all 指總的來說。總的來說，今年的科展對我們學校是一大成功，故選 All in all。
- **高｜答案錯誤｜phrase_302**
  - 題幹：He forgot his lines during the play, but he managed to keep going _____.
  - 錯誤內容：目前 answer 指向「(A) hand in hand」。
  - 建議修正：answer 應指向「(D) all the same」。
  - 判定依據：all the same 指儘管如此、仍然。他忘詞了，儘管如此仍設法繼續演下去，故選 all the same。
- **高｜答案錯誤｜phrase_304**
  - 題幹："May I use your calculator?" "_____, here it is."
  - 錯誤內容：目前 answer 指向「(B) At all costs」。
  - 建議修正：answer 應指向「(A) By all means」。
  - 判定依據：by all means 指當然可以。回應對方可以借用計算機，故選 By all means。
- **高｜答案錯誤｜phrase_306**
  - 題幹：_____, it's a difficult decision, and I understand why you're hesitant.
  - 錯誤內容：目前 answer 指向「(A) In other words」。
  - 建議修正：answer 應指向「(C) At the same time」。
  - 判定依據：at the same time 此處指同時、話雖如此。同時這確實是個困難的決定，理解你猶豫的原因，故選 At the same time。
- **高｜答案錯誤｜phrase_309**
  - 題幹：_____, the new student hasn't made any friends yet, but it's only been a week.
  - 錯誤內容：目前 answer 指向「(A) On the other hand」。
  - 建議修正：answer 應指向「(B) As far as I know」。
  - 判定依據：as far as I know 指據我所知。據我所知新同學還沒交到朋友，但才過一週，故選 As far as I know。

### question_bank_listening.json

本輪未發現可確認的答案、翻譯或詳解錯誤。

## 聽力音檔交叉比對

question_bank_listening.json 的 80 題均有 dialogue 逐字稿，但資料本身沒有 audio 路徑；App 會以 dialogue 動態產生語音。專案中的 cache/listening 是雜湊檔名，沒有題目 id 對照表，因此本輪能逐題核對的是 dialogue、題目、選項、answer 與詳解，無法證明快取 MP3 與特定題目的逐字一致。未發現逐字稿與答案矛盾。

## 會考難度與核心字限制

選項中的專有名詞、常見詞形變化、片語及功能字不能只靠 target_2000_words.json 的字面集合判定超綱，因此未把單純 OOV 自動列為錯誤。逐批語意複核未發現「明顯因艱深選項而無法作答」的題目。聽力答案分布 C 為 43.8%，屬命題品質風險但不是資料正確性錯誤。

## 重要限制

本報告能列出已確認錯誤，不能以任何自動掃描或單次語意複核保證數學意義上的 100% 無誤。尤其自然語言可能存在多解、語境歧義，以及缺少可追溯音檔對照的限制。修正前應優先處理上述 133 筆 answer，修正後再跑一次獨立複核。
