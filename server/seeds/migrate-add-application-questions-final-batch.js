// Add Final Batch of Application Questions to Reach 70% Target
// This script adds the final batch of application questions to reach the 70% target
// Run with: node migrate-add-application-questions-final-batch.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final batch of application question templates
const finalApplicationQuestions = [
  {
    question: 'A citizen is denied a government job based on their caste. Which constitutional provision protects them?',
    options: [
      { text: 'Article 14 - Right to Equality', isCorrect: true, explanation: 'Correct! Article 14 guarantees equality before law and equal protection of laws. Denial of government jobs based on caste violates this fundamental right to equality.' },
      { text: 'Article 19 - Right to Freedom', isCorrect: false, explanation: 'Incorrect. While Article 19 protects certain freedoms, the specific protection against caste-based discrimination in employment comes from Article 14 and Article 16.' },
      { text: 'Article 21 - Right to Life', isCorrect: false, explanation: 'Incorrect. Article 21 protects life and personal liberty, but the specific protection against caste discrimination comes from Article 14 and Article 16.' },
      { text: 'Article 32 - Constitutional Remedies', isCorrect: false, explanation: 'Incorrect. Article 32 provides the remedy, but the substantive right being violated is equality under Article 14 and Article 16.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How can a citizen challenge a law that violates their fundamental rights?',
    options: [
      { text: 'Only through voting in the next election', isCorrect: false, explanation: 'Incorrect. While voting is important, citizens have direct constitutional remedies through the courts when their fundamental rights are violated.' },
      { text: 'By filing a writ petition under Article 32 or Article 226', isCorrect: true, explanation: 'Correct! Citizens can directly approach the Supreme Court under Article 32 or High Courts under Article 226 through writ petitions when their fundamental rights are violated.' },
      { text: 'By writing to the President requesting intervention', isCorrect: false, explanation: 'Incorrect. While the President has certain powers, the constitutional remedy for rights violations is through judicial channels, not executive requests.' },
      { text: 'Through public protests and media campaigns only', isCorrect: false, explanation: 'Incorrect. While protests may raise awareness, the constitutional remedy for rights violations is through judicial channels via writ petitions.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principle limits the government\'s power to amend the Constitution?',
    options: [
      { text: 'There are no limits - Parliament can amend any part of the Constitution', isCorrect: false, explanation: 'Incorrect. The Kesavananda Bharati case established that Parliament cannot amend the "basic structure" of the Constitution, placing limits on amendment power.' },
      { text: 'The Basic Structure doctrine limits Parliament\'s amendment power', isCorrect: true, explanation: 'Correct! The Basic Structure doctrine, established in Kesavananda Bharati case, holds that Parliament cannot amend the fundamental features of the Constitution like democracy, secularism, federalism, etc.' },
      { text: 'Only the President can limit Parliament\'s amendment power', isCorrect: false, explanation: 'Incorrect. The limitation comes from judicial interpretation of the Constitution itself, not presidential authority. The Basic Structure doctrine is a judicial creation.' },
      { text: 'State governments can veto constitutional amendments', isCorrect: false, explanation: 'Incorrect. State governments do not have veto power over constitutional amendments. The limitation comes from the Basic Structure doctrine established by the Supreme Court.' }
    ],
    questionType: 'application'
  },
  {
    question: 'If a law violates both fundamental rights and directive principles, how should the court resolve the conflict?',
    options: [
      { text: 'Directive principles always prevail over fundamental rights', isCorrect: false, explanation: 'Incorrect. Fundamental rights are enforceable by courts, while directive principles are not. Courts generally prioritize fundamental rights in case of conflict.' },
      { text: 'Fundamental rights prevail as they are enforceable by courts', isCorrect: true, explanation: 'Correct! Fundamental rights are justiciable (enforceable by courts) while directive principles are not. In case of conflict, courts generally give primacy to fundamental rights.' },
      { text: 'The court should balance them equally regardless of enforceability', isCorrect: false, explanation: 'Incorrect. The constitutional scheme gives fundamental rights primacy as they are enforceable, while directive principles are guidelines for policy-making.' },
      { text: 'The legislature should decide which takes precedence', isCorrect: false, explanation: 'Incorrect. While the legislature creates laws, courts must determine their constitutionality. The constitutional scheme gives fundamental rights primacy due to their enforceability.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional protection exists against arbitrary arrest and detention?',
    options: [
      { text: 'No specific protection - arrest is at police discretion', isCorrect: false, explanation: 'Incorrect. Article 22 provides specific protections against arbitrary arrest and detention, including the right to be informed of charges and the right to legal representation.' },
      { text: 'Article 22 provides protection against arbitrary arrest and detention', isCorrect: true, explanation: 'Correct! Article 22 provides several protections: the right to be informed of arrest grounds, the right to consult a lawyer, and the requirement that arrested persons be produced before a magistrate within 24 hours.' },
      { text: 'Only Article 21 protects against arbitrary detention', isCorrect: false, explanation: 'Incorrect. While Article 21 protects life and personal liberty, Article 22 provides specific procedural protections against arbitrary arrest and detention.' },
      { text: 'Protection comes only from criminal procedure codes, not the Constitution', isCorrect: false, explanation: 'Incorrect. While criminal procedure codes provide detailed procedures, the fundamental protection against arbitrary arrest comes from Article 22 of the Constitution.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution protect religious freedom while allowing for social reform?',
    options: [
      { text: 'Religious freedom is absolute and cannot be limited for any reason', isCorrect: false, explanation: 'Incorrect. While religious freedom is a fundamental right under Article 25, it can be limited for social reform and public order under reasonable restrictions.' },
      { text: 'Article 25 allows religious freedom subject to public order and social reform', isCorrect: true, explanation: 'Correct! Article 25 guarantees religious freedom but allows reasonable restrictions for public order, morality, and health. It also permits state intervention for social reform and religious welfare.' },
      { text: 'Social reform always takes precedence over religious freedom', isCorrect: false, explanation: 'Incorrect. While social reform is important, religious freedom is a fundamental right. The Constitution balances both through reasonable restrictions rather than absolute precedence.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. Article 25 specifically addresses this balance by protecting religious freedom while allowing state intervention for social reform and opening Hindu religious institutions to all classes.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional remedy is available when a fundamental right is violated by a private entity?',
    options: [
      { text: 'No remedy - constitutional rights only apply against the state', isCorrect: false, explanation: 'Incorrect. While fundamental rights primarily apply against the state, some rights like Article 21 have been interpreted to apply against private entities through the "state action" doctrine.' },
      { text: 'Writ petitions may be available if the private entity performs public functions', isCorrect: true, explanation: 'Correct! Through the "state action" doctrine, courts have held that constitutional remedies may be available against private entities performing public functions or when there is significant state involvement.' },
      { text: 'Only civil remedies through tort law are available', isCorrect: false, explanation: 'Incorrect. While civil remedies may be available, constitutional remedies through writ petitions may also be available under the "state action" doctrine in certain circumstances.' },
      { text: 'Criminal prosecution is the only remedy', isCorrect: false, explanation: 'Incorrect. Criminal prosecution may be possible in some cases, but constitutional remedies through writ petitions may also be available under appropriate circumstances.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does judicial review strengthen constitutional democracy?',
    options: [
      { text: 'It weakens democracy by allowing unelected judges to override elected representatives', isCorrect: false, explanation: 'Incorrect. Judicial review strengthens democracy by ensuring that elected representatives act within constitutional limits and protect fundamental rights.' },
      { text: 'It ensures government actions comply with constitutional limits and protects rights', isCorrect: true, explanation: 'Correct! Judicial review strengthens constitutional democracy by ensuring that all government actions comply with constitutional provisions and protecting fundamental rights from potential majoritarian excesses.' },
      { text: 'It has no significant impact on democratic functioning', isCorrect: false, explanation: 'Incorrect. Judicial review is essential for constitutional democracy, providing a check on government power and ensuring compliance with constitutional principles.' },
      { text: 'It should be eliminated to give Parliament absolute power', isCorrect: false, explanation: 'Incorrect. Eliminating judicial review would undermine constitutional democracy by removing essential checks on government power and protections for fundamental rights.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What role does the Constitution play in protecting minority rights?',
    options: [
      { text: 'The Constitution does not specifically address minority rights', isCorrect: false, explanation: 'Incorrect. The Constitution has specific provisions protecting minority rights, including Article 29 (cultural and educational rights) and Article 30 (right of minorities to establish educational institutions).' },
      { text: 'Articles 29 and 30 specifically protect cultural and educational rights of minorities', isCorrect: true, explanation: 'Correct! Article 29 protects minorities\' right to conserve their culture, language, and script. Article 30 gives minorities the right to establish and administer educational institutions of their choice.' },
      { text: 'Minority protection is left entirely to state governments', isCorrect: false, explanation: 'Incorrect. While states have responsibilities, the Constitution provides fundamental protections for minority rights through Articles 29 and 30, which are enforceable nationwide.' },
      { text: 'Minority rights are protected only through ordinary legislation', isCorrect: false, explanation: 'Incorrect. Minority rights are constitutionally protected through Articles 29 and 30, making them fundamental rights that cannot be easily overridden by ordinary legislation.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution balance federalism with national unity?',
    options: [
      { text: 'By giving absolute power to the central government', isCorrect: false, explanation: 'Incorrect. The Constitution balances federalism and national unity through a division of powers between central and state governments, not absolute central power.' },
      { text: 'Through division of powers and emergency provisions for national unity', isCorrect: true, explanation: 'Correct! The Constitution balances federalism through division of powers (Union, State, Concurrent lists) while maintaining national unity through emergency provisions and central supremacy in certain areas.' },
      { text: 'By giving absolute power to state governments', isCorrect: false, explanation: 'Incorrect. While states have significant powers, the Constitution maintains national unity through central supremacy in key areas and emergency provisions.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution extensively addresses this balance through the federal structure, division of powers, emergency provisions, and mechanisms for center-state cooperation.' }
    ],
    questionType: 'application'
  }
];

async function addFinalApplicationQuestions() {
  try {
    console.log('🔄 Add Final Batch of Application Questions to Reach 70% Target');
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
      for (let i = 0; i < Math.min(questionsPerQuiz, finalApplicationQuestions.length); i++) {
        if (questionsAdded >= neededApplicationQuestions) break;
        
        const questionTemplate = finalApplicationQuestions[i % finalApplicationQuestions.length];
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

addFinalApplicationQuestions();
