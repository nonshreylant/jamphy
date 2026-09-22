const fs = require('fs');

// Load questions
let qCode = fs.readFileSync('src/data/questions.js', 'utf8');
qCode = qCode.replace('export const questions =', 'module.exports = { questions:');
const li = qCode.lastIndexOf('];');
if (li !== -1) {
  qCode = qCode.substring(0, li) + ']}' + qCode.substring(li + 2);
}
fs.writeFileSync('temp_questions.js', qCode);
const { questions } = require('../temp_questions.js');
fs.unlinkSync('temp_questions.js');

const mapOptics = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('interfer')) return 'Interference';
  if (text.includes('diffract') || text.includes('slit') || text.includes('grating')) return 'Diffraction';
  if (text.includes('polariz') || text.includes('retarder')) return 'Polarization';
  return 'Geometrical Optics';
};

const mapMath = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('matrix') || text.includes('eigenvalue')) return 'Matrices & Determinants';
  if (text.includes('differential equation') || text.includes('dy/dx')) return 'Differential Equations';
  if (text.includes('complex') || text.includes('contour') || text.includes('z=')) return 'Complex Numbers';
  if (text.includes('gradient') || text.includes('curl') || text.includes('divergence') || text.includes('vector')) return 'Vector Algebra & Vector Calculus';
  if (text.includes('fourier')) return 'Fourier Series';
  if (text.includes('error') || text.includes('standard deviation')) return 'Error Analysis & Statistics';
  return 'Calculus';
};

const mapSolid = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('bragg') || text.includes('x-ray')) return 'X-Ray Diffraction';
  if (text.includes('semiconductor') || text.includes('band') || text.includes('fermi') || text.includes('hole')) return 'Semiconductors';
  if (text.includes('lattice') || text.includes('crystal') || text.includes('bcc') || text.includes('fcc') || text.includes('miller')) return 'Crystal Structure';
  return 'Crystal Structure';
};

const mapElectronics = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('opamp') || text.includes('operational amplifier')) return 'Operational Amplifiers';
  if (text.includes('logic') || text.includes('gate') || text.includes('boolean')) return 'Logic Gates';
  if (text.includes('transistor') || text.includes('emitter') || text.includes('collector') || text.includes('n-p-n')) return 'Bipolar Junction Transistors';
  if (text.includes('diode') || text.includes('zener') || text.includes('rectifier')) return 'p-n Junction & Diodes';
  if (text.includes('rc circuit') || text.includes('ac circuit')) return 'DC & AC Circuits';
  return 'Digital Electronics';
};

const mapMechanics = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('central force') || text.includes('orbit') || text.includes('planet') || text.includes('kepler')) return 'Central Force Motion';
  if (text.includes('fluid') || text.includes('viscous') || text.includes('buoyancy') || text.includes('bernoulli')) return 'Fluid Mechanics';
  if (text.includes('rigid') || text.includes('moment of inertia') || text.includes('torque') || text.includes('angular momentum') || text.includes('cylinder') || text.includes('sphere')) return 'Rigid Body Dynamics';
  if (text.includes('collision') || text.includes('elastic') || text.includes('inelastic')) return 'Collisions';
  if (text.includes('coriolis') || text.includes('rotating frame')) return 'Non-Inertial Frames';
  if (text.includes('spring') || text.includes('oscillation') || text.includes('shm')) return 'Simple Harmonic Motion';
  return 'Newtonian Mechanics';
};

const mapEM = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('capacitor') || text.includes('dielectric')) return 'Conductors, Capacitors & Electrostatic Energy';
  if (text.includes('magnetic field') || text.includes('biot-savart') || text.includes('ampere')) return 'Magnetostatics';
  if (text.includes('induction') || text.includes('faraday') || text.includes('mutual inductance')) return 'Electromagnetic Induction';
  if (text.includes('maxwell') || text.includes('electromagnetic wave') || text.includes('em wave') || text.includes('poynting')) return "Maxwell's Equations & Electromagnetic Waves";
  if (text.includes('reflection') || text.includes('refraction') || text.includes('fresnel')) return 'Reflection & Refraction of EM Waves';
  return 'Electrostatics';
};

