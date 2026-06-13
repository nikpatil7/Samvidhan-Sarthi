// Phase 1.2: Add Application Questions to Quizzes
// This script adds application questions to reach 70% application / 30% recall target
// Run with: node migrate-phase1-application-questions.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

// Application question templates for different topic categories
const applicationQuestionTemplates = {
  'fundamental-rights': [
    {
      question: 'A government university denies admission to a student based on their caste. Which constitutional principle is being violated?',
      options: [
        { text: 'Right to Freedom of Religion', isCorrect: false },
        { text: 'Right to Equality (Article 14-16)', isCorrect: true },
        { text: 'Right to Constitutional Remedies', isCorrect: false },
        { text: 'Directive Principles of State Policy', isCorrect: false }
      ],
      explanation: 'Article 14 guarantees equality before law and Article 15 prohibits discrimination on grounds of religion, race, caste, sex, or place of birth.'
    },
    {
      question: 'A journalist writes an article criticizing government policies. The government arrests them for "anti-national" activities. Which right is being violated?',
      options: [
        { text: 'Right to Equality', isCorrect: false },
        { text: 'Right to Freedom of Speech and Expression (Article 19)', isCorrect: true },
        { text: 'Right to Life and Personal Liberty', isCorrect: false },
        { text: 'Right against Exploitation', isCorrect: false }
      ],
      explanation: 'Article 19(1)(a) guarantees freedom of speech and expression. Arrest for criticism without valid reason violates this right.'
    },
    {
      question: 'A factory owner makes children work 12 hours daily. Which constitutional provision protects against this?',
      options: [
        { text: 'Article 21 - Right to Life', isCorrect: false },
        { text: 'Article 23 - Prohibition of child labor and trafficking', isCorrect: true },
        { text: 'Article 24 - Prohibition of child labor in factories', isCorrect: false },
        { text: 'Article 32 - Constitutional Remedies', isCorrect: false }
      ],
      explanation: 'Article 24 prohibits employment of children below 14 years in factories, mines, and hazardous occupations. Article 23 prohibits trafficking and forced labor.'
    }
  ],
  'directive-principles': [
    {
      question: 'The government decides to implement a nationwide public healthcare system. Which constitutional principle supports this decision?',
      options: [
        { text: 'Fundamental Rights', isCorrect: false },
        { text: 'Directive Principles of State Policy (Article 47)', isCorrect: true },
        { text: 'Fundamental Duties', isCorrect: false },
        { text: 'Emergency Provisions', isCorrect: false }
      ],
      explanation: 'Article 47 (DPSP) directs the state to improve public health and nutrition. Unlike Fundamental Rights, DPSPs are guidelines for governance.'
    },
    {
      question: 'A state government provides free education to all children up to age 14. This is based on which constitutional provision?',
      options: [
        { text: 'Article 21A - Right to Education', isCorrect: true },
        { text: 'Article 45 - Free and compulsory education (DPSP)', isCorrect: false },
        { text: 'Article 32 - Constitutional Remedies', isCorrect: false },
        { text: 'Article 51A - Fundamental Duties', isCorrect: false }
      ],
      explanation: 'Article 21A (added by 86th Amendment) made free and compulsory education a Fundamental Right. Previously it was a DPSP under Article 45.'
    }
  ],
  'judiciary': [
    {
      question: 'Parliament passes an amendment that removes judicial review from the Constitution. Can the Supreme Court strike down this amendment?',
      options: [
        { text: 'No, Parliament has unlimited power to amend', isCorrect: false },
        { text: 'Yes, if it violates the Basic Structure doctrine', isCorrect: true },
        { text: 'No, only the President can review amendments', isCorrect: false },
        { text: 'Yes, all amendments require Supreme Court approval', isCorrect: false }
      ],
      explanation: 'The Basic Structure doctrine (Kesavananda Bharati case, 1973) allows the Supreme Court to review amendments that affect the Constitution\'s basic features.'
    },
    {
      question: 'A citizen believes their Fundamental Rights are being violated by a state law. Which court can they approach directly?',
      options: [
        { text: 'Only Supreme Court under Article 32', isCorrect: false },
        { text: 'High Court under Article 226 or Supreme Court under Article 32', isCorrect: true },
        { text: 'Only District Court', isCorrect: false },
        { text: 'Only the President', isCorrect: false }
      ],
      explanation: 'Article 32 provides the right to approach the Supreme Court, while Article 226 provides the right to approach High Courts for constitutional remedies.'
    }
  ],
  'amendments': [
    {
      question: 'Parliament wants to amend the Constitution to change the federal structure. What special procedure is required?',
      options: [
        { text: 'Simple majority in Parliament only', isCorrect: false },
        { text: 'Special majority in Parliament + ratification by half of state legislatures', isCorrect: true },
        { text: 'Special majority in Parliament only', isCorrect: false },
        { text: 'Unanimous approval of all states', isCorrect: false }
      ],
      explanation: 'Under Article 368, amendments affecting federal structure require special majority (2/3 of members present and voting + majority of total membership) plus ratification by at least half of state legislatures.'
    },
    {
      question: 'The 42nd Amendment (1976) is often called the "Mini-Constitution". Why?',
      options: [
        { text: 'It reduced the Constitution to 100 articles', isCorrect: false },
        { text: 'It made sweeping changes to the Constitution during Emergency', isCorrect: true },
        { text: 'It was the shortest amendment', isCorrect: false },
        { text: 'It only changed the Preamble', isCorrect: false }
      ],
      explanation: 'The 42nd Amendment made extensive changes during the Emergency period, including changes to the Preamble, Fundamental Rights, DPSPs, and judicial review, earning it the "Mini-Constitution" nickname.'
    }
  ],
  'emergency': [
    {
      question: 'A state government loses majority support in the assembly. The President imposes President\'s Rule under which Article?',
      options: [
        { text: 'Article 352 - National Emergency', isCorrect: false },
        { text: 'Article 356 - State Emergency (President\'s Rule)', isCorrect: true },
        { text: 'Article 360 - Financial Emergency', isCorrect: false },
        { text: 'Article 370 - Special Status', isCorrect: false }
      ],
      explanation: 'Article 356 allows the President to impose President\'s Rule in a state if the constitutional machinery has failed, typically when a government loses majority.'
    },
    {
      question: 'During a National Emergency, which Fundamental Rights can be suspended?',
      options: [
        { text: 'All Fundamental Rights', isCorrect: false },
        { text: 'Only Article 19 (Right to Freedom)', isCorrect: false },
        { text: 'Article 19 and Articles 20-21 (except Article 20)', isCorrect: true },
        { text: 'No Fundamental Rights can be suspended', isCorrect: false }
      ],
      explanation: 'Under Article 359, during a National Emergency, the President can suspend the right to move any court for enforcement of Fundamental Rights, except Article 20 (protection in respect of conviction for offences) and Article 21 (protection of life and personal liberty).'
    }
  ],
  'default': [
    {
      question: 'How does this constitutional provision impact the daily lives of Indian citizens?',
      options: [
        { text: 'It has no practical impact on daily life', isCorrect: false },
        { text: 'It provides a framework for rights and governance that affects citizens directly', isCorrect: true },
        { text: 'It only applies to government officials', isCorrect: false },
        { text: 'It is only relevant during elections', isCorrect: false }
      ],
      explanation: 'Constitutional provisions create the legal framework that governs rights, duties, and governance, directly impacting citizens\' daily lives through laws, policies, and protections.'
    },
    {
      question: 'If this constitutional provision were removed, what would be the most likely consequence?',
      options: [
        { text: 'No significant change would occur', isCorrect: false },
        { text: 'It could weaken constitutional protections and governance structure', isCorrect: true },
        { text: 'The Constitution would become invalid', isCorrect: false },
        { text: 'All other provisions would automatically become invalid', isCorrect: false }
      ],
      explanation: 'Each constitutional provision serves a specific purpose. Removing one could weaken the overall constitutional framework and affect the balance of rights and governance.'
    }
  ]
};

