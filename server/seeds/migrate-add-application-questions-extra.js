// Add Extra Application Questions to Reach 70% Target
// This script adds additional application questions to reach the 70% target
// Run with: node migrate-add-application-questions-extra.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Extra application question templates
const extraApplicationQuestions = [
  {
    question: 'If a state government creates a law that restricts freedom of speech to maintain "public order," what test should the court apply?',
    options: [
      { text: 'The court should automatically uphold the law as a state prerogative', isCorrect: false, explanation: 'Incorrect. Courts must apply the "reasonable restriction" test under Article 19(2) to determine if the restriction is proportionate and necessary.' },
      { text: 'The court should apply the "reasonable restriction" test to check if it\'s proportionate and necessary', isCorrect: true, explanation: 'Correct! Under Article 19(2), courts must examine whether restrictions on freedom of speech are reasonable, proportionate, and necessary for the stated purpose like public order.' },
      { text: 'The court should reject any law that restricts speech regardless of reason', isCorrect: false, explanation: 'Incorrect. Article 19(2) explicitly allows reasonable restrictions on freedom of speech for specific purposes including public order, so courts must examine each case individually.' },
      { text: 'The court should only consider the government\'s stated purpose without examining proportionality', isCorrect: false, explanation: 'Incorrect. Courts must examine both the legitimacy of the purpose and whether the restriction is proportionate to achieve that purpose.' }
    ],
    questionType: 'application'
  },
  {
    question: 'A citizen is arrested without being informed of the charges. Which constitutional right has been violated?',
    options: [
      { text: 'Right to Equality under Article 14', isCorrect: false, explanation: 'Incorrect. While Article 14 is important, the specific right violated here is the protection against arbitrary arrest under Article 22.' },
      { text: 'Right to be informed of grounds of arrest under Article 22', isCorrect: true, explanation: 'Correct! Article 22(1) specifically provides that no person shall be arrested without being informed of the grounds of arrest. This is a fundamental protection against arbitrary detention.' },
      { text: 'Right to Freedom of Speech under Article 19', isCorrect: false, explanation: 'Incorrect. The right violated here is protection against arbitrary arrest and detention under Article 22, not freedom of speech.' },
      { text: 'Right to Constitutional Remedies under Article 32', isCorrect: false, explanation: 'Incorrect. While Article 32 provides the remedy, the right being violated is the protection against arbitrary arrest under Article 22.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution balance individual liberty with national security concerns?',
    options: [
      { text: 'Individual liberty always takes precedence over national security', isCorrect: false, explanation: 'Incorrect. The Constitution balances both through provisions like Article 19(2) which allows reasonable restrictions on fundamental rights for national security.' },
      { text: 'National security always overrides individual liberty', isCorrect: false, explanation: 'Incorrect. While national security is important, the Constitution provides that restrictions on liberty must be reasonable and proportionate, not absolute.' },
      { text: 'Through reasonable restrictions that must be proportionate and necessary', isCorrect: true, explanation: 'Correct! The Constitution balances these through the doctrine of reasonable restrictions. Rights can be limited for national security but only through measures that are proportionate and necessary.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution extensively addresses this balance through provisions like Article 19(2), Article 22, and emergency provisions under Article 352.' }
    ],
    questionType: 'application'
  },
  {
    question: 'If a law discriminates based on religion but claims to promote social welfare, how should the court rule?',
    options: [
      { text: 'The court should uphold the law since social welfare is important', isCorrect: false, explanation: 'Incorrect. While social welfare is important, Article 15(1) prohibits discrimination on grounds of religion. Social welfare exceptions are limited to specific categories under Article 15(5).' },
      { text: 'The court should strike down the law as violating Article 15(1) prohibition on religious discrimination', isCorrect: true, explanation: 'Correct! Article 15(1) prohibits discrimination on grounds of religion, race, caste, sex, or place of birth. Social welfare claims do not override this fundamental prohibition except in limited circumstances under Article 15(5).' },
      { text: 'The court should allow the law if it benefits the majority religion', isCorrect: false, explanation: 'Incorrect. Constitutional equality applies regardless of which religion benefits or is disadvantaged. Discrimination based on religion is generally prohibited.' },
      { text: 'The court should modify the law to apply equally to all religions', isCorrect: false, explanation: 'Incorrect. If a law\'s core purpose involves religious discrimination, modification may not solve the constitutional violation. The court would likely strike it down entirely.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principle applies when a citizen challenges a government policy as unconstitutional?',
    options: [
      { text: 'The principle of parliamentary sovereignty means the policy cannot be challenged', isCorrect: false, explanation: 'Incorrect. While Parliament is supreme in its legislative domain, its actions are subject to constitutional limits and can be challenged for violating constitutional provisions.' },
      { text: 'The principle of judicial review allows courts to examine constitutionality', isCorrect: true, explanation: 'Correct! Judicial review is a fundamental constitutional principle. Courts can examine whether government actions comply with the Constitution and strike down those that violate constitutional provisions.' },
      { text: 'The principle of separation of powers means courts cannot review executive actions', isCorrect: false, explanation: 'Incorrect. Separation of powers divides functions but does not prevent judicial review. Courts can review executive actions for constitutional compliance.' },
      { text: 'The principle of federalism means only state courts can review state policies', isCorrect: false, explanation: 'Incorrect. Constitutional violations can be challenged in appropriate courts including the Supreme Court and High Courts, regardless of which government level enacted the policy.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How should constitutional principles guide a judge deciding between individual rights and government regulations?',
    options: [
      { text: 'Always prioritize government regulations for administrative convenience', isCorrect: false, explanation: 'Incorrect. Constitutional law requires balancing, not automatic preference for government convenience. Individual rights must be given due weight.' },
      { text: 'Always prioritize individual rights regardless of government interest', isCorrect: false, explanation: 'Incorrect. While individual rights are fundamental, the Constitution recognizes that reasonable restrictions are sometimes necessary for legitimate government interests.' },
      { text: 'Apply the proportionality test to balance rights against legitimate government interests', isCorrect: true, explanation: 'Correct! Courts use the proportionality test to balance individual rights against legitimate government interests, ensuring restrictions are necessary and proportionate to achieve the stated goal.' },
      { text: 'Let the legislature decide without judicial interference', isCorrect: false, explanation: 'Incorrect. Judicial review is a constitutional function. Courts must examine whether legislative actions comply with constitutional principles and protect individual rights.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional remedy is available when fundamental rights are violated by state authorities?',
    options: [
      { text: 'Only criminal prosecution of the responsible officials', isCorrect: false, explanation: 'Incorrect. While criminal prosecution may be possible, the primary constitutional remedy is through writ jurisdiction under Articles 32 or 226.' },
      { text: 'Writ jurisdiction under Article 32 (Supreme Court) or Article 226 (High Courts)', isCorrect: true, explanation: 'Correct! Article 32 provides the right to approach the Supreme Court for constitutional remedies, and Article 226 gives High Courts similar power. These are the primary remedies for fundamental rights violations.' },
      { text: 'Only administrative appeal within the state government', isCorrect: false, explanation: 'Incorrect. Administrative appeals may be available but are not constitutional remedies. The primary constitutional remedies are through writ jurisdiction in courts.' },
      { text: 'No specific remedy - citizens must accept state authority', isCorrect: false, explanation: 'Incorrect. The Constitution specifically provides remedies through writ jurisdiction. Citizens can approach courts when their fundamental rights are violated by state authorities.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution ensure that emergency powers do not become permanent?',
    options: [
      { text: 'The Constitution has no safeguards against permanent emergency', isCorrect: false, explanation: 'Incorrect. The Constitution has several safeguards including parliamentary approval requirements and mandatory periodic review to prevent emergencies from becoming permanent.' },
      { text: 'Through parliamentary approval requirements and mandatory periodic review', isCorrect: true, explanation: 'Correct! Emergency declarations under Article 352 require parliamentary approval within one month and must be approved every six months. This prevents emergencies from becoming permanent.' },
      { text: 'Only through judicial review after the emergency ends', isCorrect: false, explanation: 'Incorrect. While judicial review is important, the Constitution provides built-in safeguards like parliamentary approval and periodic review during the emergency itself.' },
      { text: 'The President has absolute discretion to decide emergency duration', isCorrect: false, explanation: 'Incorrect. While the President proclaims emergencies, the Constitution requires parliamentary approval and periodic review, limiting presidential discretion over emergency duration.' }
    ],
    questionType: 'application'
  }
];

async function addExtraApplicationQuestions() {
  try {
    console.log('🔄 Add Extra Application Questions to Reach 70% Target');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all quiz content
    const quizzes = await Content.find({ type: 'quiz' });
    console.log(`📝 Found ${quizzes.length} quizzes`);
    
    // Calculate current distribution
    let totalQuestions = 0;
    let totalRecall = 0;
    let totalApplication = 0;
    
    quizzes.forEach(quiz => {
      if (quiz.quiz && quiz.quiz.questions) {
        quiz.quiz.questions.forEach(q => {
          totalQuestions++;
          if (q.questionType === 'recall') totalRecall++;
          if (q.questionType === 'application') totalApplication++;
        });
      }
    });
    
    const currentApplicationPercentage = totalQuestions > 0 ? (totalApplication / totalQuestions * 100).toFixed(1) : 0;
    const targetApplicationPercentage = 70;
    const targetApplicationCount = Math.round(totalQuestions * (targetApplicationPercentage / 100));
    const neededApplicationQuestions = Math.max(0, targetApplicationCount - totalApplication);
    
    console.log(`📊 Current distribution: ${totalRecall} recall (${((totalRecall/totalQuestions)*100).toFixed(1)}%), ${totalApplication} application (${currentApplicationPercentage}%)`);
    console.log(`🎯 Target: 30% recall / ${targetApplicationPercentage}% application`);
    console.log(`📋 Need to add ${neededApplicationQuestions} more application questions`);
    
    if (neededApplicationQuestions === 0) {
      console.log('✅ Target already achieved!');
      await mongoose.connection.close();
      return;
    }
    
    let questionsAdded = 0;
    const questionsPerQuiz = Math.ceil(neededApplicationQuestions / quizzes.length);
    
    for (const quiz of quizzes) {
      if (questionsAdded >= neededApplicationQuestions) break;
      
      // Add questions to this quiz
      for (let i = 0; i < Math.min(questionsPerQuiz, extraApplicationQuestions.length); i++) {
        if (questionsAdded >= neededApplicationQuestions) break;
        
        const questionTemplate = extraApplicationQuestions[i % extraApplicationQuestions.length];
        quiz.quiz.questions.push(questionTemplate);
        questionsAdded++;
        
        console.log(`  ✅ Added application question to "${quiz.title}"`);
      }
      
      await quiz.save();
    }
    
    // Recalculate final distribution
    let newTotalQuestions = 0;
    let newTotalRecall = 0;
    let newTotalApplication = 0;
    
    const updatedQuizzes = await Content.find({ type: 'quiz' });
    updatedQuizzes.forEach(quiz => {
      if (quiz.quiz && quiz.quiz.questions) {
        quiz.quiz.questions.forEach(q => {
          newTotalQuestions++;
          if (q.questionType === 'recall') newTotalRecall++;
          if (q.questionType === 'application') newTotalApplication++;
        });
      }
    });
    
    const newApplicationPercentage = newTotalQuestions > 0 ? (newTotalApplication / newTotalQuestions * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL QUIZ DISTRIBUTION');
    console.log('='.repeat(60));
    console.log(`Total quiz questions: ${newTotalQuestions}`);
    console.log(`Recall questions: ${newTotalRecall} (${((newTotalRecall/newTotalQuestions)*100).toFixed(1)}%)`);
    console.log(`Application questions: ${newTotalApplication} (${newApplicationPercentage}%)`);
    console.log(`🎯 Target: 30% recall / ${targetApplicationPercentage}% application`);
    console.log(`✅ Added ${questionsAdded} additional application questions`);
    
    if (parseFloat(newApplicationPercentage) >= targetApplicationPercentage) {
      console.log('🎉 Target achieved! Application questions now at 70% or higher.');
    } else {
      console.log(`📈 Progress: ${newApplicationPercentage}% (target: ${targetApplicationPercentage}%)`);
    }
    
    console.log('='.repeat(60));
    console.log('✅ Migration Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addExtraApplicationQuestions();
