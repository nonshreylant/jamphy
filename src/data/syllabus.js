export const syllabus = [
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
    subSubtopics: {
      "Calculus": [
        "Functions of Single & Several Variables",
        "Partial Derivatives & Total Differential",
        "Taylor & Maclaurin Series",
        "Maxima and Minima",
        "Multiple Integrals (Double & Triple Integrals)",
        "Line, Surface & Volume Integrals",
        "Jacobians & Coordinate Transformations"
      ],
      "Vector Algebra & Vector Calculus": [
        "Gradient, Divergence & Curl",
        "Gauss's Divergence Theorem",
        "Stokes' Theorem & Green's Theorem",
        "Vector Identities & Directional Derivatives",
        "Curvilinear Coordinates (Cylindrical & Spherical)"
      ],
      "Fourier Series": [
        "Fourier Series Expansion & Coefficients",
        "Even & Odd Functions & Half-Range Series",
        "Dirichlet Conditions & Convergence",
        "Parseval's Identity"
      ],
      "Differential Equations": [
        "First-Order Linear & Non-linear ODEs",
        "Separable & Exact Differential Equations",
        "Second-Order Linear ODEs with Constant Coefficients",
        "Homogeneous & Inhomogeneous Equations",
        "Cauchy-Euler Equations"
      ],
      "Matrices & Determinants": [
        "Eigenvalues and Eigenvectors",
        "Diagonalization & Cayley-Hamilton Theorem",
        "Hermitian, Unitary, Symmetric & Orthogonal Matrices",
        "Rank, Trace & Determinant Properties",
        "System of Linear Equations"
      ],
      "Complex Numbers": [
        "Complex Algebra & Euler's Formula",
        "Analytic Functions & Cauchy-Riemann Conditions",
        "Cauchy's Integral Theorem & Formula",
        "Residue Theorem & Contour Integration",
        "Taylor & Laurent Series"
      ],
      "Error Analysis & Statistics": [
        "Propagation of Errors",
        "Mean, Standard Deviation & Variance",
        "Gaussian / Normal Distribution",
        "Least Squares Curve Fitting",
        "Binomial & Poisson Distributions"
      ]
    }
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
    subSubtopics: {
      "Newtonian Mechanics": [
        "Newton's Laws & Equations of Motion",
        "Work-Energy Theorem & Potential Energy Curves",
        "Friction & Motion on Inclines",
        "Circular Motion & Centripetal Acceleration"
      ],
      "Non-Inertial Frames": [
        "Inertial vs Non-Inertial Frames",
        "Centrifugal Force",
        "Coriolis Force & Applications",
        "Fictitious / Pseudo Forces"
      ],
      "Central Force Motion": [
        "Two-Body Problem & Reduced Mass",
        "Kepler's Laws of Planetary Motion",
        "Gravitational Potential & Bound / Unbound Orbits",
        "Effective Potential & Orbit Stability",
        "Runge-Lenz Vector & Orbital Dynamics"
      ],
      "Conservation Laws": [
        "Conservation of Linear Momentum",
        "Conservation of Angular Momentum",
        "Conservation of Mechanical Energy",
        "Symmetries & Conservation Principles"
      ],
      "System of Particles": [
        "Center of Mass Frame & Motion",
        "Motion of Variable Mass Systems (Rockets)",
        "Momentum & Kinetic Energy of Multi-Particle Systems"
      ],
      "Collisions": [
        "Elastic & Inelastic Collisions in 1D & 2D",
        "Coefficient of Restitution",
        "Laboratory vs Center of Mass (CM) Frames",
        "Scattering Angle & Energy Transfer"
      ],
      "Rigid Body Dynamics": [
        "Moment of Inertia & Tensor of Inertia",
        "Parallel & Perpendicular Axis Theorems",
        "Rotational Dynamics & Torque Equation",
        "Pure Rolling & Rolling with Slipping",
        "Precession & Gyroscopic Motion"
      ],
      "Fluid Mechanics": [
        "Equation of Continuity",
        "Bernoulli's Theorem & Applications",
        "Viscosity & Poiseuille's Flow",
        "Stokes' Law & Terminal Velocity",
        "Surface Tension & Capillary Action"
      ]
    }
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
    subSubtopics: {
      "Simple Harmonic Motion": [
        "Undamped SHM Differential Equation",
        "Energy in SHM (Kinetic, Potential, Total)",
        "Simple & Physical Pendulum",
        "Torsional Oscillations & LC Oscillators"
      ],
      "Superposition of Oscillations": [
        "Superposition of Collinear Oscillations & Beats",
        "Superposition of Perpendicular Oscillations (Lissajous Figures)",
        "Phase Difference & Amplitude Relations"
      ],
      "Damped & Forced Oscillations": [
        "Damped Harmonic Oscillator (Under, Over, Critical)",
        "Quality Factor (Q) & Logarithmic Decrement",
        "Forced Oscillations & Resonance (Amplitude & Velocity)",
        "Power Absorption & Bandwidth"
      ],
      "Wave Motion": [
        "1D Wave Equation & General Solutions",
        "Traveling Waves & Wave Parameters",
        "Standing / Stationary Waves & Boundary Conditions",
        "Reflection & Transmission at Boundaries",
        "Energy Density & Power Transmission"
      ],
      "Phase & Group Velocity": [
        "Phase Velocity vs Group Velocity",
        "Dispersion Relations in Media (Normal vs Anomalous)",
        "Wave Packets & Pulse Spreading"
      ],
      "Sound Waves": [
        "Speed of Sound in Gases, Liquids & Solids",
        "Pressure Waves vs Displacement Waves",
        "Doppler Effect for Sound (Source, Observer, Wind)",
        "Organ Pipes, Resonance Tubes & Acoustics"
      ],
      "Geometrical Optics": [
        "Fermat's Principle & Laws of Reflection/Refraction",
        "Matrix Methods in Paraxial Optics (Ray Matrices)",
        "Thick & Thin Lenses & Combinations",
        "Optical Instruments (Microscopes & Telescopes)",
        "Chromatic & Spherical Aberrations"
      ],
      "Interference": [
        "Young's Double Slit Experiment & Fringe Width",
        "Interference in Thin Films & Wedge Films",
        "Newton's Rings & Radius Calculation",
        "Michelson Interferometer & Fringe Shifts",
        "Temporal & Spatial Coherence"
      ],
      "Diffraction": [
        "Fraunhofer Diffraction at a Single Slit",
        "Fraunhofer Diffraction at Double & N-Slits (Grating)",
        "Circular Aperture & Airy Disk",
        "Resolving Power of Grating, Microscope & Telescope",
        "Fresnel Diffraction & Zone Plates"
      ],
      "Polarization": [
        "Linear, Circular & Elliptic Polarization",
        "Brewster's Law & Polarization by Reflection",
        "Double Refraction & Birefringence (Calcite, Quartz)",
        "Quarter-Wave & Half-Wave Plates",
        "Optical Activity & Specific Rotation",
        "Malus's Law"
      ]
    }
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
    subSubtopics: {
      "Electrostatics": [
        "Coulomb's Law & Electric Field Calculations",
        "Gauss's Law in Integral & Differential Form",
        "Electrostatic Potential & Equipotential Surfaces",
        "Electric Dipole & Multipole Expansion",
        "Work & Electrostatic Energy"
      ],
      "Laplace's Equation": [
        "Poisson's & Laplace's Equations",
        "Boundary Value Problems in Cartesian, Cylindrical & Spherical",
        "Uniqueness Theorem",
        "Method of Images (Point Charge near Plane/Sphere)"
      ],
      "Conductors, Capacitors & Electrostatic Energy": [
        "Properties of Ideal Conductors",
        "Capacitance of Parallel Plate, Cylindrical & Spherical",
        "Capacitors with Dielectrics (Series & Parallel)",
        "Electrostatic Energy Density & Forces on Conductors"
      ],
      "Dielectrics": [
        "Electric Polarization & Bound Charge Densities",
        "Electric Displacement Vector (D-field)",
        "Linear Dielectrics & Dielectric Constant / Susceptibility",
        "Boundary Conditions for D and E Fields",
        "Clausius-Mossotti Equation"
      ],
      "Magnetostatics": [
        "Biot-Savart Law & Magnetic Field of Wire, Loop, Solenoid",
        "Ampère's Circuital Law & Differential Form",
        "Magnetic Vector Potential (A-field) & Gauge Invariance",
        "Magnetic Dipole & Force / Torque on Dipoles",
        "Boundary Conditions on B and H Fields",
        "Magnetization & Magnetic Susceptibility / Permeability"
      ],
      "Electromagnetic Induction": [
        "Faraday's Law & Lenz's Law",
        "Motional EMF & Eddy Currents",
        "Self-Inductance & Mutual Inductance",
        "Magnetic Energy & Energy Density in B-Field",
        "RL & RLC Transient Response"
      ],
      "DC & AC Circuits": [
        "Kirchhoff's Laws (KVL/KCL)",
        "Thevenin & Norton Theorems",
        "AC Circuit Analysis & Phasors",
        "Series & Parallel LCR Resonance (Q-factor & Bandwidth)",
        "AC Power, Power Factor & Filter Circuits"
      ],
      "Maxwell's Equations & Electromagnetic Waves": [
        "Displacement Current & Maxwell's Correction",
        "Complete Maxwell's Equations (Differential & Integral)",
        "EM Wave Equation in Vacuum & Non-Conducting Media",
        "Poynting Vector & Energy Flux Density",
        "Radiation Pressure & Momentum of EM Waves"
      ],
      "Reflection & Refraction of EM Waves": [
        "EM Waves at Dielectric Interfaces",
        "Fresnel's Equations & Polarization by Reflection",
        "Brewster's Angle & Total Internal Reflection (TIR)",
        "Skin Depth & Propagation in Conducting Media"
      ],
      "Charged Particle Dynamics": [
        "Lorentz Force (Electric + Magnetic Forces)",
        "Cyclotron Motion & Helical Trajectories",
        "Velocity Selector & Mass Spectrometry",
        "Magnetic Mirror & Drift Velocities"
      ]
    }
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
    subSubtopics: {
      "Kinetic Theory of Gases": [
        "Pressure & Kinetic Temperature of Ideal Gas",
        "Maxwell-Boltzmann Velocity & Speed Distributions",
        "Equipartition of Energy & Degrees of Freedom",
        "Specific Heat of Monatomic, Diatomic & Polyatomic Gases",
        "Mean Free Path, Collision Frequency & Transport Phenomena"
      ],
      "Equations of State": [
        "Ideal Gas Equation of State",
        "Van der Waals Equation & Real Gases",
        "Critical Constants (Pc, Vc, Tc) & Reduced Equation",
        "Virial Expansion & Compressibility Factor"
      ],
      "Laws of Thermodynamics": [
        "Zeroth Law & Concept of Temperature",
        "First Law of Thermodynamics (dQ = dU + dW)",
        "Internal Energy & Enthalpy",
        "Heat Capacities (Cp, Cv) & Mayer's Relation"
      ],
      "Thermodynamic Processes": [
        "Isothermal & Adiabatic Processes (Work Done, PV Diagram)",
        "Isobaric & Isochoric Processes",
        "Polytropic & Quasi-static Processes",
        "Reversible vs Irreversible Processes",
        "Free Expansion & Joule-Thomson Effect"
      ],
      "Entropy & Second Law": [
        "Clausius & Kelvin-Planck Statements",
        "Carnot's Theorem & Thermodynamic Temperature Scale",
        "Clausius Inequality & Definition of Entropy",
        "Entropy Change in Reversible & Irreversible Processes",
        "Principle of Increase of Entropy"
      ],
      "Carnot Cycle": [
        "Carnot Engine Cycle & Efficiency",
        "Carnot Refrigerator & Heat Pump (COP)",
        "Otto, Diesel & Stirling Cycles"
      ],
      "Thermodynamic Relations & Potentials": [
        "Helmholtz Free Energy (F) & Gibbs Free Energy (G)",
        "Maxwell's Thermodynamic Relations",
        "TdS Equations & Thermodynamic Identities",
        "Heat Capacity Ratios & Differences",
        "Joule-Thomson Coefficient & Inversion Temperature"
      ],
      "Phase Transitions": [
        "First-Order Phase Transitions & Latent Heat",
        "Clausius-Clapeyron Equation & Applications",
        "Second-Order Phase Transitions & Ehrenfest's Equations",
        "Triple Point & Phase Diagrams"
      ],
      "Statistical Mechanics": [
        "Microstates, Macrostates & Thermodynamic Probability",
        "Ensembles: Microcanonical, Canonical & Grand Canonical",
        "Canonical Partition Function & Thermodynamic Quantities",
        "Maxwell-Boltzmann, Fermi-Dirac & Bose-Einstein Distributions",
        "Density of States & Chemical Potential"
      ]
    }
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
    subSubtopics: {
      "Special Relativity": [
        "Postulates of Special Relativity",
        "Lorentz Transformations & Spacetime Invariance",
        "Length Contraction & Time Dilation (Twin Paradox)",
        "Relativistic Addition of Velocities",
        "Relativistic Momentum, Energy & Mass-Energy Equivalence",
        "Relativistic Doppler Effect",
        "Relativistic Collisions & Decay"
      ],
      "Quantum Phenomena": [
        "Photoelectric Effect & Einstein's Equation",
        "Compton Scattering & Compton Wavelength",
        "Blackbody Radiation & Planck's Radiation Law",
        "Wave-Particle Duality & de Broglie Wavelength",
        "Pair Production & Annihilation",
        "X-Ray Spectra, Bremsstrahlung & Moseley's Law",
        "Franck-Hertz Experiment"
      ],
      "Atomic Physics": [
        "Bohr's Model of Hydrogen Atom & Energy Levels",
        "Rydberg Formula & Spectral Series",
        "Reduced Mass Correction in Atomic Spectra",
        "Sommerfeld Model & Orbital Quantization",
        "Stern-Gerlach Experiment & Electron Spin",
        "Fine Structure & Spin-Orbit Coupling",
        "Zeeman Effect (Normal & Anomalous)"
      ],
      "Quantum Mechanics": [
        "1D Time-Independent & Time-Dependent Schrödinger Equations",
        "Particle in 1D & 3D Infinite Potential Wells (Box)",
        "Quantum Harmonic Oscillator",
        "Finite Potential Well & Bound States",
        "Potential Step, Barrier & Quantum Tunneling",
        "Wavefunction Properties, Normalization & Probability Current",
        "Quantum Operators, Eigenvalues, Commutators & Expectation Values",
        "Heisenberg Uncertainty Principle & Applications"
      ],
      "Nuclear Physics": [
        "Nuclear Size, Mass, Density & Binding Energy",
        "Semi-Empirical Mass Formula (Liquid Drop Model)",
        "Nuclear Spin, Magnetic Dipole & Electric Quadrupole Moment",
        "Nuclear Forces & Deuteron Problem",
        "Nuclear Fission, Fusion & Q-Value of Nuclear Reactions",
        "Magic Numbers & Nuclear Shell Model Basics"
      ],
      "Radioactivity": [
        "Radioactive Decay Law, Half-Life & Mean Life",
        "Alpha Decay & Geiger-Nuttall Law",
        "Beta Decay (Fermi Theory, Neutrino, Beta Spectra)",
        "Gamma Decay & Internal Conversion",
        "Radioactive Equilibrium (Secular & Transient) & Carbon Dating"
      ],
      "Quantum Principles": [
        "Postulates of Quantum Mechanics & Dirac Bra-Ket Notation",
        "Superposition Principle & Measurement Collapse",
        "Compatible vs Incompatible Observables & Simultaneous Eigenstates",
        "Ehrenfest Theorem & Correspondence Principle",
        "Parity & Conservation Laws in Quantum Systems"
      ]
    }
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
    subSubtopics: {
      "Crystal Structure": [
        "Bravais Lattices, Unit Cells & Crystal Systems (SC, BCC, FCC, HCP)",
        "Miller Indices & Interplanar Spacing",
        "Atomic Packing Fraction & Coordination Number",
        "Reciprocal Lattice Vectors & Properties",
        "Brillouin Zones"
      ],
      "X-Ray Diffraction": [
        "Bragg's Law of X-Ray Diffraction",
        "Laue Equations & Equivalence to Bragg's Law",
        "Powder Diffraction Method & Structure Factor",
        "Systematic Absences & Lattice Identification"
      ],
      "Semiconductors": [
        "Intrinsic Semiconductors & Carrier Concentration",
        "Extrinsic Semiconductors (n-type & p-type) & Dopant Ionization",
        "Fermi Level Position & Temperature Dependence",
        "Carrier Drift, Mobility, Conductivity & Einstein Relation",
        "Hall Effect & Hall Coefficient",
        "Band Gap (Direct vs Indirect Band Gap)"
      ],
      "p-n Junction & Diodes": [
        "Built-in Potential & Depletion Region Width",
        "Diode Equation & I-V Characteristics",
        "Reverse Breakdown: Zener & Avalanche Breakdown",
        "Zener Diode as Voltage Regulator",
        "Rectifiers (Half-Wave, Full-Wave, Bridge) & Filter Circuits",
        "Special Diodes (Photodiode, LED, Solar Cell)"
      ],
      "Bipolar Junction Transistors": [
        "BJT Construction & Working (NPN, PNP)",
        "Transistor Configurations (CB, CE, CC) & Characteristics",
        "Current Gain Parameters (alpha, beta, gamma) & Relations",
        "Transistor Biasing & Operating Point (Q-Point Stability)",
        "DC & AC Load Lines"
      ],
      "Amplifiers": [
        "Small-Signal CE Amplifier & h-Parameter Model",
        "Voltage Gain, Current Gain, Input & Output Impedance",
        "Frequency Response & Gain-Bandwidth Product",
        "Feedback in Amplifiers (Positive vs Negative Feedback)",
        "Effects of Negative Feedback on Gain, Bandwidth, Noise & Impedance"
      ],
      "Oscillators": [
        "Barkhausen Criterion for Sustained Oscillations",
        "RC Phase Shift Oscillator & Wien Bridge Oscillator",
        "LC Tuned Oscillators (Hartley & Colpitts Oscillators)",
        "Crystal Oscillators & Frequency Stability"
      ],
      "Operational Amplifiers": [
        "Ideal Op-Amp Characteristics & Virtual Ground Concept",
        "Inverting & Non-Inverting Amplifiers",
        "Summing Amplifier, Difference Amplifier & Instrumentation Amplifier",
        "Integrator & Differentiator Circuits",
        "Comparators & Schmitt Trigger",
        "Slew Rate, CMRR & Offset Voltages"
      ],
      "Digital Electronics": [
        "Number Systems (Binary, Octal, Decimal, Hex) & Conversions",
        "1's and 2's Complement Arithmetic",
        "BCD, Gray Codes & Parity Codes",
        "Multiplexers, Demultiplexers, Encoders & Decoders",
        "Flip-Flops (SR, JK, D, T) & Counters / Shift Registers"
      ],
      "Logic Gates": [
        "Basic Gates (AND, OR, NOT) & Truth Tables",
        "Universal Gates (NAND, NOR) & Function Realization",
        "Exclusive Gates (XOR, XNOR) & Parity Checkers",
        "Boolean Algebra & De Morgan's Laws",
        "Karnaugh Maps (K-Maps) & SOP / POS Minimization"
      ]
    }
  }
];

// Helper functions for easy traversal
export const getAllSubSubtopics = (subtopicName) => {
  for (const subject of syllabus) {
    if (subject.subSubtopics && subject.subSubtopics[subtopicName]) {
      return subject.subSubtopics[subtopicName];
    }
  }
  return [];
};

export const getSubjectForSubtopic = (subtopicName) => {
  return syllabus.find(subject => subject.subtopics.includes(subtopicName)) || null;
};

export const getSubtopicForSubSubtopic = (subSubtopicName) => {
  for (const subject of syllabus) {
    if (!subject.subSubtopics) continue;
    for (const [subtopic, subSubs] of Object.entries(subject.subSubtopics)) {
      if (subSubs.includes(subSubtopicName)) {
        return subtopic;
      }
    }
  }
  return null;
};

export const getSubjectForSubSubtopic = (subSubtopicName) => {
  const subtopic = getSubtopicForSubSubtopic(subSubtopicName);
  if (!subtopic) return null;
  return getSubjectForSubtopic(subtopic);
};
