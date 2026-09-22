const fs = require('fs');
const path = require('path');

const qPath = path.join(__dirname, '..', 'src', 'data', 'questions.js');
let fileContent = fs.readFileSync(qPath, 'utf8');

// Load the array of questions
let qCode = fileContent.replace('export const questions =', 'module.exports = { questions:');
const li = qCode.lastIndexOf('];');
if (li !== -1) {
  qCode = qCode.substring(0, li) + ']}' + qCode.substring(li + 2);
}
const tempPath = path.join(__dirname, 'temp_q.js');
fs.writeFileSync(tempPath, qCode);
const { questions } = require(tempPath);
fs.unlinkSync(tempPath);

const specificFixes = {
  '2025_50': { subject: 'Crystal Structure', subjectId: 'solid', tags: ['Crystal Structure', 'Solid State & Electronics', 'Lattice Packing'] },
  '2021_1': { subject: 'Calculus', subjectId: 'math', tags: ['Calculus', 'Mathematical Methods', 'Taylor Series'] },
  '2020_1': { subject: 'Calculus', subjectId: 'math', tags: ['Calculus', 'Mathematical Methods', 'Differential Calculus'] },
  '2025_10': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2022_42': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2020_31': { subject: 'Matrices & Determinants', subjectId: 'math', tags: ['Matrices & Determinants', 'Mathematical Methods', 'Linear Algebra'] },
  '2026_18': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2026_43': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2024_32': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2023_9': { subject: 'Operational Amplifiers', subjectId: 'solid', tags: ['Operational Amplifiers', 'Solid State & Electronics', 'Analog Circuits'] },
  '2026_11': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2026_32': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2025_45': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2025_52': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2024_48': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2023_7': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2022_25': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2022_50': { subject: 'p-n Junction & Diodes', subjectId: 'solid', tags: ['p-n Junction & Diodes', 'Semiconductors', 'Solid State & Electronics'] },
  '2024_52': { subject: 'Bipolar Junction Transistors', subjectId: 'solid', tags: ['Bipolar Junction Transistors', 'Solid State & Electronics', 'Transistors'] },
  '2023_22': { subject: 'Bipolar Junction Transistors', subjectId: 'solid', tags: ['Bipolar Junction Transistors', 'Solid State & Electronics', 'Transistors'] },
  '2026_36': { subject: 'Oscillators', subjectId: 'solid', tags: ['Oscillators', 'DC & AC Circuits', 'Solid State & Electronics'] },
  '2023_39': { subject: 'DC & AC Circuits', subjectId: 'em', tags: ['DC & AC Circuits', 'Electricity & Magnetism'] },
  '2022_13': { subject: 'DC & AC Circuits', subjectId: 'em', tags: ['DC & AC Circuits', 'Electricity & Magnetism'] },
  '2021_55': { subject: 'DC & AC Circuits', subjectId: 'em', tags: ['DC & AC Circuits', 'Electricity & Magnetism'] },
  '2022_5': { subject: 'Digital Electronics', subjectId: 'solid', tags: ['Digital Electronics', 'Solid State & Electronics', 'Number Systems'] },
  '2022_30': { subject: 'Digital Electronics', subjectId: 'solid', tags: ['Digital Electronics', 'Solid State & Electronics', 'Number Systems'] },
  '2019_59': { subject: 'Digital Electronics', subjectId: 'solid', tags: ['Digital Electronics', 'Solid State & Electronics', 'Number Systems'] },
  '2026_4': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Boolean Algebra', 'Solid State & Electronics'] },
  '2025_31': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2024_13': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2023_12': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2022_39': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Boolean Algebra', 'Solid State & Electronics'] },
  '2021_16': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2021_54': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Boolean Algebra', 'Solid State & Electronics'] },
  '2020_9': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Boolean Algebra', 'Solid State & Electronics'] },
  '2020_40': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2019_16': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Logic Circuits', 'Solid State & Electronics'] },
  '2018_26': { subject: 'Logic Gates', subjectId: 'solid', tags: ['Logic Gates', 'Digital Electronics', 'Boolean Algebra', 'Solid State & Electronics'] },
};

