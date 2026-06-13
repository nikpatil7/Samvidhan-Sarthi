// Add Final Application Question to Reach 70% Target
// This script adds the final application question to reach exactly 70% target
// Run with: node migrate-add-application-questions-70-achieved.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question template
const final70Question = {
  question: 'How does the Constitution ensure that fundamental rights remain relevant to changing social conditions?',
  options: [
    { text: 'Fundamental rights are fixed and cannot adapt to changing conditions', isCorrect: false, explanation: 'Incorrect. The Constitution allows fundamental rights to adapt to changing social conditions through judicial interpretation, which gives rights contemporary meaning while maintaining their core principles.' },
    { text: 'Through judicial interpretation that adapts rights to contemporary needs', isCorrect: true, explanation: 'Correct! The Constitution ensures fundamental rights remain relevant through judicial interpretation, which adapts rights to changing social conditions while maintaining their core principles and constitutional values.' },
    { text: 'Only through constitutional amendments can rights adapt to change', isCorrect: false, explanation: 'Incorrect. While amendments can update rights, judicial interpretation is the primary mechanism for adapting fundamental rights to changing social conditions without requiring formal amendments.' },
    { text: 'The Constitution does not address changing social conditions', isCorrect: false, explanation: 'Incorrect. The Constitution addresses changing conditions through judicial interpretation, which gives fundamental rights contemporary meaning while maintaining their core constitutional principles.' }
  ],
  questionType: 'application'
};

async function addFinal70Question() {
  try {
    console.log('🔄 Add Final Application Question to Reach 70% Target');
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
    
    // Add question to first quiz
    const quiz = quizzes[0];
    quiz.quiz.questions.push(final70Question);
    await quiz.save();
    
    console.log(`  ✅ Added final application question to "${quiz.title}"`);
    
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
    console.log(`✅ Added 1 additional application question`);
    
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

addFinal70Question();
