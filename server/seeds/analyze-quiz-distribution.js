// Analyze current quiz question distribution
// Run with: node analyze-quiz-distribution.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function analyzeQuizDistribution() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    const quizContent = await Content.find({ type: 'quiz' });
    console.log(`📝 Found ${quizContent.length} quiz content items`);
    
    let totalQuestions = 0;
    let recallQuestions = 0;
    let applicationQuestions = 0;
    let unclassifiedQuestions = 0;
    
    const quizDetails = [];
    
    quizContent.forEach(q => {
      if (q.quiz && q.quiz.questions) {
        const quizDetail = {
          title: q.title,
          total: q.quiz.questions.length,
          recall: 0,
          application: 0,
          unclassified: 0
        };
        
        q.quiz.questions.forEach(qn => {
          totalQuestions++;
          if (qn.questionType === 'recall') {
            recallQuestions++;
            quizDetail.recall++;
          } else if (qn.questionType === 'application') {
            applicationQuestions++;
            quizDetail.application++;
          } else {
            unclassifiedQuestions++;
            quizDetail.unclassified++;
          }
        });
        
        quizDetails.push(quizDetail);
      }
    });
    
    console.log('\n📊 QUIZ QUESTION DISTRIBUTION');
    console.log('='.repeat(60));
    console.log(`Total quiz questions: ${totalQuestions}`);
    console.log(`Recall questions: ${recallQuestions} (${((recallQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Application questions: ${applicationQuestions} (${((applicationQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Unclassified questions: ${unclassifiedQuestions} (${((unclassifiedQuestions/totalQuestions)*100).toFixed(1)}%)`);
    
    console.log('\n📋 QUIZ DETAILS');
    console.log('='.repeat(60));
    quizDetails.forEach(qd => {
      console.log(`${qd.title}:`);
      console.log(`  Total: ${qd.total}, Recall: ${qd.recall}, Application: ${qd.application}, Unclassified: ${qd.unclassified}`);
    });
    
    console.log('\n🎯 TARGET: 30% recall / 70% application');
    console.log(`Current: ${((recallQuestions/totalQuestions)*100).toFixed(1)}% recall / ${((applicationQuestions/totalQuestions)*100).toFixed(1)}% application`);
    
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

analyzeQuizDistribution();
