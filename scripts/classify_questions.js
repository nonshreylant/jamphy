const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');



// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// Load syllabus subtopics
let syllabusCode = fs.readFileSync('src/data/syllabus.js', 'utf8');
syllabusCode = syllabusCode.replace('export const syllabus', 'module.exports');
fs.writeFileSync('temp_syllabus.js', syllabusCode);
const syllabus = require('../temp_syllabus.js');
const VALID_SUBTOPICS = syllabus.flatMap(c => c.subtopics);
fs.unlinkSync('temp_syllabus.js');

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

async function classify() {
  let fileContent = fs.readFileSync('src/data/questions.js', 'utf8');
  let updatedCount = 0;

  for (const q of questions) {
    if (!VALID_SUBTOPICS.includes(q.subject)) {
      console.log("Classifying Year " + q.year + ", ID " + q.id + " (Current: " + q.subject + ")");

      const prompt = "You are an expert physics professor classifying questions for the IIT JAM Physics exam.\\n" +
"Classify the following physics question into EXACTLY ONE of the following specific subtopics.\\n" +
"Respond ONLY with the exact name of the subtopic from the list. Do not include quotes or any other text.\\n\\n" +
"VALID SUBTOPICS:\\n" +
VALID_SUBTOPICS.join('\\n') + "\\n\\n" +
"QUESTION:\\n" +
q.question + "\\n\\n" +
"OPTIONS (if any):\\n" +
(q.options ? q.options.join('\\n') : 'N/A') + "\\n\\n" +
"SOLUTION/HINT:\\n" +
(q.detailedSolution || 'N/A') + "\\n";

      try {
        const result = await model.generateContent(prompt);
        let newSubject = result.response.text().trim();

        if (VALID_SUBTOPICS.includes(newSubject)) {
          // Locate the question block in the file string
          // We look for id: <id> then year: <year> then subject: "<oldSubject>"
          const searchPattern = new RegExp("(id:\\s*" + q.id + ",\\s*\\n\\s*year:\\s*" + q.year + ",\\s*\\n\\s*subject:\\s*)([\"']" + q.subject + "[\"'])");
          const match = fileContent.match(searchPattern);
          
          if (match) {
            fileContent = fileContent.replace(searchPattern, "$1\"" + newSubject + "\"");
            console.log("  -> Assigned to: " + newSubject);
            updatedCount++;
          } else {
             // Try alternative order or format if first regex fails
             const altPattern = new RegExp("(year[\"']?:\\s*" + q.year + "[\\s\\S]*?id[\"']?:\\s*" + q.id + "[\\s\\S]*?subject[\"']?:\\s*)([\"']" + q.subject + "[\"'])");
             const altMatch = fileContent.match(altPattern);
             if (altMatch) {
                 fileContent = fileContent.replace(altPattern, "$1\"" + newSubject + "\"");
                 console.log("  -> Assigned to: " + newSubject);
                 updatedCount++;
             } else {
                 console.log("  -> Could not replace in file for some reason.");
             }
          }
        } else {
          console.log("  -> Gemini returned invalid subtopic: " + newSubject);
        }

        // delay to avoid rate limit (20 RPM max)
        await new Promise(r => setTimeout(r, 4000));
      } catch (err) {
        console.error('Error classifying question:', err);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync('src/data/questions.js', fileContent);
    console.log("\\nSuccessfully classified and updated " + updatedCount + " questions!");
  } else {
    console.log('\\nNo questions needed updating or all failed.');
  }

  // Final Validation
  let newCode = fileContent.replace('export const questions =', 'module.exports = { questions: ');
  const li2 = newCode.lastIndexOf('];');
  if (li2 !== -1) {
    newCode = newCode.substring(0, li2) + ']}' + newCode.substring(li2 + 2);
  }
  fs.writeFileSync('temp_validation.js', newCode);
  const { questions: updatedQs } = require('../temp_validation.js');
  fs.unlinkSync('temp_validation.js');

  console.log("\\nValidation:");
  console.log("Total questions: " + updatedQs.length);
  const years = {};
  updatedQs.forEach(uq => years[uq.year] = (years[uq.year] || 0) + 1);
  console.log('Breakdown by year:', years);
}

classify();