const syllabus = [
  {
    id: "math",
    name: "Mathematical Methods",
    subtopics: [
      "Calculus",
      "Vector Algebra & Vector Calculus",
      "Fourier Series",
      "Differential Equations",
      "Matrices & Determinants",
      "Complex Numbers",
      "Error Analysis & Statistics"
    ],
  },
  {
    id: "mechanics",
    name: "Mechanics & General Properties",
    subtopics: [
      "Newtonian Mechanics",
      "Non-Inertial Frames",
      "Central Force Motion",
      "Conservation Laws",
      "System of Particles",
      "Collisions",
      "Rigid Body Dynamics",
      "Fluid Mechanics"
    ],
  },
  {
    id: "waves",
    name: "Oscillations, Waves & Optics",
    subtopics: [
      "Simple Harmonic Motion",
      "Superposition of Oscillations",
      "Damped & Forced Oscillations",
      "Wave Motion",
      "Phase & Group Velocity",
      "Sound Waves",
      "Geometrical Optics",
      "Interference",
      "Diffraction",
      "Polarization"
    ],
  },
  {
    id: "em",
    name: "Electricity & Magnetism",
    subtopics: [
      "Electrostatics",
      "Laplace's Equation",
      "Conductors, Capacitors & Electrostatic Energy",
      "Dielectrics",
      "Magnetostatics",
      "Electromagnetic Induction",
      "DC & AC Circuits",
      "Maxwell's Equations & Electromagnetic Waves",
      "Reflection & Refraction of EM Waves",
      "Charged Particle Dynamics"
    ],
  },
  {
    id: "thermo",
    name: "Thermodynamics & KTG",
    subtopics: [
      "Kinetic Theory of Gases",
      "Equations of State",
      "Laws of Thermodynamics",
      "Thermodynamic Processes",
      "Entropy & Second Law",
      "Carnot Cycle",
      "Thermodynamic Relations & Potentials",
      "Phase Transitions",
      "Statistical Mechanics"
    ],
  },
  {
    id: "modern",
    name: "Modern Physics",
    subtopics: [
      "Special Relativity",
      "Quantum Phenomena",
      "Atomic Physics",
      "Quantum Mechanics",
      "Nuclear Physics",
      "Radioactivity",
      "Quantum Principles"
    ],
  },
  {
    id: "solid",
    name: "Solid State & Electronics",
    subtopics: [
      "Crystal Structure",
      "X-Ray Diffraction",
      "Semiconductors",
      "p-n Junction & Diodes",
      "Bipolar Junction Transistors",
      "Amplifiers",
      "Oscillators",
      "Operational Amplifiers",
      "Digital Electronics",
      "Logic Gates"
    ],
  }
];

const subtopicToSubjId = {};
const subtopicToSubjName = {};
syllabus.forEach(s => {
  s.subtopics.forEach(st => {
    subtopicToSubjId[st] = s.id;
    subtopicToSubjName[st] = s.name;
  });
});

// Calibrated IIT JAM difficulty calculation
function getMarksAndDifficulty(q) {
  const id = q.id;
  let marks = 1;
  let difficulty = "Medium";

  if (id >= 1 && id <= 10) {
    // Section A: 1-mark MCQ (Foundational / Direct Application)
    marks = 1;
    const solLen = (q.detailedSolution || '').length;
    if (solLen > 1400 || (q.question && (q.question.includes('eigenvalue') && q.question.includes('diagonal')))) {
      difficulty = "Medium";
    } else {
      difficulty = "Easy";
    }
  } else if (id >= 11 && id <= 30) {
    // Section A: 2-mark MCQ (Core Analytical Problems)
    marks = 2;
    const solLen = (q.detailedSolution || '').length;
    if (solLen > 1500 || (q.question && q.question.includes('differential equation') && solLen > 1100)) {
      difficulty = "Hard";
    } else {
      difficulty = "Medium";
    }
  } else if (id >= 31 && id <= 40) {
    // Section B: 2-mark MSQ (Multiple Select Questions)
    marks = 2;
    const solLen = (q.detailedSolution || '').length;
    if (solLen < 750 && q.options && q.options.every(opt => opt.length < 50)) {
      difficulty = "Medium";
    } else {
      difficulty = "Hard";
    }
  } else if (id >= 41 && id <= 50) {
    // Section C: 1-mark NAT (Direct Numerical Answers)
    marks = 1;
    const solLen = (q.detailedSolution || '').length;
    if (solLen > 1300) {
      difficulty = "Medium";
    } else {
      difficulty = "Easy";
    }
  } else if (id >= 51 && id <= 60) {
    // Section C: 2-mark NAT (Multi-step Numerical Answers)
    marks = 2;
    const solLen = (q.detailedSolution || '').length;
    if (solLen < 850) {
      difficulty = "Medium";
    } else {
      difficulty = "Hard";
    }
  }

  return { marks, difficulty };
}