async function addApplicationQuestions() {
  try {
    console.log('🔄 Phase 1.2: Adding Application Questions to Quizzes');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all quiz content
    const quizContent = await Content.find({ type: 'quiz' }).populate('topic');
    console.log(`📝 Found ${quizContent.length} quiz content items`);
    
    let totalQuestionsAdded = 0;
    let quizzesUpdated = 0;
    
    for (const quiz of quizContent) {
      if (!quiz.quiz || !quiz.quiz.questions) continue;
      
      const currentQuestions = quiz.quiz.questions;
      const currentApplicationCount = currentQuestions.filter(q => q.questionType === 'application').length;
      const currentRecallCount = currentQuestions.filter(q => q.questionType === 'recall').length;
      const totalCurrent = currentQuestions.length;
      
      // Calculate target: 70% application, 30% recall
      const targetApplicationCount = Math.ceil(totalCurrent * 0.7);
      const targetRecallCount = Math.floor(totalCurrent * 0.3);
      
      const applicationQuestionsNeeded = targetApplicationCount - currentApplicationCount;
      
      if (applicationQuestionsNeeded <= 0) {
        console.log(`  ✓ ${quiz.title} already has ${currentApplicationCount}/${totalCurrent} application questions`);
        continue;
      }
      
      console.log(`  📋 ${quiz.title}: Current ${currentApplicationCount}/${totalCurrent} application, need ${applicationQuestionsNeeded} more`);
      
      // Get appropriate application questions based on topic category
      let applicationQuestions = [];
      const topicCategory = quiz.topic.category || 'default';
      
      // Try to get questions from specific category, then fallback to default
      const categoryQuestions = applicationQuestionTemplates[topicCategory] || applicationQuestionTemplates['default'];
      
      // Add as many questions as needed
      for (let i = 0; i < applicationQuestionsNeeded; i++) {
        const template = categoryQuestions[i % categoryQuestions.length];
        applicationQuestions.push({
          question: template.question,
          options: template.options,
          explanation: template.explanation,
          questionType: 'application'
        });
      }
      
      // Add application questions to the quiz
      quiz.quiz.questions.push(...applicationQuestions);
      await quiz.save();
      
      totalQuestionsAdded += applicationQuestions.length;
      quizzesUpdated++;
      
      console.log(`  ✅ Added ${applicationQuestions.length} application questions to ${quiz.title}`);
    }
    
    // Analyze new distribution
    const updatedQuizContent = await Content.find({ type: 'quiz' });
    let totalQuestions = 0;
    let recallQuestions = 0;
    let applicationQuestions = 0;
    
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
    console.log(`✅ Updated ${quizzesUpdated} quizzes with ${totalQuestionsAdded} new application questions`);
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

addApplicationQuestions();