const mapThermo = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('carnot')) return 'Carnot Cycle';
  if (text.includes('entropy')) return 'Entropy & Second Law';
  if (text.includes('phase transition') || text.includes('clausius')) return 'Phase Transitions';
  if (text.includes('potential') || text.includes('maxwell relation')) return 'Thermodynamic Relations & Potentials';
  if (text.includes('adiabatic') || text.includes('isothermal') || text.includes('isobaric') || text.includes('isochoric')) return 'Thermodynamic Processes';
  if (text.includes('fermi-dirac') || text.includes('bose-einstein') || text.includes('partition function') || text.includes('statistical')) return 'Statistical Mechanics';
  if (text.includes('kinetic theory') || text.includes('rms speed') || text.includes('mean free path')) return 'Kinetic Theory of Gases';
  return 'Laws of Thermodynamics';
};

const mapModern = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('relativity') || text.includes('lorentz') || text.includes('speed of light')) return 'Special Relativity';
  if (text.includes('nucleus') || text.includes('radioactiv') || text.includes('half-life') || text.includes('decay')) return 'Radioactivity';
  if (text.includes('atom') || text.includes('bohr') || text.includes('rydberg') || text.includes('hydrogen atom')) return 'Atomic Physics';
  if (text.includes('quantum') || text.includes('schrodinger') || text.includes('wavefunction') || text.includes('compton') || text.includes('photoelectric')) return 'Quantum Phenomena';
  return 'Quantum Mechanics';
};

const mapWaves = (q) => {
  const text = (q.question + ' ' + (q.detailedSolution || '')).toLowerCase();
  if (text.includes('damped') || text.includes('forced')) return 'Damped & Forced Oscillations';
  if (text.includes('superposition') || text.includes('beat') || text.includes('lissajous')) return 'Superposition of Oscillations';
  if (text.includes('group velocity') || text.includes('phase velocity')) return 'Phase & Group Velocity';
  if (text.includes('sound') || text.includes('doppler') || text.includes('acoustic')) return 'Sound Waves';
  if (text.includes('shm') || text.includes('simple harmonic')) return 'Simple Harmonic Motion';
  return 'Wave Motion';
};

let fileContent = fs.readFileSync('src/data/questions.js', 'utf8');
let updatedCount = 0;

for (const q of questions) {
  let newSubject = null;
  const subj = q.subject;

  if (subj === 'Mathematics' || subj === 'Mathematical Physics') newSubject = mapMath(q);
  else if (subj === 'Optics') newSubject = mapOptics(q);
  else if (subj === 'Solid State Physics') newSubject = mapSolid(q);
  else if (subj === 'Electronics') newSubject = mapElectronics(q);
  else if (subj === 'Classical Mechanics') newSubject = mapMechanics(q);
  else if (subj === 'Electromagnetism' || subj === 'Electromagnetic Theory') newSubject = mapEM(q);
  else if (subj === 'Thermodynamics and Statistical Physics' || subj === 'Thermodynamics' || subj === 'Statistical Physics') newSubject = mapThermo(q);
  else if (subj === 'Modern Physics') newSubject = mapModern(q);
  else if (subj === 'Waves and Oscillations' || subj === 'Waves and Optics') newSubject = mapWaves(q);

  if (newSubject && newSubject !== subj) {
    const searchPattern = new RegExp("(id:\\s*" + q.id + ",\\s*\\n\\s*year:\\s*" + q.year + ",\\s*\\n\\s*subject:\\s*)([\"']" + q.subject + "[\"'])");
    const match = fileContent.match(searchPattern);

    if (match) {
      fileContent = fileContent.replace(searchPattern, "$1\"" + newSubject + "\"");
      updatedCount++;
    } else {
      const altPattern = new RegExp("(year[\"']?:\\s*" + q.year + "[\\s\\S]*?id[\"']?:\\s*" + q.id + "[\\s\\S]*?subject[\"']?:\\s*)([\"']" + q.subject + "[\"'])");
      const altMatch = fileContent.match(altPattern);
      if (altMatch) {
        fileContent = fileContent.replace(altPattern, "$1\"" + newSubject + "\"");
        updatedCount++;
      } else {
        console.log("Could not replace ID " + q.id + " Year " + q.year);
      }
    }
  }
}

fs.writeFileSync('src/data/questions.js', fileContent);
console.log("Successfully classified " + updatedCount + " questions using heuristic mapping!");