// Generate the new enriched questions.js code
let out = `export const questions = [\n`;

questions.forEach((q, idx) => {
  const key = `${q.year}_${q.id}`;
  let finalSubject = q.subject;
  let finalSubjectId = subtopicToSubjId[q.subject] || 'solid';
  let tags = [finalSubject];

  if (specificFixes[key]) {
    finalSubject = specificFixes[key].subject;
    finalSubjectId = specificFixes[key].subjectId;
    tags = specificFixes[key].tags;
  } else {
    // If logic gates or digital electronics
    if (finalSubject === 'Logic Gates') {
      tags = ['Logic Gates', 'Digital Electronics', 'Solid State & Electronics'];
    } else if (finalSubject === 'Digital Electronics') {
      tags = ['Digital Electronics', 'Solid State & Electronics'];
    } else {
      const parentName = subtopicToSubjName[finalSubject];
      if (parentName) tags.push(parentName);
    }
  }

  const { marks, difficulty } = getMarksAndDifficulty(q);

  out += `  {\n`;
  out += `    id: ${q.id},\n`;
  out += `    year: ${q.year},\n`;
  out += `    marks: ${marks},\n`;
  out += `    difficulty: "${difficulty}",\n`;
  out += `    subject: "${finalSubject}",\n`;
  out += `    subjectId: "${finalSubjectId}",\n`;
  out += `    tags: ${JSON.stringify(tags)},\n`;
  out += `    type: "${q.type}",\n\n`;

  out += `    question: String.raw\`${q.question.replace(/`/g, '\\`')}\`,\n\n`;

  if (q.options && q.options.length > 0) {
    out += `    options: [\n`;
    q.options.forEach(opt => {
      out += `      String.raw\`${opt.replace(/`/g, '\\`')}\`,\n`;
    });
    out += `    ],\n\n`;
  }

  if (q.optionImages && q.optionImages.length > 0) {
    out += `    optionImages: ${JSON.stringify(q.optionImages)},\n\n`;
  }

  if (q.image) {
    out += `    image: "${q.image}",\n\n`;
  }
  if (q.questionImage) {
    out += `    questionImage: "${q.questionImage}",\n\n`;
  }

  if (q.detailedSolution) {
    out += `    detailedSolution: String.raw\`${q.detailedSolution.replace(/`/g, '\\`')}\`,\n\n`;
  }

  if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
    out += `    correctAnswer: ${Number(q.correctAnswer)},\n`;
  }
  if (q.correctAnswers) {
    out += `    correctAnswers: ${JSON.stringify(q.correctAnswers.map(Number))},\n`;
  }
  if (q.correctAnswerMin !== undefined && q.correctAnswerMin !== null) {
    const minVal = typeof q.correctAnswerMin === 'string' ? parseFloat(q.correctAnswerMin) : q.correctAnswerMin;
    out += `    correctAnswerMin: ${isNaN(minVal) ? 0 : minVal},\n`;
  }
  if (q.correctAnswerMax !== undefined && q.correctAnswerMax !== null) {
    const maxVal = typeof q.correctAnswerMax === 'string' ? parseFloat(q.correctAnswerMax) : q.correctAnswerMax;
    out += `    correctAnswerMax: ${isNaN(maxVal) ? 0 : maxVal},\n`;
  }

  out += `  }${idx < questions.length - 1 ? ',' : ''}\n\n`;
});

out += `];\n`;

fs.writeFileSync(qPath, out, 'utf8');
console.log(`Successfully transformed and enriched all ${questions.length} questions in ${qPath}!`);
