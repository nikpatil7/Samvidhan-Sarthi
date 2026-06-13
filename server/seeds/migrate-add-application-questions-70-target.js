// Add Final Application Questions to Reach 70% Target
// This script adds the final application questions to reach exactly 70% target
// Run with: node migrate-add-application-questions-70-target.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question templates
const target70Questions = [
  {
    question: 'How does the Constitution balance individual rights with national security concerns?',
    options: [
      { text: 'Individual rights always take precedence over national security', isCorrect: false, explanation: 'Incorrect. While individual rights are fundamental, the Constitution recognizes that reasonable restrictions may be necessary for legitimate national security purposes under Article 19(2).' },
      { text: 'National security always overrides individual rights', isCorrect: false, explanation: 'Incorrect. While national security is important, restrictions on rights must be reasonable, proportionate, and necessary. The Constitution balances both through judicial review.' },
      { text: 'Through reasonable restrictions that are proportionate and necessary for legitimate security needs', isCorrect: true, explanation: 'Correct! The Constitution balances rights and security through Article 19(2) which allows reasonable restrictions that are proportionate and necessary for legitimate purposes like national security and public order.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution addresses this balance through Article 19(2) restrictions, Article 22 emergency provisions, and judicial interpretation that requires proportionality analysis.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles apply when resolving conflicts between freedom of speech and religious sentiments?',
    options: [
      { text: 'Freedom of speech is absolute and cannot be restricted', isCorrect: false, explanation: 'Incorrect. Article 19(2) allows reasonable restrictions on speech including for maintaining public order and decency, which may involve balancing with religious sentiments.' },
      { text: 'Religious sentiments always override freedom of speech', isCorrect: false, explanation: 'Incorrect. While religious sentiments are important, freedom of speech is also fundamental. Courts balance these through proportionality analysis and reasonable restrictions.' },
      { text: 'Courts balance both through proportionality and reasonable restrictions', isCorrect: true, explanation: 'Correct! Courts balance freedom of speech and religious sentiments through proportionality analysis, ensuring restrictions are reasonable, necessary, and proportionate to maintain social harmony.' },
      { text: 'The legislature has unlimited discretion to decide this balance', isCorrect: false, explanation: 'Incorrect. While legislatures make policy, courts review whether their decisions balance constitutional rights proportionately and are reasonable under Article 19(2).' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution ensure that directive principles do not remain merely aspirational?',
    options: [
      { text: 'Directive principles are merely aspirational and not enforceable', isCorrect: false, explanation: 'Incorrect. While directive principles are not directly enforceable, courts have developed mechanisms to implement them through interpretation of fundamental rights and policy review.' },
      { text: 'Through judicial interpretation and legislative implementation over time', isCorrect: true, explanation: 'Correct! Courts have given directive principles effect by interpreting fundamental rights in light of them, requiring states to implement them in legislation, and reviewing government policies for compliance.' },
      { text: 'Only through constitutional amendments', isCorrect: false, explanation: 'Incorrect. While amendments can help, courts have developed mechanisms to give effect to directive principles without requiring amendments, through interpretation and policy review.' },
      { text: 'Directive principles have no practical effect on governance', isCorrect: false, explanation: 'Incorrect. While not directly enforceable, directive principles significantly influence governance through judicial interpretation, legislative policy, and executive decision-making.' }
    ],
    questionType: 'application'
  }
];

async function addTarget70Questions() {
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
      const questionTemplate = target70Questions[questionsAdded % target70Questions.length];
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

addTarget70Questions();
