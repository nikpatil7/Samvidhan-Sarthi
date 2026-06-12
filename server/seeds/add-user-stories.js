

require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const UserStory = require('../models/UserStory');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/samvidhan_sarthi'; // replace with your actual URI

const stories = [
{
  title: "A Farmer Used RTI to Track Delayed Irrigation Funds",
  author: "Mahesh Jadhav, Solapur, Maharashtra",
  category: "Right to Information",
  imageUrl: "",
  content: `
Problem Faced

Mahesh Jadhav, a farmer from Solapur, depended on seasonal rainfall for irrigation. A government scheme had promised funding for a local canal project, but work remained incomplete for years.

How Constitutional Awareness Helped

During a village awareness program, Mahesh learned about the Right to Information Act. He filed an RTI application seeking details regarding sanctioned funds, project timelines, and contractor information.

Outcome

The documents revealed delays and administrative negligence. After presenting the findings to district authorities, work resumed and the canal project was completed.

Impact

The improved irrigation system benefited hundreds of farmers and increased agricultural productivity across nearby villages.

Constitutional Principle

Transparency, Accountability and Citizen Participation.
`
},

{
  title: "A Student Continued Her Education Through Awareness of Article 21A",
  author: "Sneha Kulkarni, Nagpur, Maharashtra",
  category: "Right to Education",
  imageUrl: "",
  content: `
Problem Faced

Sneha's family faced financial difficulties and considered discontinuing her education after secondary school.

How Constitutional Awareness Helped

A school teacher informed the family about Article 21A and government educational assistance programs available for economically weaker sections.

Outcome

Sneha received support through scholarships and educational schemes, allowing her to continue her studies.

Impact

She successfully completed higher education and became the first graduate in her family.

Constitutional Principle

Right to Education and Equal Opportunity.
`
},

{
  title: "Citizens Improved Road Safety Through Freedom of Expression",
  author: "Arjun Deshmukh, Pune, Maharashtra",
  category: "Freedom of Speech",
  imageUrl: "",
  content: `
Problem Faced

Several accidents occurred on a poorly maintained road in Arjun's locality.

How Constitutional Awareness Helped

Arjun organized meetings, collected citizen feedback, and submitted representations to local authorities while exercising his freedom of speech and expression.

Outcome

Municipal authorities inspected the area and initiated repairs.

Impact

Road conditions improved significantly, reducing accidents and improving public safety.

Constitutional Principle

Freedom of Speech and Democratic Participation.
`
},

{
  title: "Fair Recruitment Achieved Through Awareness of Equality Rights",
  author: "Neha Verma, Jaipur, Rajasthan",
  category: "Right to Equality",
  imageUrl: "",
  content: `
Problem Faced

Neha noticed inconsistencies during a local recruitment process and felt candidates were not being evaluated fairly.

How Constitutional Awareness Helped

After learning about Articles 14, 15 and 16, she requested clarification regarding the recruitment criteria.

Outcome

The process was reviewed and transparent evaluation standards were introduced.

Impact

The revised system ensured equal opportunity for all applicants.

Constitutional Principle

Equality Before Law and Equal Opportunity.
`
},

{
  title: "Women Used Constitutional Awareness to Start a Self-Help Initiative",
  author: "Shalini Devi, Gaya, Bihar",
  category: "Women Empowerment",
  imageUrl: "",
  content: `
Problem Faced

Many women in the village lacked access to financial resources and employment opportunities.

How Constitutional Awareness Helped

A local NGO conducted sessions on equality, dignity and women's rights guaranteed under the Constitution.

Outcome

The women formed self-help groups, received skill training and started small businesses.

Impact

Household incomes increased and more women actively participated in community decision-making.

Constitutional Principle

Equality, Dignity and Empowerment.
`
},

{
  title: "Saving a Community Lake Through Environmental Awareness",
  author: "Sanjay Kulkarni, Nashik, Maharashtra",
  category: "Environmental Protection",
  imageUrl: "",
  content: `
Problem Faced

A local lake was being polluted by improper waste disposal.

How Constitutional Awareness Helped

Residents learned that the right to life under Article 21 includes the right to a clean and healthy environment.

Outcome

Citizens organized awareness drives and submitted complaints to authorities.

Impact

Cleanup measures were implemented and the lake ecosystem gradually recovered.

Constitutional Principle

Right to Life and Environmental Protection.
`
},

{
  title: "A Gram Sabha Meeting Changed Village Development Priorities",
  author: "Ravi Kumar, Belagavi, Karnataka",
  category: "Local Governance",
  imageUrl: "",
  content: `
Problem Faced

Basic infrastructure projects in Ravi's village remained pending despite repeated requests.

How Constitutional Awareness Helped

Ravi encouraged villagers to actively participate in Gram Sabha meetings and voice their concerns.

Outcome

The community collectively prioritized road repairs and sanitation projects.

Impact

Several pending development works were approved and completed.

Constitutional Principle

Decentralized Governance and Citizen Participation.
`
},

{
  title: "First-Time Voters Increased Electoral Participation",
  author: "Ananya Sharma, Bhopal, Madhya Pradesh",
  category: "Voting Rights",
  imageUrl: "",
  content: `
Problem Faced

Many young citizens in Ananya's locality were unaware of voter registration procedures.

How Constitutional Awareness Helped

Ananya organized voter awareness sessions and helped eligible citizens complete registration.

Outcome

Hundreds of first-time voters participated in elections.

Impact

The initiative strengthened democratic participation within the community.

Constitutional Principle

Democracy and Universal Adult Suffrage.
`
},

{
  title: "Parents Ensured Better School Facilities Through Collective Action",
  author: "Rakesh Yadav, Lucknow, Uttar Pradesh",
  category: "Education Rights",
  imageUrl: "",
  content: `
Problem Faced

A government school lacked proper sanitation and classroom infrastructure.

How Constitutional Awareness Helped

Parents approached education authorities and highlighted students' rights to quality education.

Outcome

Additional funds were sanctioned and facilities were upgraded.

Impact

Students benefited from a safer and more effective learning environment.

Constitutional Principle

Right to Education and Child Welfare.
`
},

{
  title: "Citizens Resolved Public Service Delays Through Awareness and Accountability",
  author: "Meena Patel, Ahmedabad, Gujarat",
  category: "Good Governance",
  imageUrl: "",
  content: `
Problem Faced

Residents experienced repeated delays in obtaining important public service documents.

How Constitutional Awareness Helped

Citizens collectively approached officials, requested status updates and demanded transparent procedures.

Outcome

Administrative processes were streamlined and service delivery improved.

Impact

People received documents more efficiently and confidence in local governance increased.

Constitutional Principle

Accountability, Transparency and Good Governance.
`
}

];

async function seedUserStories() {
  try {
    await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi'
      );
  
      console.log('Connected to MongoDB');
  
      await UserStory.deleteMany({});
      console.log('Existing stories removed');
  
      await UserStory.insertMany(stories);
      console.log(`${stories.length} user stories added successfully`);
  
      await mongoose.connection.close();
  
      process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding user stories:', error);
    process.exit(1);
  }
}

seedUserStories();