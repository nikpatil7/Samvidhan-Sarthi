
const mongoose = require('mongoose');

const UserStory = require('../models/UserStory');



const stories = [
  {
    title: 'How RTI Helped a Village Get Clean Drinking Water',
    author: 'Ramesh Patil',
    category: 'Right to Information',
    imageUrl: '',
    content: `
      Ramesh Patil lived in a small village where residents faced severe drinking water shortages.
The local administration had repeatedly claimed that funds had been allocated for a new water pipeline,
but no visible work had been completed.

After learning about the Right to Information Act, Ramesh filed an RTI application seeking details
about the sanctioned budget, contractor information, and project status.

The information revealed that funds had already been released months earlier.
With this evidence, villagers approached district authorities and demanded accountability.

An inquiry was initiated, construction resumed, and within a few months the village received
a functioning water supply system.

This story demonstrates how constitutional principles of transparency and accountability empower
citizens to participate in governance and ensure public resources are used properly.
`
  },

  {
    title: 'A Girl’s Journey to Education Through Constitutional Rights',
    author: 'Priya Sharma',
    category: 'Right to Education',
    imageUrl: '',
    content: `
Priya belonged to a financially disadvantaged family.
When her parents struggled to pay school fees, there was a possibility that she would have to leave school.

A local teacher informed the family about Article 21A of the Constitution,
which guarantees the Right to Education for children.

With support from local authorities and government educational programs,
Priya was able to continue her studies without interruption.

She completed her schooling, earned a scholarship, and later became the first engineer in her family.

Her story highlights how constitutional provisions are not merely legal principles;
they create opportunities that can transform lives and help break cycles of poverty.
`
  },

  {
    title: 'Using Freedom of Speech to Raise Community Concerns',
    author: 'Arjun Deshmukh',
    category: 'Freedom of Speech',
    imageUrl: '',
    content: `
Arjun noticed dangerous potholes and damaged roads in his locality.
Several accidents had occurred, but the issue remained unresolved.

Using his constitutional right to freedom of speech and expression under Article 19,
he organized awareness campaigns and shared evidence with local authorities.

Citizens joined together, signed petitions, and participated in community meetings.

The growing public attention encouraged the municipal administration to take action.
Repairs were completed, and road safety improved significantly.

This experience showed how democratic participation and constitutional freedoms
allow citizens to voice concerns and contribute positively to society.
`
  },

  {
    title: 'Equal Opportunity Through Constitutional Protection',
    author: 'Neha Verma',
    category: 'Right to Equality',
    imageUrl: '',
    content: `
Neha applied for a local training program but felt she had been treated unfairly during the selection process.

After learning about Articles 14, 15, and 16 of the Constitution,
which guarantee equality before law and prohibit discrimination,
she sought clarification from the authorities.

The review revealed inconsistencies in the selection process.
The organization corrected the procedure and implemented transparent evaluation criteria.

Neha eventually secured admission through the revised process.

Her story demonstrates how constitutional guarantees of equality help create fair opportunities
and protect individuals from arbitrary treatment.
`
  },

  {
    title: 'Protecting a Local Lake Through Environmental Rights',
    author: 'Sanjay Kulkarni',
    category: 'Environmental Protection',
    imageUrl: '',
    content: `
Residents of a town noticed increasing pollution in a nearby lake that served as a major source of water.

Sanjay and other citizens studied legal provisions related to environmental protection
and learned that the Supreme Court has interpreted Article 21
(Right to Life) to include the right to a clean and healthy environment.

The community gathered evidence, filed complaints, and worked with local authorities.

Cleanup measures were introduced, waste disposal practices improved,
and awareness programs were conducted across the town.

The lake gradually recovered, benefiting both residents and local wildlife.

This story illustrates how constitutional rights can support environmental protection
and encourage collective civic action.
`
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
  
async function seedUserStories() {
  try {
    

    console.log('Connected to MongoDB');

    await UserStory.deleteMany({});
    console.log('Existing stories removed');

    await UserStory.insertMany(stories);
    console.log(`${stories.length} user stories added successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding user stories:', error);
    process.exit(1);
  }
}

seedUserStories();

