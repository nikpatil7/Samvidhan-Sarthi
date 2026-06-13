// Add Final Application Questions to Reach 70% Target
// This script adds the final application questions to reach exactly 70% target
// Run with: node migrate-add-application-questions-final-70.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final application question templates
const reach70Questions = [
  {
    question: 'How does the Constitution ensure that fundamental rights are not merely theoretical but practically enforceable?',
    options: [
      { text: 'Rights are theoretical and depend on government goodwill', isCorrect: false, explanation: 'Incorrect. The Constitution makes rights practically enforceable through Article 32 (Supreme Court) and Article 226 (High Courts) which provide direct access to courts for rights enforcement.' },
      { text: 'Through direct access to courts via Article 32 and Article 226', isCorrect: true, explanation: 'Correct! The Constitution makes rights practically enforceable by providing direct access to the Supreme Court under Article 32 and High Courts under Article 226 for constitutional remedies when rights are violated.' },
      { text: 'Only through legislative implementation of rights', isCorrect: false, explanation: 'Incorrect. While legislative implementation is important, the Constitution provides direct judicial enforcement through writ jurisdiction, making rights immediately enforceable.' },
      { text: 'Rights are enforceable only through executive action', isCorrect: false, explanation: 'Incorrect. The Constitution provides judicial enforcement mechanisms that don\'t depend on executive action. Citizens can directly approach courts for rights enforcement.' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional principles apply when balancing economic development with environmental protection?',
    options: [
      { text: 'Economic development always takes precedence over environmental protection', isCorrect: false, explanation: 'Incorrect. Constitutional law requires balancing both interests. Neither automatically prevails; courts apply sustainable development principles and proportionality analysis.' },
      { text: 'Environmental protection always takes precedence over economic development', isCorrect: false, explanation: 'Incorrect. While environmental protection is constitutionally important, courts balance it with legitimate development interests through proportionality and sustainable development principles.' },
      { text: 'Sustainable development principles balancing both interests proportionately', isCorrect: true, explanation: 'Correct! Constitutional law applies sustainable development principles, balancing environmental protection with economic development through proportionality analysis, precautionary approaches, and intergenerational equity.' },
      { text: 'The legislature has unlimited discretion to decide this balance', isCorrect: false, explanation: 'Incorrect. While legislatures have policy discretion, courts review whether their decisions comply with constitutional principles and balance competing interests proportionately.' }
    ],
    questionType: 'application'
  },
  {
    question: 'How does the Constitution protect the rights of religious minorities while maintaining secularism?',
    options: [
      { text: 'By giving special privileges to majority religion', isCorrect: false, explanation: 'Incorrect. The Constitution protects minority rights while maintaining secularism by ensuring equal treatment of all religions and protecting minority cultural and educational rights.' },
      { text: 'Through Articles 29-30 protecting minority rights and secular principles', isCorrect: true, explanation: 'Correct! The Constitution balances minority rights and secularism through Articles 29-30 (protecting minority cultural and educational rights) while maintaining secular principles that ensure equal treatment of all religions.' },
      { text: 'By prohibiting all religious practices in public institutions', isCorrect: false, explanation: 'Incorrect. The Constitution protects religious freedom while maintaining secularism. It doesn\'t prohibit religious practices but ensures equal treatment and protects minority rights.' },
      { text: 'The Constitution does not address this balance', isCorrect: false, explanation: 'Incorrect. The Constitution extensively addresses this balance through secularism as a basic structure, Articles 25-28 (religious freedom), and Articles 29-30 (minority rights).' }
    ],
    questionType: 'application'
  },
  {
    question: 'What constitutional remedies are available when a citizen\'s fundamental rights are violated by private entities?',
    options: [
      { text: 'No remedies - constitutional rights only apply against the state', isCorrect: false, explanation: 'Incorrect. While rights primarily apply against the state, courts have developed the "state action" doctrine to extend constitutional remedies to certain private entities performing public functions.' },
      { text: 'Constitutional remedies may apply under the "state action" doctrine', isCorrect: true, explanation: 'Correct! Courts apply the "state action" doctrine to extend constitutional remedies to private entities when they perform public functions or have significant state involvement, ensuring rights protection.' },
      { text: 'Only criminal prosecution of responsible individuals', isCorrect: false, explanation: 'Incorrect. While criminal prosecution may be possible, constitutional remedies through writ petitions may also be available under the "state action" doctrine in appropriate circumstances.' },
      { text: 'Only civil remedies through tort law are available', isCorrect: false, explanation: 'Incorrect. While civil remedies may be available, constitutional remedies through writ petitions may also be available under the "state action" doctrine for certain private entity violations.' }
    ],
    questionType: 'application'
  }
];

async function addReach70Questions() {
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
      const questionTemplate = reach70Questions[questionsAdded % reach70Questions.length];
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

addReach70Questions();
