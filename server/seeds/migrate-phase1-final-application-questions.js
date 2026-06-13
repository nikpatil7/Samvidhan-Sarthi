// Phase 1.2: Final Addition of Application Questions to Reach 70% Target
// This script adds the final batch of application questions
// Run with: node migrate-phase1-final-application-questions.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Final batch of application question templates
const finalApplicationQuestions = [
  {
    question: 'A citizen is denied a government job based on religion. Which article protects them?',
    options: [
      { text: 'Article 14 - Equality before law', isCorrect: true },
      { text: 'Article 19 - Freedom of speech', isCorrect: false },
      { text: 'Article 21 - Right to life', isCorrect: false },
      { text: 'Article 32 - Constitutional remedies', isCorrect: false }
    ],
    explanation: 'Article 14 guarantees equality before law and equal protection of laws. Discrimination in public employment based on religion violates this fundamental right.'
  },
  {
    question: 'Can the Supreme Court review a constitutional amendment that affects federal structure?',
    options: [
      { text: 'No, amendments are beyond judicial review', isCorrect: false },
      { text: 'Yes, if it violates the Basic Structure doctrine', isCorrect: true },
      { text: 'Yes, all amendments require court approval', isCorrect: false },
      { text: 'No, only Parliament can review amendments', isCorrect: false }
    ],
    explanation: 'The Basic Structure doctrine allows the Supreme Court to review amendments that affect the Constitution\'s basic features, including federal structure.'
  },
  {
    question: 'What happens if a state law contradicts a central law on a Concurrent List subject?',
    options: [
      { text: 'State law prevails', isCorrect: false },
      { text: 'Central law prevails (Article 254)', isCorrect: true },
      { text: 'Both laws are equally valid', isCorrect: false },
      { text: 'President decides which prevails', isCorrect: false }
    ],
    explanation: 'Under Article 254, central law prevails over state law in case of repugnancy on Concurrent List subjects. State law becomes void to the extent of conflict.'
  },
  {
    question: 'Can Fundamental Rights be suspended during National Emergency?',
    options: [
      { text: 'All Fundamental Rights can be suspended', isCorrect: false },
      { text: 'Only Article 19 can be suspended, Articles 20-21 cannot', isCorrect: true },
      { text: 'No Fundamental Rights can be suspended', isCorrect: false },
      { text: 'Only the President decides which rights to suspend', isCorrect: false }
    ],
    explanation: 'During National Emergency, Article 19 can be suspended, but Articles 20 (protection in respect of conviction) and 21 (protection of life) cannot be suspended.'
  },
  {
    question: 'What is the constitutional position of Directive Principles?',
    options: [
      { text: 'Enforceable by courts like Fundamental Rights', isCorrect: false },
      { text: 'Fundamental in governance but not enforceable by courts', isCorrect: true },
      { text: 'More important than Fundamental Rights', isCorrect: false },
      { text: 'Apply only to private citizens', isCorrect: false }
    ],
    explanation: 'Directive Principles (Part IV) are fundamental in governance but not enforceable by courts. They guide government policy-making.'
  },
  {
    question: 'Can a citizen approach the Supreme Court directly for violation of Fundamental Rights?',
    options: [
      { text: 'No, must first approach High Court', isCorrect: false },
      { text: 'Yes, under Article 32 (Right to Constitutional Remedies)', isCorrect: true },
      { text: 'No, must approach the President', isCorrect: false },
      { text: 'Yes, but only through a lawyer', isCorrect: false }
    ],
    explanation: 'Article 32 provides the right to move the Supreme Court directly for enforcement of Fundamental Rights. Dr. Ambedkar called this the "heart and soul" of the Constitution.'
  },
  {
    question: 'What is the significance of the Basic Structure doctrine?',
    options: [
      { text: 'It gives Parliament unlimited amendment power', isCorrect: false },
      { text: 'It limits Parliament\'s power to amend the Constitution', isCorrect: true },
      { text: 'It allows the President to amend the Constitution', isCorrect: false },
      { text: 'It has no practical significance', isCorrect: false }
    ],
    explanation: 'The Basic Structure doctrine (Kesavananda Bharati case, 1973) limits Parliament\'s power to amend the Constitution\'s basic features.'
  },
  {
    question: 'Can reservation be provided in promotions for SC/ST employees?',
    options: [
      { text: 'Yes, always constitutional', isCorrect: false },
      { text: 'Requires quantifiable data showing inadequacy of representation', isCorrect: true },
      { text: 'No, reservation in promotions is never allowed', isCorrect: false },
      { text: 'Only central government can provide this', isCorrect: false }
    ],
    explanation: 'The Supreme Court ruled that reservation in promotions requires collection of quantifiable data showing inadequacy of representation (Indra Sawhney case).'
  },
  {
    question: 'What is the constitutional position of the Preamble?',
    options: [
      { text: 'It has no legal significance', isCorrect: false },
      { text: 'It is part of the Constitution and guides interpretation', isCorrect: true },
      { text: 'It can be amended like any other provision', isCorrect: false },
      { text: 'It only applies to the first article', isCorrect: false }
    ],
    explanation: 'The Preamble is part of the Constitution and provides the basic philosophy and values. Courts use it as an aid to interpret constitutional provisions.'
  },
  {
    question: 'Can a state legislature make laws on Union List subjects?',
    options: [
      { text: 'Yes, state has complete freedom', isCorrect: false },
      { text: 'No, only Parliament can make laws on Union List subjects', isCorrect: true },
      { text: 'Yes, with President\'s approval', isCorrect: false },
      { text: 'Yes, during emergencies only', isCorrect: false }
    ],
    explanation: 'Under Article 246, only Parliament can make laws on Union List subjects. State laws on Union List subjects are unconstitutional and void.'
  },
  {
    question: 'What is the role of Article 21 in protecting citizens?',
    options: [
      { text: 'It only protects physical life', isCorrect: false },
      { text: 'It protects right to life and personal liberty with broad interpretation', isCorrect: true },
      { text: 'It is the least important Fundamental Right', isCorrect: false },
      { text: 'It only applies during emergencies', isCorrect: false }
    ],
    explanation: 'Article 21 has been interpreted broadly to include right to privacy, dignity, livelihood, clean environment, and more beyond mere physical survival.'
  },
  {
    question: 'How does the Constitution balance federal and unitary features?',
    options: [
      { text: 'It is purely federal like the USA', isCorrect: false },
      { text: 'It has federal structure with unitary bias during emergencies', isCorrect: true },
      { text: 'It is purely unitary like the UK', isCorrect: false },
      { text: 'It changes between federal and unitary annually', isCorrect: false }
    ],
    explanation: 'The Indian Constitution has federal features (division of powers, independent judiciary) but unitary bias (single citizenship, strong center, emergency provisions).'
  },
  {
    question: 'Can the Governor withhold assent to a state bill indefinitely?',
    options: [
      { text: 'Yes, the Governor has absolute power', isCorrect: false },
      { text: 'No, this would violate constitutional principles', isCorrect: true },
      { text: 'Yes, but only for money bills', isCorrect: false },
      { text: 'No, only the President can withhold assent', isCorrect: false }
    ],
    explanation: 'While the Governor can withhold assent, indefinite withholding would violate constitutional principles. Courts have ruled that Governors must act within reasonable time.'
  },
  {
    question: 'What is the constitutional position of Fundamental Duties?',
    options: [
      { text: 'They are legally enforceable like Fundamental Rights', isCorrect: false },
      { text: 'They are moral obligations, not legally enforceable', isCorrect: true },
      { text: 'They are more important than Fundamental Rights', isCorrect: false },
      { text: 'They apply only to government officials', isCorrect: false }
    ],
    explanation: 'Fundamental Duties (Article 51A) are moral obligations of citizens, not legally enforceable. They were added by the 42nd Amendment.'
  },
  {
    question: 'Can the President declare a National Emergency during peacetime?',
    options: [
      { text: 'Yes, for any reason', isCorrect: false },
      { text: 'No, only on grounds of war, external aggression, or armed rebellion', isCorrect: true },
      { text: 'Yes, with Parliament\'s approval', isCorrect: false },
      { text: 'No, only state legislature can declare emergency', isCorrect: false }
    ],
    explanation: 'Article 352 allows National Emergency only on grounds of war, external aggression, or armed rebellion. Economic crisis or political instability alone is not sufficient.'
  },
  {
    question: 'What is the significance of judicial review in Indian democracy?',
    options: [
      { text: 'It allows courts to make laws', isCorrect: false },
      { text: 'It allows courts to review constitutionality of laws and government actions', isCorrect: true },
      { text: 'It gives courts unlimited power', isCorrect: false },
      { text: 'It is mentioned explicitly in the Constitution', isCorrect: false }
    ],
    explanation: 'Judicial review is not explicitly mentioned but is inherent in the Constitution. It allows courts to review the constitutionality of laws and government actions.'
  },
  {
    question: 'Can a citizen be deprived of their personal liberty without following due process?',
    options: [
      { text: 'Yes, during emergencies', isCorrect: false },
      { text: 'No, Article 21 requires due process of law', isCorrect: true },
      { text: 'Yes, if the government deems it necessary', isCorrect: false },
      { text: 'No, but only for citizens above 18 years', isCorrect: false }
    ],
    explanation: 'Article 21 guarantees that no person shall be deprived of their personal liberty except according to procedure established by law. Due process is essential.'
  },
  {
    question: 'What is the constitutional position of minority rights?',
    options: [
      { text: 'Minorities have no special rights', isCorrect: false },
      { text: 'Minorities have rights to establish educational institutions and conserve culture', isCorrect: true },
      { text: 'Minority rights are only advisory', isCorrect: false },
      { text: 'Only religious minorities have rights', isCorrect: false }
    ],
    explanation: 'Articles 29-30 provide cultural and educational rights to minorities, including the right to establish and administer educational institutions and conserve their culture.'
  },
  {
    question: 'Can the Constitution be amended without Parliament\'s approval?',
    options: [
      { text: 'Yes, the President can amend it', isCorrect: false },
      { text: 'No, only Parliament can amend under Article 368', isCorrect: true },
      { text: 'Yes, state legislatures can amend it', isCorrect: false },
      { text: 'Yes, Supreme Court can amend it', isCorrect: false }
    ],
    explanation: 'Only Parliament can amend the Constitution under Article 368, following the prescribed procedure. No other body has this power.'
  },
  {
    question: 'What is the role of the Prime Minister in the Indian parliamentary system?',
    options: [
      { text: 'Head of state with executive powers', isCorrect: false },
      { text: 'Head of government responsible to Parliament', isCorrect: true },
      { text: 'Ceremonial head with no real power', isCorrect: false },
      { text: 'Independent of Parliament', isCorrect: false }
    ],
    explanation: 'The Prime Minister is the head of government, responsible to Parliament, and exercises real executive power. The President is the head of state with ceremonial powers.'
  }
];

async function addFinalApplicationQuestions() {
  try {
    console.log('🔄 Phase 1.2: Final Addition of Application Questions');
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
      
      const questionsToAdd = Math.min(3, applicationQuestionsNeeded - questionsAdded);
      
      for (let i = 0; i < questionsToAdd; i++) {
        const template = finalApplicationQuestions[questionIndex % finalApplicationQuestions.length];
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
    console.log('📊 FINAL QUIZ DISTRIBUTION');
    console.log('='.repeat(60));
    console.log(`Total quiz questions: ${totalQuestions}`);
    console.log(`Recall questions: ${recallQuestions} (${((recallQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Application questions: ${applicationQuestions} (${((applicationQuestions/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`🎯 Target: 30% recall / 70% application`);
    console.log(`✅ Added ${questionsAdded} additional application questions`);
    
    if (applicationQuestions >= targetApplicationCount) {
      console.log('🎉 Target achieved! Application questions now at 70% or higher.');
    } else {
      console.log(`⚠️ Close to target. Current: ${((applicationQuestions/totalQuestions)*100).toFixed(1)}% application`);
    }
    
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

addFinalApplicationQuestions();
