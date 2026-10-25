import { readFileSync, writeFileSync } from 'node:fs';
const built = JSON.parse(readFileSync('built.json', 'utf8'));
const OV = [
 ['HELM%20Workbook%207', 'HELM Workbook 7: Matrices (Loughborough University)'],
 ['HELM%20Workbook%208', 'HELM Workbook 8: Matrix Solution of Equations (Loughborough University)'],
 ['HELM%20Workbook%2049', "HELM Workbook 49: Student's Guide (Loughborough University)"],
 ['sheffield.ac.uk/media/31972', 'HELM Workbook 9: Vectors, section 9.4 The Vector Product (copy hosted by the University of Sheffield, SECONDARY)'],
 ['sqa.org.uk/sqa/files/hn/H7K335', 'SQA Higher National Unit specification: Engineering Mathematics 4 (H7K3 35)'],
 ['sqa.org.uk/files/nq/D32113', 'SQA National Unit Specification: Mathematics 1 (Advanced Higher), D321 13'],
 ['hncd-l45-engineering-rqf', 'Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering: specification (2017), Unit 2 Engineering Mathematics'],
 ['htu.edu.jo', 'Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering: specification (Issue 6, 2019; copy hosted by htu.edu.jo, SECONDARY)'],
 ['btec-hncd-engineering-2024', 'Pearson BTEC Higher Nationals in Engineering: specification (2024)'],
 ['second-engineer-written-examination-syllabuses/mathematics', 'Mathematics Written Examination Syllabus (MCA Second Engineer) - GOV.UK'],
 ['marine-electro-technology', 'Marine Electro-Technology Written Examination Syllabus (MCA Second Engineer) - GOV.UK'],
 ['par.nsf.gov', 'RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED)'],
 ['9FM0_01_pef', 'Examiners Report: Pearson Edexcel GCE Further Mathematics, Paper 01 Core Pure Mathematics 1, November 2021'],
 ['wfm01-01-pef', 'Examiners Report: Pearson Edexcel International Advanced Level Further Pure Mathematics F1 (WFM01), Summer 2024'],
 ['archive-ouverte.unige.ch', 'On the Teaching of Linear Algebra (Dorier, ed.), Kluwer 2000, front matter and chapter summaries (Archive ouverte UNIGE)'],
 ['files.eric.ed.gov/fulltext/EJ1366218', 'Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218)'],
 ['sites.cos.unt.edu', 'A Geometric Approach to Determinants (Hannah, American Mathematical Monthly)'],
 ['ieeexplore.ieee.org', 'A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park (IEEE Xplore abstract)'],
 ['pmc.ncbi.nlm.nih.gov', 'Angular Rate Optimal Design for the Rotary Strapdown Inertial Navigation System (PMC4029711)'],
 ['sites.math.washington.edu', 'Electrical Networks (University of Washington Math 308 project)'],
 ['sites.lsa.umich.edu', 'Math 217: The Determinant of a linear transformation (Karen Smith, University of Michigan)'],
 ['math.jhu.edu/~lindblad/201/l22', '6.3 Geometric Interpretation of Determinants (Lindblad, Johns Hopkins, lecture 22)'],
 ['sites.math.duke.edu', 'Determinants (Duke University, Math 1553 notes)'],
 ['math.mit.edu/~gs', 'Introduction to Linear Algebra, 5th Edition, section 2.5 (Strang, MIT)'],
 ['dspace.mit.edu', 'A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park (MIT DSpace, author manuscript)'],
 ['sist.sathyabama', 'Power system analysis lecture notes SEE1302 (Sathyabama, SECONDARY)'],
 ['unene.ca', 'Reactor Statics, Essential CANDU chapter 4 (UNENE)'],
 ['onlinelibrary.wiley.com', 'Solving the discretised neutron diffusion equations using neural networks (Phillips et al., Int. J. Numerical Methods in Engineering, 2023)'],
 ['doras.dcu.ie', 'A study of students concept images of inverse functions in Ireland and Sweden (Breen et al., DCU)'],
 ['eric.ed.gov/?id=EJ1018729', 'Three Interpretations of the Matrix Equation Ax = b (Larson and Zandieh, For the Learning of Mathematics 2013; ERIC EJ1018729)'],
 ['meetings-archive.aps.org', "A Study of Physics Students' Interpretation of Matrix Multiplication (APS April Meeting 2023 abstract)"],
 ['drps.ed.ac.uk', 'Engineering Mathematics 1a (MATH08074), University of Edinburgh course catalogue 2024/25'],
 ['nibmehub.com', 'Basic Engineering Mathematics, Fifth Edition (Bird; copy hosted by nibmehub.com, SECONDARY)'],
 ['pageplace.de', "Bird's Engineering Mathematics, Ninth Edition: contents (preview hosted by pageplace.de, SECONDARY)"],
 ['maths.scot', 'Matrices: Advanced Higher Maths (maths.scot)'],
];
const title = (q) => { for (const [k, t] of OV) if (q.url.includes(k)) return t; return q.title; };
const tpl = readFileSync('notes.tpl.md', 'utf8');
const byId = Object.fromEntries(built.map((q) => [q.id, q]));
const used = new Set();
const fmt = (q) => `- **${q.claim}**\n  - Source: ${title(q)}. ${q.url}\n  - Quote: "${q.quote}"`;
let missing = [];
const out = tpl.replace(/^\{\{([a-z0-9-]+)\}\}$/gm, (m, id) => { const q = byId[id]; if (!q) { missing.push(id); return m; } used.add(id); return fmt(q); });
if (missing.length) { console.error('MISSING', missing); process.exit(1); }
const unused = built.filter((q) => !used.has(q.id)).map((q) => q.id);
if (unused.length) console.error('UNUSED in notes (will be dropped from quotes.json):', unused.join(' '));
const dir = '/home/user/Study-App/build/maths/matrices/';
writeFileSync(dir + 'research-notes.md', out);
const qs = built.filter((q) => used.has(q.id)).map((q) => ({ section: q.section, claim: q.claim, title: title(q), url: q.url, quote: q.quote }));
writeFileSync(dir + 'quotes.json', JSON.stringify(qs, null, 1));
console.log('notes written; quotes', qs.length);
