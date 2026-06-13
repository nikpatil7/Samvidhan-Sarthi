// Phase 1.2: Add More Application Questions to Reach 70% Target
// This script adds additional application questions to reach the 70% target
// Run with: node migrate-phase1-add-more-application-questions.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Additional application question templates
const additionalApplicationQuestions = [
  {
    question: 'A citizen is arrested without being informed of the grounds of arrest. Which fundamental right protects them?',
    options: [
      { text: 'Article 14 - Right to Equality', isCorrect: false },
      { text: 'Article 22 - Protection against arrest and detention', isCorrect: true },
      { text: 'Article 21 - Right to Life', isCorrect: false },
      { text: 'Article 19 - Right to Freedom', isCorrect: false }
    ],
    explanation: 'Article 22 provides protection against arrest and detention, including the right to be informed of grounds of arrest and the right to consult a legal practitioner.'
  },
  {
    question: 'The government declares a national emergency during peacetime due to economic crisis. Is this constitutional?',
    options: [
      { text: 'Yes, the President can declare emergency for any reason', isCorrect: false },
      { text: 'No, Article 352 requires war or armed rebellion', isCorrect: true },
      { text: 'Yes, Parliament can approve any emergency', isCorrect: false },
      { text: 'No, only state legislature can declare emergency', isCorrect: false }
    ],
    explanation: 'Article 352 allows National Emergency only on grounds of war, external aggression, or armed rebellion. Economic crisis alone is not a valid ground.'
  },
  {
    question: 'A state law conflicts with a central law on a subject in the Concurrent List. Which law prevails?',
    options: [
      { text: 'State law always prevails', isCorrect: false },
      { text: 'Central law prevails (Article 254)', isCorrect: true },
      { text: 'Both laws are equally valid', isCorrect: false },
      { text: 'President decides which law prevails', isCorrect: false }
    ],
    explanation: 'Under Article 254, if a state law on a Concurrent List subject conflicts with a central law, the central law prevails. The state law becomes void to the extent of repugnancy.'
  },
  {
    question: 'Can a citizen directly approach the Supreme Court if their Fundamental Rights are violated?',
    options: [
      { text: 'No, must first approach High Court', isCorrect: false },
      { text: 'Yes, under Article 32 (Right to Constitutional Remedies)', isCorrect: true },
      { text: 'No, must approach the President', isCorrect: false },
      { text: 'Yes, but only through a lawyer', isCorrect: false }
    ],
    explanation: 'Article 32 provides the right to move the Supreme Court directly for enforcement of Fundamental Rights. Dr. Ambedkar called this the "heart and soul" of the Constitution.'
  },
  {
    question: 'A religious group wants to establish educational institutions. Which constitutional provision supports this?',
    options: [
      { text: 'Article 19 - Right to Freedom', isCorrect: false },
      { text: 'Article 30 - Right of minorities to establish educational institutions', isCorrect: true },
      { text: 'Article 45 - Free education', isCorrect: false },
      { text: 'Article 51A - Fundamental Duties', isCorrect: false }
    ],
    explanation: 'Article 30 gives minorities (religious and linguistic) the right to establish and administer educational institutions of their choice.'
  },
  {
    question: 'The President withholds assent to a bill passed by Parliament. What happens to the bill?',
    options: [
      { text: 'The bill becomes law anyway', isCorrect: false },
      { text: 'The bill ends and does not become law', isCorrect: true },
      { text: 'The bill goes back to Parliament for reconsideration', isCorrect: false },
      { text: 'The Supreme Court decides on the bill', isCorrect: false }
    ],
    explanation: 'If the President withholds assent, the bill ends and does not become law. Unlike a veto that can be overridden, presidential withholding of assent is absolute.'
  },
  {
    question: 'Can Fundamental Rights be amended by Parliament?',
    options: [
      { text: 'No, Fundamental Rights cannot be amended', isCorrect: false },
      { text: 'Yes, but must not violate Basic Structure doctrine', isCorrect: true },
      { text: 'Yes, Parliament has unlimited power', isCorrect: false },
      { text: 'No, only the President can amend them', isCorrect: false }
    ],
    explanation: 'Parliament can amend Fundamental Rights under Article 368, but the Basic Structure doctrine (established in Kesavananda Bharati case) limits this power.'
  },
  {
    question: 'A state government wants to implement reservation in promotions for SC/ST employees. Is this constitutional?',
    options: [
      { text: 'Yes, always constitutional', isCorrect: false },
      { text: 'Requires collection of quantifiable data showing inadequacy', isCorrect: true },
      { text: 'No, reservation in promotions is never allowed', isCorrect: false },
      { text: 'Only central government can do this', isCorrect: false }
    ],
    explanation: 'The Supreme Court (Indra Sawhney case) ruled that reservation in promotions requires collection of quantifiable data showing inadequacy of representation.'
  },
  {
    question: 'What is the significance of Article 21 in protecting citizens\' rights?',
    options: [
      { text: 'It only protects physical life', isCorrect: false },
      { text: 'It protects right to life and personal liberty with broad interpretation', isCorrect: true },
      { text: 'It is the least important Fundamental Right', isCorrect: false },
      { text: 'It only applies during emergencies', isCorrect: false }
    ],
    explanation: 'Article 21 (Right to Life and Personal Liberty) has been interpreted broadly by courts to include right to privacy, dignity, livelihood, clean environment, and more.'
  },
  {
    question: 'Can the Supreme Court review constitutional amendments?',
    options: [
      { text: 'No, amendments are beyond judicial review', isCorrect: false },
      { text: 'Yes, if they violate the Basic Structure doctrine', isCorrect: true },
      { text: 'Yes, all amendments require court approval', isCorrect: false },
      { text: 'No, only Parliament can review amendments', isCorrect: false }
    ],
    explanation: 'The Basic Structure doctrine (Kesavananda Bharati, 1973) allows the Supreme Court to review amendments that affect the Constitution\'s basic features.'
  },
  {
    question: 'How does the Preamble influence constitutional interpretation?',
    options: [
      { text: 'It has no legal significance', isCorrect: false },
      { text: 'It is a key part of the Constitution and guides interpretation', isCorrect: true },
      { text: 'It can be amended like any other provision', isCorrect: false },
      { text: 'It only applies to the first article', isCorrect: false }
    ],
    explanation: 'The Preamble is part of the Constitution and provides the basic philosophy and values. Courts use it as an aid to interpret constitutional provisions.'
  },
  {
    question: 'What happens if a state legislature passes a law on a Union List subject?',
    options: [
      { text: 'The law is valid', isCorrect: false },
      { text: 'The law is unconstitutional (repugnant)', isCorrect: true },
      { text: 'The law becomes valid after President\'s approval', isCorrect: false },
      { text: 'The law is valid only in that state', isCorrect: false }
    ],
    explanation: 'Under Article 246, only Parliament can make laws on Union List subjects. State laws on Union List subjects are unconstitutional and void.'
  },
  {
    question: 'Can the Governor of a state withhold assent to a state bill indefinitely?',
    options: [
      { text: 'Yes, the Governor has absolute power', isCorrect: false },
      { text: 'No, this would violate constitutional democracy', isCorrect: true },
      { text: 'Yes, but only for money bills', isCorrect: false },
      { text: 'No, only the President can withhold assent', isCorrect: false }
    ],
    explanation: 'While the Governor can withhold assent, indefinite withholding would violate constitutional principles. Courts have ruled that Governors must act within reasonable time.'
  },
  {
    question: 'What is the role of Directive Principles in governance?',
    options: [
      { text: 'They are legally enforceable like Fundamental Rights', isCorrect: false },
      { text: 'They are guidelines for government policy, not enforceable by courts', isCorrect: true },
      { text: 'They are more important than Fundamental Rights', isCorrect: false },
      { text: 'They apply only to private citizens', isCorrect: false }
    ],
    explanation: 'Directive Principles (Part IV) are fundamental in governance but not enforceable by courts. They guide the government in making laws and policies.'
  },
  {
    question: 'How does the Constitution balance federalism and unitary features?',
    options: [
      { text: 'It is purely federal like the USA', isCorrect: false },
      { text: 'It has federal structure with unitary bias during emergencies', isCorrect: true },
      { text: 'It is purely unitary like the UK', isCorrect: false },
      { text: 'It changes between federal and unitary every year', isCorrect: false }
    ],
    explanation: 'The Indian Constitution has federal features (division of powers, independent judiciary) but unitary bias (single citizenship, strong center, emergency provisions). K.C. Wheare called it "quasi-federal".'
  }
];

