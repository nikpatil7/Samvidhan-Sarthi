// Add Application Questions to Reach Exactly 70% Target
// This script adds the final application questions to reach exactly 70% target
// Run with: node migrate-add-application-questions-70-percent.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question templates to reach 70%
const targetApplicationQuestions = [
  {
    question: 'A state government passes a law requiring all government employees to speak only the official state language. Is this constitutional?',
    options: [
      { text: 'Yes, states have complete authority over language policy', isCorrect: false, explanation: 'Incorrect. While states have language authority, Article 347 allows the President to recognize a language for official use. Complete language bans may violate constitutional principles.' },
      { text: 'No, it may violate constitutional principles of linguistic rights and federalism', isCorrect: true, explanation: 'Correct! While states have language authority, complete language bans may violate constitutional principles. The Constitution balances linguistic rights with federalism and national integration.' },
      { text: 'Only if the state legislature approves it unanimously', isCorrect: false, explanation: 'Incorrect. Unanimous approval does not make an unconstitutional law valid. The question is whether it violates constitutional principles of rights and federalism.' },
      { text: 'The Constitution does not address language requirements', isCorrect: false, explanation: 'Incorrect. The Constitution addresses language in Articles 347-351, providing for official languages and protecting linguistic minorities while allowing reasonable regulation.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How can constitutional principles be applied to resolve conflicts between environmental protection and economic development?',
    options: [
      { text: 'Economic development always takes precedence over environmental protection', isCorrect: false, explanation: 'Incorrect. Constitutional law requires balancing both interests. Neither automatically prevails; courts examine proportionality and sustainable development principles.' },
      { text: 'Environmental protection always takes precedence over economic development', isCorrect: false, explanation: 'Incorrect. While environmental protection is important, constitutional law requires balancing it with legitimate development interests through proportionality analysis.' },
      { text: 'Apply sustainable development principles balancing both interests proportionately', isCorrect: true, explanation: 'Correct! Constitutional law applies sustainable development principles, balancing environmental protection with economic development through proportionality and precautionary approaches.' },
      { text: 'Let the legislature decide without judicial review', isCorrect: false, explanation: 'Incorrect. Courts must review whether legislative actions comply with constitutional principles and balance competing interests proportionately.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles apply when a citizen challenges a government policy as discriminatory?',
    options: [
      { text: 'Only Article 14 equality principle applies', isCorrect: false, explanation: 'Incorrect. While Article 14 is fundamental, courts also consider other relevant principles like Article 15, Article 16, and specific provisions depending on the type of discrimination.' },
      { text: 'Multiple constitutional principles including Articles 14, 15, and 16 may apply', isCorrect: true, explanation: 'Correct! Discrimination challenges may involve multiple constitutional provisions: Article 14 (equality), Article 15 (prohibition of discrimination), Article 16 (equality of opportunity), and specific provisions based on the context.' },
      { text: 'Only specific anti-discrimination laws apply, not constitutional principles', isCorrect: false, explanation: 'Incorrect. Constitutional principles provide the foundation for anti-discrimination protections. Specific laws operate within this constitutional framework.' },
      { text: 'The government\'s stated purpose alone determines constitutionality', isCorrect: false, explanation: 'Incorrect. Courts examine both the stated purpose and whether the means used are proportionate and non-discriminatory under constitutional principles.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution protect democratic principles while allowing for efficient governance?',
    options: [
      { text: 'Democratic principles always override efficiency concerns', isCorrect: false, explanation: 'Incorrect. The Constitution balances democratic principles with governance efficiency through mechanisms like parliamentary procedures, federal structure, and fundamental rights.' },
      { text: 'Governance efficiency always overrides democratic principles', isCorrect: false, explanation: 'Incorrect. While efficiency is important, democratic principles are fundamental. The Constitution balances both through institutional design and rights protections.' },
      { text: 'Through institutional design that balances democratic participation with effective governance', isCorrect: true, explanation: 'Correct! The Constitution balances these through parliamentary democracy, federal structure, fundamental rights, independent judiciary, and checks and balances that ensure both democratic participation and effective governance.' },
      { text: 'The Constitution prioritizes one over the other', isCorrect: false, explanation: 'Incorrect. The Constitution does not prioritize one over the other but creates a balanced system where democratic principles and governance efficiency support each other through institutional design.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional remedy exists when government action violates multiple fundamental rights simultaneously?',
    options: [
      { text: 'The citizen must choose only one right to challenge', isCorrect: false, explanation: 'Incorrect. Citizens can challenge violations of multiple fundamental rights simultaneously. Courts can address all constitutional violations in a single proceeding.' },
      { text: 'The citizen can challenge all violated rights in a single proceeding', isCorrect: true, explanation: 'Correct! Citizens can challenge violations of multiple fundamental rights simultaneously. Courts have the authority to address all constitutional violations in a single proceeding, providing comprehensive relief.' },
      { text: 'Only the most serious violation can be challenged', isCorrect: false, explanation: 'Incorrect. All fundamental rights violations can be challenged simultaneously. Courts can address multiple violations and provide comprehensive remedies.' },
      { text: 'Multiple separate proceedings are required for each right', isCorrect: false, explanation: 'Incorrect. Courts can address multiple fundamental rights violations in a single proceeding, providing efficient and comprehensive relief for constitutional violations.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does constitutional law address the balance between individual privacy and national security?',
    options: [
      { text: 'National security always overrides individual privacy', isCorrect: false, explanation: 'Incorrect. While national security is important, constitutional law requires that privacy intrusions be necessary, proportionate, and subject to judicial oversight.' },
      { text: 'Individual privacy always overrides national security', isCorrect: false, explanation: 'Incorrect. While privacy is a fundamental right under Article 21, constitutional law recognizes that reasonable restrictions may be necessary for legitimate national security concerns.' },
      { text: 'Through proportionality analysis requiring necessity and judicial oversight', isCorrect: true, explanation: 'Correct! Constitutional law balances privacy and security through proportionality analysis, requiring that intrusions be necessary, proportionate to the threat, and subject to judicial oversight and procedural safeguards.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution addresses this balance through Article 21 (right to life and personal liberty), judicial interpretation of privacy rights, and emergency provisions with safeguards.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles guide the relationship between fundamental rights and directive principles?',
    options: [
      { text: 'Directive principles always override fundamental rights', isCorrect: false, explanation: 'Incorrect. Fundamental rights are enforceable by courts while directive principles are not. Courts generally give primacy to fundamental rights in case of conflict.' },
      { text: 'Fundamental rights always override directive principles', isCorrect: false, explanation: 'Incorrect. While fundamental rights are enforceable, courts have recognized that directive principles should guide interpretation of fundamental rights and legislation should harmonize both where possible.' },
      { text: 'Courts harmonize them where possible, giving primacy to enforceable rights when necessary', isCorrect: true, explanation: 'Correct! Courts attempt to harmonize fundamental rights and directive principles, recognizing that while rights are enforceable, directive principles should guide interpretation and legislation should balance both constitutional goals.' },
      { text: 'They are completely independent with no relationship', isCorrect: false, explanation: 'Incorrect. While they serve different functions, courts have recognized their complementary relationship and attempt to harmonize them in constitutional interpretation and legislation.' }
    ],
    questionType: 'application'
  }
];

async function addTargetApplicationQuestions() {
  try {
    console.log('🔄 Add Application Questions to Reach Exactly 70% Target');
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
    
    for (const quiz of quizzes) {
      if (questionsAdded >= neededApplicationQuestions) break;
      
      // Add question to this quiz
      const questionTemplate = targetApplicationQuestions[questionsAdded % targetApplicationQuestions.length];
      quiz.quiz.questions.push(questionTemplate);
      questionsAdded++;
      
      console.log(`  ✅ Added application question to "${quiz.title}"`);
      
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

addTargetApplicationQuestions();
