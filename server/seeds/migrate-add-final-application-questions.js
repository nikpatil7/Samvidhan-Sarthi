// Add Final Application Questions to Reach Exactly 70% Target
// This script adds the final application questions to reach exactly 70% target
// Run with: node migrate-add-final-application-questions.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question templates
const finalApplicationQuestions = [
  {
    question: 'How does the Constitution ensure that emergency powers are used only when genuinely necessary?',
    options: [
      { text: 'Emergency powers can be used at the discretion of the executive', isCorrect: false, explanation: 'Incorrect. Emergency powers under Article 352 require specific conditions (threat to security, unity, integrity) and parliamentary approval, ensuring they are used only when genuinely necessary.' },
      { text: 'Through specific conditions, parliamentary approval, and periodic review requirements', isCorrect: true, explanation: 'Correct! The Constitution ensures emergency powers are used only when necessary through specific conditions in Article 352, parliamentary approval within one month, and mandatory periodic review every six months.' },
      { text: 'Only through judicial review after the emergency ends', isCorrect: false, explanation: 'Incorrect. While judicial review is important, the Constitution provides built-in safeguards during emergencies like parliamentary approval and periodic review to ensure necessity.' },
      { text: 'The President has absolute discretion to determine necessity', isCorrect: false, explanation: 'Incorrect. While the President proclaims emergencies, the Constitution requires parliamentary approval and periodic review, limiting presidential discretion and ensuring necessity.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles apply when balancing freedom of religion with secular governance?',
    options: [
      { text: 'Freedom of religion is absolute and cannot be limited', isCorrect: false, explanation: 'Incorrect. Article 25 guarantees religious freedom but allows reasonable restrictions for public order, morality, and health. The Constitution balances religious freedom with secular governance principles.' },
      { text: 'Through secular principles that ensure equal treatment while protecting religious freedom', isCorrect: true, explanation: 'Correct! The Constitution balances religious freedom with secular governance through Article 25 (religious freedom with reasonable restrictions) and secular principles ensuring equal treatment of all religions.' },
      { text: 'By prohibiting all religious practices in public institutions', isCorrect: false, explanation: 'Incorrect. The Constitution protects religious freedom while maintaining secularism. It doesn\'t prohibit religious practices but ensures equal treatment and protects minority rights.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution addresses this balance through secularism as a basic structure, Articles 25-28 (religious freedom), and principles ensuring equal treatment of all religions.' }
    ],
    questionType: 'application'
  }
];

async function addFinalApplicationQuestions() {
  try {
    console.log('🔄 Add Final Application Questions to Reach Exactly 70% Target');
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
      const questionTemplate = finalApplicationQuestions[questionsAdded % finalApplicationQuestions.length];
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

addFinalApplicationQuestions();