async function addMoreApplicationQuestions() {
  try {
    console.log('🔄 Phase 1.2: Adding More Application Questions to Reach 70% Target');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all quiz content
    const quizContent = await Content.find({ type: 'quiz' });
    console.log(`📝 Found ${quizContent.length} quiz content items`);
    
    // Analyze current distribution
    let totalQuestions = 0;
    let recallQuestions = 0;
    let applicationQuestions = 0;
    
    quizContent.forEach(q => {
      if (q.quiz && q.quiz.questions) {
        q.quiz.questions.forEach(qn => {
          totalQuestions++;
          if (qn.questionType === 'recall') recallQuestions++;
          else if (qn.questionType === 'application') applicationQuestions++;
        });
      }
    });
    
    console.log(`📊 Current distribution: ${recallQuestions} recall (${((recallQuestions/totalQuestions)*100).toFixed(1)}%), ${applicationQuestions} application (${((applicationQuestions/totalQuestions)*100).toFixed(1)}%)`);
    
    // Calculate target: 70% application, 30% recall
    const targetApplicationCount = Math.ceil(totalQuestions * 0.7);
    const applicationQuestionsNeeded = targetApplicationCount - applicationQuestions;
    
    console.log(`🎯 Target: ${targetApplicationCount} application questions (70%)`);
    console.log(`📋 Need to add ${applicationQuestionsNeeded} more application questions`);
    
    if (applicationQuestionsNeeded <= 0) {
      console.log('✅ Already at or above target!');
      await mongoose.connection.close();
      return;
    }
    
    // Distribute additional questions across quizzes
    let questionsAdded = 0;
    let questionIndex = 0;
    
    for (const quiz of quizContent) {
      if (questionsAdded >= applicationQuestionsNeeded) break;
      
      const questionsToAdd = Math.min(2, applicationQuestionsNeeded - questionsAdded);
      
      for (let i = 0; i < questionsToAdd; i++) {
        const template = additionalApplicationQuestions[questionIndex % additionalApplicationQuestions.length];
        quiz.quiz.questions.push({
          question: template.question,
          options: template.options,
          explanation: template.explanation,
          questionType: 'application'
        });
        questionIndex++;
        questionsAdded++;
      }
      
      await quiz.save();
      console.log(`  ✅ Added ${questionsToAdd} application questions to ${quiz.title}`);
    }
    
    // Analyze new distribution
    const updatedQuizContent = await Content.find({ type: 'quiz' });
    totalQuestions = 0;
    recallQuestions = 0;
    applicationQuestions = 0;
    
    updatedQuizContent.forEach(q => {
      if (q.quiz && q.quiz.questions) {
        q.quiz.questions.forEach(qn => {
          totalQuestions++;
          if (qn.questionType === 'recall') recallQuestions++;
          else if (qn.questionType === 'application') applicationQuestions++;
        });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATED QUIZ DISTRIBUTION');
    console.log('='.repeat(60));
    console.log(`Total quiz questions: ${totalQuestions}`);
    console.log(`Recall questions: ${recallQuestions} (${((recallQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Application questions: ${applicationQuestions} (${((applicationQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`🎯 Target: 30% recall / 70% application`);
    console.log(`✅ Added ${questionsAdded} additional application questions`);
    console.log('='.repeat(60));
    console.log('✅ Phase 1.2 Migration Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addMoreApplicationQuestions();
