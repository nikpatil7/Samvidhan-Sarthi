// Add Final Application Questions to Reach 70% Target
// This script adds the final application questions to reach exactly 70% target
// Run with: node migrate-add-application-questions-reach-70.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question templates
const finalTargetQuestions = [
  {
    question: 'How does the Constitution ensure that emergency powers don\'t undermine democratic institutions?',
    options: [
      { text: 'Emergency powers are absolute and cannot be questioned', isCorrect: false, explanation: 'Incorrect. Emergency powers under Article 352 require parliamentary approval and periodic review, ensuring they don\'t undermine democratic institutions permanently.' },
      { text: 'Through parliamentary approval, periodic review, and judicial oversight', isCorrect: true, explanation: 'Correct! The Constitution ensures emergency powers don\'t undermine democracy through parliamentary approval requirements, mandatory periodic review every 6 months, and judicial oversight of emergency actions.' },
      { text: 'Only through judicial review after emergency ends', isCorrect: false, explanation: 'Incorrect. While judicial review is important, the Constitution provides built-in safeguards during emergencies like parliamentary approval and periodic review.' },
      { text: 'The President has absolute discretion during emergencies', isCorrect: false, explanation: 'Incorrect. While the President proclaims emergencies, the Constitution requires parliamentary approval and periodic review, limiting presidential discretion.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles apply when a citizen\'s right to privacy conflicts with government surveillance for national security?',
    options: [
      { text: 'National security always overrides privacy rights', isCorrect: false, explanation: 'Incorrect. While national security is important, constitutional law requires that surveillance be necessary, proportionate, and subject to judicial oversight under Article 21 privacy protections.' },
      { text: 'Privacy rights always prevent any government surveillance', isCorrect: false, explanation: 'Incorrect. While privacy is fundamental, constitutional law recognizes that reasonable surveillance may be necessary for national security if it meets strict constitutional standards.' },
      { text: 'Surveillance must be necessary, proportionate, and subject to judicial oversight', isCorrect: true, explanation: 'Correct! Constitutional law requires that government surveillance be necessary for legitimate security purposes, proportionate to the threat, and subject to judicial oversight and procedural safeguards under Article 21.' },
      { text: 'The Constitution does not address this conflict', isCorrect: false, explanation: 'Incorrect. The Constitution addresses this through Article 21 (right to life and personal liberty), which courts have interpreted to include privacy protections subject to reasonable restrictions.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How can constitutional remedies protect citizens when fundamental rights are violated by private entities?',
    options: [
      { text: 'Constitutional remedies only apply against the government, not private entities', isCorrect: false, explanation: 'Incorrect. While fundamental rights primarily apply against the state, courts have developed the "state action" doctrine to extend constitutional remedies to certain private entities performing public functions.' },
      { text: 'Through the "state action" doctrine for private entities performing public functions', isCorrect: true, explanation: 'Correct! Courts apply the "state action" doctrine to extend constitutional remedies to private entities when they perform public functions or have significant state involvement, ensuring fundamental rights protection.' },
      { text: 'Only civil remedies through tort law are available', isCorrect: false, explanation: 'Incorrect. While civil remedies may be available, constitutional remedies through writ petitions may also be available under the "state action" doctrine in appropriate circumstances.' },
      { text: 'Private entities are completely exempt from constitutional requirements', isCorrect: false, explanation: 'Incorrect. While the primary obligation is on the state, courts have held that constitutional remedies may apply to private entities in certain circumstances through the "state action" doctrine.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles guide the balance between freedom of speech and social harmony?',
    options: [
      { text: 'Freedom of speech is absolute and cannot be limited for social harmony', isCorrect: false, explanation: 'Incorrect. Article 19(2) explicitly allows reasonable restrictions on freedom of speech for maintaining social harmony, public order, and other legitimate purposes.' },
      { text: 'Social harmony always justifies limiting freedom of speech', isCorrect: false, explanation: 'Incorrect. While social harmony is important, restrictions on speech must be reasonable, proportionate, and narrowly tailored to serve legitimate constitutional purposes.' },
      { text: 'Reasonable restrictions that are proportionate and necessary for legitimate purposes', isCorrect: true, explanation: 'Correct! Constitutional law balances speech and social harmony through Article 19(2), allowing only reasonable restrictions that are proportionate and necessary for legitimate purposes like public order and decency.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution addresses this balance through Article 19(1)(a) (freedom of speech) and Article 19(2) (reasonable restrictions), providing a framework for balancing speech with social harmony.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution protect the independence of the judiciary?',
    options: [
      { text: 'The Constitution does not specifically address judicial independence', isCorrect: false, explanation: 'Incorrect. The Constitution has several provisions protecting judicial independence including fixed tenure for judges, difficult impeachment procedures, and restrictions on their post-retirement activities.' },
      { text: 'Through security of tenure, impeachment procedures, and administrative autonomy', isCorrect: true, explanation: 'Correct! The Constitution protects judicial independence through security of tenure (removal only through impeachment), difficult impeachment process, and administrative autonomy in judicial appointments and conduct.' },
      { text: 'Only through the power of contempt of court', isCorrect: false, explanation: 'Incorrect. While contempt powers are important, the Constitution provides multiple structural protections including tenure security, impeachment procedures, and administrative autonomy.' },
      { text: 'Judicial independence depends entirely on the executive branch', isCorrect: false, explanation: 'Incorrect. The Constitution creates structural independence through tenure security, impeachment procedures, and administrative autonomy, reducing dependence on the executive branch.' }
    ],
    questionType: 'application'
  }
];

async function addFinalTargetQuestions() {
  try {
    console.log('🔄 Add Final Application Questions to Reach 70% Target');
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
      const questionTemplate = finalTargetQuestions[questionsAdded % finalTargetQuestions.length];
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

addFinalTargetQuestions();
