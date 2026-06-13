// Add More Application Questions to Reach 70% Target
// This script adds additional application questions to quizzes to reach the 70% target
// Run with: node migrate-add-application-questions-final.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Additional application question templates
const additionalApplicationQuestions = {
  'fundamental-rights': [
    {
      question: 'A government official demands to search your house without a warrant, claiming national security. How should you respond?',
      options: [
        { text: 'Allow the search immediately to cooperate with authorities', isCorrect: false, explanation: 'Incorrect. Article 21 protects personal liberty and Article 22 requires proper procedures for arrest and detention. Searches require warrants under constitutional principles.' },
        { text: 'Refuse the search and demand a warrant, citing your constitutional rights', isCorrect: true, explanation: 'Correct! Article 21 protects life and personal liberty. Searches require warrants following proper procedures. You have the right to demand constitutional compliance.' },
        { text: 'Contact a lawyer but allow the search to avoid conflict', isCorrect: false, explanation: 'Incorrect. While contacting a lawyer is good, you should not allow unconstitutional searches. Your rights protect you from warrantless searches.' },
        { text: 'Physically resist the search to protect your property', isCorrect: false, explanation: 'Incorrect. Physical resistance could lead to legal trouble. The correct approach is to refuse the search and demand proper constitutional procedures be followed.' }
      ],
      questionType: 'application'
    },
    {
      question: 'Your college bans students from organizing peaceful protests on campus. Which constitutional right is being violated?',
      options: [
        { text: 'Right to Equality under Article 14', isCorrect: false, explanation: 'Incorrect. While Article 14 guarantees equality, the specific right being violated here is the freedom of speech and assembly.' },
        { text: 'Right to Freedom of Speech and Assembly under Article 19', isCorrect: true, explanation: 'Correct! Article 19(1)(a) guarantees freedom of speech and expression, and Article 19(1)(b) guarantees the right to assemble peaceably and without arms. Banning peaceful protests violates these rights.' },
        { text: 'Right to Life under Article 21', isCorrect: false, explanation: 'Incorrect. While Article 21 is fundamental, the specific violation here is of the freedoms guaranteed under Article 19.' },
        { text: 'Right to Constitutional Remedies under Article 32', isCorrect: false, explanation: 'Incorrect. Article 32 provides the remedy, but the right being violated is the freedom of speech and assembly under Article 19.' }
      ],
      questionType: 'application'
    }
  ],
  'constitutional-principles': [
    {
      question: 'A state government passes a law that conflicts with a central government law on the same subject. How should this conflict be resolved?',
      options: [
        { text: 'The state law automatically prevails within the state', isCorrect: false, explanation: 'Incorrect. Under the doctrine of parliamentary supremacy and the constitutional scheme, central laws prevail in case of conflict on subjects in the Union List or Concurrent List.' },
        { text: 'The central law prevails under constitutional supremacy principles', isCorrect: true, explanation: 'Correct! Under Article 246 and the constitutional scheme, central laws prevail in case of conflict. The Constitution establishes a hierarchy where central law has supremacy in most cases.' },
        { text: 'Both laws remain valid and citizens can choose which to follow', isCorrect: false, explanation: 'Incorrect. Constitutional law does not allow conflicting laws to coexist. There must be a clear hierarchy, and central law generally prevails.' },
        { text: 'The President decides which law should prevail', isCorrect: false, explanation: 'Incorrect. While the President has certain powers, the resolution of legislative conflicts follows constitutional principles and judicial interpretation, not presidential discretion.' }
      ],
      questionType: 'application'
    },
    {
      question: 'A citizen feels their fundamental right has been violated by a government action. What is the most effective constitutional remedy?',
      options: [
        { text: 'File a complaint with the local police station', isCorrect: false, explanation: 'Incorrect. Police complaints deal with criminal matters, not constitutional violations. Constitutional remedies require judicial intervention.' },
        { text: 'Approach the Supreme Court directly under Article 32', isCorrect: true, explanation: 'Correct! Article 32 provides the right to move the Supreme Court directly for enforcement of fundamental rights. Dr. Ambedkar called this the "heart and soul" of the Constitution.' },
        { text: 'Write to the Prime Minister requesting intervention', isCorrect: false, explanation: 'Incorrect. While administrative remedies may help, constitutional violations require judicial remedies through the courts under Articles 32 or 226.' },
        { text: 'Organize a public protest to raise awareness', isCorrect: false, explanation: 'Incorrect. While protests may draw attention, they are not a constitutional remedy. The proper path is through judicial channels under Articles 32 or 226.' }
      ],
      questionType: 'application'
    }
  ],
  'default': [
    {
      question: 'How would you apply constitutional principles to resolve a dispute between individual rights and public interest?',
      options: [
        { text: 'Individual rights always take precedence over public interest', isCorrect: false, explanation: 'Incorrect. Constitutional law balances individual rights with public interest through the doctrine of reasonable restrictions under Article 19(2).' },
        { text: 'Apply the principle of reasonable restrictions - rights can be limited for legitimate public interest', isCorrect: true, explanation: 'Correct! Constitutional law uses the doctrine of reasonable restrictions. Individual rights can be limited for legitimate public interest purposes like sovereignty, security, public order, etc.' },
        { text: 'Public interest always overrides individual rights', isCorrect: false, explanation: 'Incorrect. While public interest is important, individual rights are fundamental. The Constitution balances both through reasonable restrictions, not absolute supremacy of either.' },
        { text: 'Let the legislature decide without judicial review', isCorrect: false, explanation: 'Incorrect. Judicial review is a fundamental constitutional principle. Courts must examine whether restrictions on rights are reasonable and proportionate to the public interest goal.' }
      ],
      questionType: 'application'
    },
    {
      question: 'A new law is challenged for being unconstitutional. What factors should the court consider?',
      options: [
        { text: 'Only whether the law was passed by majority vote', isCorrect: false, explanation: 'Incorrect. Constitutional validity is not determined by majority vote alone. Courts examine whether the law violates constitutional principles and rights.' },
        { text: 'Whether the law violates fundamental rights or exceeds legislative competence', isCorrect: true, explanation: 'Correct! Courts examine two main aspects: whether the law violates fundamental rights and whether the legislature had the competence to pass the law under the constitutional scheme.' },
        { text: 'Only the economic impact of the law', isCorrect: false, explanation: 'Incorrect. While economic impact may be relevant, constitutional validity primarily depends on compliance with fundamental rights and legislative competence.' },
        { text: 'The political party that passed the law', isCorrect: false, explanation: 'Incorrect. Constitutional validity is determined by legal principles, not political considerations. Courts examine the law\'s compliance with constitutional provisions.' }
      ],
      questionType: 'application'
    }
  ]
};

async function addMoreApplicationQuestions() {
  try {
    console.log('🔄 Add More Application Questions to Reach 70% Target');
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
      
      // Get appropriate questions based on topic category
      const topicCategory = quiz.category || 'default';
      const availableQuestions = additionalApplicationQuestions[topicCategory] || additionalApplicationQuestions['default'];
      
      // Add questions to this quiz
      for (let i = 0; i < Math.min(questionsPerQuiz, availableQuestions.length); i++) {
        if (questionsAdded >= neededApplicationQuestions) break;
        
        const questionTemplate = availableQuestions[i % availableQuestions.length];
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

addMoreApplicationQuestions();
