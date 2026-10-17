# Functions and their graphs: research notes

Researched 17 Oct 2026 for the Functions and their graphs course brief (Maths shelf, Algebra folder; blurb "A function as a
machine: inputs, outputs and their graphs, and how shifting or stretching a graph changes its rule."; benchmark "Brilliant:
Introduction to Functions and Coordinate Transformations"). The brief itself is not written here; these notes are its
evidence. Dan is an electrician preparing for marine engineering college (HNC/HND route). He has Fractions, Negative numbers,
Percentages, Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals, Linear equations and
Calculus fundamentals built. In the same push, Straight-line graphs, Linear systems and Powers and roots come before this
course in the folder, so they are assumed done (I read their briefs in `build/maths/`, not their lessons).

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`: files 01 to 06 are
earlier courses' syllabus pages copied unchanged (01 = calculus tools 20, MCA Second Engineer Mathematics; 02 = calculus 34 and
03 = calculus 39, SQA H7K033; 04 = calculus 60, Warsash; 05 = linear-equations 36, resistivity and temperature; 06 = calculus 51,
HELM 2.7), and 07 onward are this run's own searches and fetches. Findings I could not confirm are marked **UNCONFIRMED**;
where only a non-original site said it, **SECONDARY** (hosts that republish an original text, such as LibreTexts, Lumen and a
wiki, are marked SECONDARY where used). My own readings are marked "My reading" and are not quotes.

One method note. The app's source checker sees a search result cut to 12 KB, with the later results cut to a line or two.
So every page I wanted to quote from was fetched on its own with `web_fetch`, and a quote is kept only if the checker can find
it on that page. Where a search gave me a good line that the checker could not see, I fetched the page again or dropped the line
(listed in section 9).

---

## 1. Benchmark: Brilliant's Introduction to Functions and Coordinate Transformations

Brilliant has two courses that
together make the shelf's benchmark. Both pages were reachable on 17 Oct 2026. Introduction to Functions is at
`brilliant.org/courses/introduction-to-functions/` and Coordinate Transformations at `brilliant.org/courses/transformations/`.
Both give titles only, so the pictures inside each lesson are **UNCONFIRMED** (I did not open a lesson).



### 1.1 Introduction to Functions: 68 lessons, 14 levels

- **Brilliant Introduction to Functions is 68 lessons and 1216 exercises: "Connect inputs to outputs with functions"**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Connect inputs to outputs with functions. 68 Lessons 1216 Exercises"
- **Levels 1 to 4: finding the rule, function rules, graphing functions (linear, squared, absolute value), and non-function behaviour (vertical line test)**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Level 1 Introducing Functions Finding the Rule Word Functions Time Functions Repeating Outputs Deducing the Rule Level Check Level 2 Function Rules Numeric Rules Writing Rules Conditional Rules Deducing Numeric Rules Level Check Level 3 Graphing Functions Graphing Linear Functions Graphing Squared Functions Graphing Absolute Value Graphing Without an Equation Interpreting Graphed Functions Intercepts and Intervals Increasing and Decreasing Level 4 Non-Function Behavior Function Requirements Vertical Line Test Valid Functions Valid Intervals"
- **Levels 5 to 9: real-world, piecewise, function gallery, then domain and range (reciprocal, squares, square roots)**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Level 5 Real-World Functions Discrete Functions Depreciation Functions Multi-Part Functions Periodic Functions Level 6 Piecewise Functions Piecewise Functions Discontinuities Plotting Points Plotting Piecewise Functions Building Piecewise Functions Level 7 Function Gallery The Floor Function The Ceiling Function Plotting Floor and Ceiling Repeating Functions Periodicity Level 8 Domain and Range Domain Range Domain and Range Level 9 Visualizing Domain and Range Reciprocal Functions Squares and Ranges Square Roots and Domains Piecewise Ranges Identifying Domain and Range"
- **Levels 10 to 14: operations, composition, stretching and shifting, axis reflections, inverse functions**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Level 10 Function Operations Adding Functions Subtracting Functions Multiplying Functions Dividing Functions Level 11 Function Composition Chaining Functions Applying Multiple Functions Combining Functions Graphing Composites Composite Domains Level 12 Stretching and Shifting Vertical Shifting Horizontal Shifting Combining Shifts Vertical Stretching Horizontal Stretching Combining Stretches Level 13 Axis Reflections Reflection Across the x-Axis Reflection Across the y-Axis Composing Reflections Reflecting and Stretching Level 14 Inverse Functions Inverting a Function Finding the Input Finding the Inverse Function Graphing Inverse Functions Reflecting to Invert Invertibility Invertible Functions"
- **Course description and topics covered, including function notation and domain and range**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "We'll start by looking at a wide range of functions applied to numbers, strings of text and real world objects. We'll then explore properties of a wide range of numeric functions in the coordinate plane. Topics covered * Calculating the output of a function. * Deducing a function rule from inputs and outputs. * Function notation. * Functions on the coordinate plane. * Discrete and continuous functions. * Interpreting function graphs. * Piecewise functions. * Domain and range."
- **Brilliant states its own prerequisite for the course**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Before starting this course you should have familiarity with the coordinate plane, basic algebra and linear relationships of the form y=mx + c."

My reading of the order: Brilliant starts from "find the rule" with
words, time and repeating outputs (levels 1, 2), puts graphs of three families early (level 3: linear, squared, absolute value),
spends a level on what is not a function (level 4), then real-world, piecewise and floor/ceiling functions (5 to 7). Domain and
range come late (8, 9) and are taught on graphs of the reciprocal, the square and the square root. Then operations (10),
composition (11), shifts and stretches (12), reflections (13), and the inverse last (14). So the idea that matters most for this
course, "shift or stretch a graph and the rule changes", is level 12 of 14, after composition and before the inverse.


### 1.2 Coordinate Transformations: 60 lessons, 14 levels

The shelf blurb names this course as the second half of the benchmark.

- **Brilliant Coordinate Transformations is 60 lessons and 1014 exercises ("Master functions on the coordinate plane")**
  - Source: Practice Coordinate Transformations | Brilliant. https://brilliant.org/courses/transformations
  - Quote: "Master functions on the coordinate plane. 60 Lessons 1014 Exercises"
- **Coordinate Transformations levels 1 to 6: translations and rotations of points and shapes**
  - Source: Practice Coordinate Transformations | Brilliant. https://brilliant.org/courses/transformations
  - Quote: "Level 1 Translations Translating Points Negative Translations Translating Shapes Combining Translations Undoing Translations Level Check Level 2 Translations in Coordinates Coordinate-wise Translation Translating Shapes in x and y Fitting within a Region Level Check Level 3 Rotations Rotation Around the Origin Rotating Shapes Rotating Both Ways Composing Rotations Level 4 Rotations in Coordinates Rotating by 180° Rotating by 90° Rotating by 270° Rotating by Coordinates Level 5 Rotations and Translations Rotating before Translating Rotating Around a Point Rotating to Move Translating before Rotating Level 6 Rotating to Translate Translation by Rotation Gridline Translations Diagonal Translations Selecting Angles Limits of Rotation"
- **Levels 7 to 14: reflections, congruence, dilation, similarity, stretching**
  - Source: Practice Coordinate Transformations | Brilliant. https://brilliant.org/courses/transformations
  - Quote: "Level 7 Reflections Reflecting Across Axes Reflecting Across Lines The Line of Reflection Reflecting Shapes Reflection to a Region Reversing Reflection Level 8 Reflections in Coordinates Reflecting Coordinates Reflecting Vertices Reflecting Across y=x Reflecting Across y=-x Choosing the Coordinate Reflection Level 9 Combining Reflections Reflecting to Translate Reflecting to Rotate Reflecting to Rotate by 90° Rotation Around a Point 90° Rotation Around a Point Level 10 Congruence and Symmetry Congruence Proving Congruence Reflectional Symmetry Rotational Symmetry Identifying Symmetry Symmetry and Congruence Level 11 Dilation Dilating Points Dilating Shapes Dilating and Translating Level 12 Dilation and Translation Dilating Around a Point Dilating Points to Targets Translating By Dilating Level 13 Similarity Dilations and Congruence Similarity Identifying Similarity Level 14 Stretching Stretching in One Direction Stretching in Two Directions Stretching Shapes Transforming Points Into Targets"
- **Coordinate Transformations is about moving points and shapes, "both intuitively and as algebraic functions applied to the x and y coordinates"**
  - Source: Practice Coordinate Transformations | Brilliant. https://brilliant.org/courses/transformations
  - Quote: "In this course you'll manipulate points and shapes on the coordinate plane with translations, rotations, reflections and dilations. You'll learn to think of these transformations both intuitively and as algebraic functions applied to the x and y coordinates. Topics covered * Translation * Rotation * Reflection * Dilation * Stretching * Composed and inverse functions * Congruence and similarity * Line and rotational symmetry"
- **Its prerequisite and next steps**
  - Source: Practice Coordinate Transformations | Brilliant. https://brilliant.org/courses/transformations
  - Quote: "Familiarity with the coordinate plane and basic functions is an expected pre-requisite. Next steps include further courses on functions and the polar and complex plane."

My reading: this is mostly
geometry. It moves points and shapes (translate, rotate, reflect, dilate, stretch) and calls them "algebraic functions applied to
the x and y coordinates", for example T(x, y) = (x + 3, y). It is the other way to see a shift. The graph is a set of points and
the transformation moves every point, which is the picture behind Zazkis et al.'s teaching suggestion in section 6.6. Rotations,
congruence, symmetry and similarity are shape topics and are not part of "shifting or stretching a graph", so the brief can
leave them out. The function-of-a-graph version of shifting and stretching is Introduction to Functions levels 12 and 13.


### 1.3 Where they sit in Brilliant's path

- **Brilliant path: Intermediate Algebra puts Introduction to Functions first, then Linear Systems, Quadratics, Coordinate Transformations, Exponential Functions**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GRADES 8–11 Intermediate Algebra New Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant path: the band before (Algebra Fundamentals) ends with Exponents and Radicals and Visual Algebra**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GRADES 7–9 Algebra Fundamentals Build algebra tools for success in middle grades and beyond Build algebra tools for success in middle grades and beyond GR 7–8 Linear Equations GR 7–8 Coordinate Geometry GR 8–9 Linear Relationships GR 8 Exponents and Radicals GR 8–9 Visual Algebra"
- **Brilliant path: the later band holds trigonometric functions, polynomials, logarithms, complex numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GRADES 11–12 Advanced Algebra New Study the functions and graphs of later high school courses like Algebra 2, Integrated Math 2 and 3, and Precalculus Study the functions and graphs of later high school courses like Algebra 2, Integrated Math 2 and 3, and Precalculus GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Brilliant for AP Precalculus describes Introduction to Functions as the vocabulary course**
  - Source: How to prepare for AP Precalculus | Brilliant. https://brilliant.org/resources/test-prep/how-to-prepare-for-ap-precalculus
  - Quote: "Introduction to Functions (68 lessons) | Function rules, domain and range, composition, invertibility, periodicity — vocabulary all three tested units use | Writing Rules"

My reading: Brilliant puts Introduction to Functions first in "Intermediate Algebra", straight after the Algebra Fundamentals band (Linear Equations, Coordinate Geometry, Linear Relationships, Exponents and Radicals, Visual Algebra) and before Linear Systems and Quadratics.
In Dan's folder Linear systems and Powers and roots come first and Quadratics comes after, which is the same neighbourhood. The
order in `docs/shelves-maths.json` (Linear equations, Straight-line graphs, Linear systems, Powers and roots, Functions and their
graphs, Quadratics and polynomials, Exponentials and logarithms, Trigonometry, Complex numbers) follows Brilliant closely, except
that Brilliant has Coordinate Transformations after Quadratics and Exponential Functions after that.


### 1.4 What Brilliant covers just before it (Linear Relationships)

- **Brilliant Linear Relationships (56 lessons) comes just before it**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions/
  - Quote: "Identify linear patterns, find rates of change, and write equations to describe lines. 56 Lessons 999 Exercises"
- **Linear Relationships already has Graphing Linear Functions, Interpreting a Function and Converting Temperatures**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions/
  - Quote: "Level 4 Writing Linear Expressions Proportional Relationships Base Fees Graphing Linear Functions Finding the Constant Term Finding the Linear Term Interpreting a Function Writing the Whole Expression"
- **Linear Relationships Level 9: Converting Temperatures and Fitting Data**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions/
  - Quote: "Level 9 Graphing Relationships from Data Graphing Candle Height Converting Temperatures Fitting Data Locally Linear Graphing Motion Finding the Equation of Motion"

My reading: Brilliant's own Linear
Relationships has "Graphing Linear Functions", "Interpreting a Function" and "Converting Temperatures" before Introduction to
Functions begins. So, as in Dan's folder, the straight line as a function is behind the learner, and the new course starts with
the general idea.


### 1.5 What Brilliant keeps for later courses

- **Brilliant Quadratics (a later course) teaches shifting and stretching in vertex form**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Level 9 Graphing Vertex Form Shifting Up and Down Graphing a Vertical Shift Shifting Right and Left Graphing a Horizontal Shift Finding the New Vertex Stretching and Reflecting Graphing a Vertical Stretch Using All the Parameters Graphing from Vertex Form"
- **Brilliant Equations and Curves (a later course): transforming hyperbolas (reciprocal) with shifts and stretch**
  - Source: Practice Equations and Curves | Brilliant. https://brilliant.org/courses/equations-and-curves/
  - Quote: "Level 2 Transforming Hyperbolas Hyperbolas Vertical Shift of Hyperbolas Horizontal Shift of Hyperbolas Stretch Transforming Hyperbola Graphs Matching Targets"
- **Equations and Curves: the square root as the inverse of squaring, then transforming roots**
  - Source: Practice Equations and Curves | Brilliant. https://brilliant.org/courses/equations-and-curves/
  - Quote: "Level 6 The Square Root Inverse of Squaring The Square Root of the Square Graphing the Inverse ## Level 7 Transforming the Square Root Vertically Shifting Roots Horizontally Shifting Roots Vertical Stretching Positive Horizontal Stretching Negative Horizontal Stretching ## Level 8 Multiple Transformations Multiple Transforms of Roots Transforming Domain and Range"

My reading: shifting a parabola in vertex form, the reciprocal and
square-root graphs with their own shifts and stretches, and completing the square all appear in later Brilliant courses. In Dan's
folder the vertex form belongs to Quadratics and polynomials. The shifts in this course should be taught on several shapes
(Khan's "parent functions" idea, section 2.2), with the parabola as one of them and not the only one.


## 2. Other courses' order for the same ground



### 2.1 Khan Academy: Algebra 1 Unit 8 and the "Algebra (all content)" Unit 7

- **Khan Academy Algebra 1, Unit 8 Functions: 22 skills in this order**
  - Source: Functions | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions
  - Quote: "Unit 8: Functions 22 skills Mastered Proficient Familiar Attempted Not started Quiz Unit test 1. Evaluate functions 2. Evaluate functions from their graph 3. Evaluate function expressions 4. Function inputs & outputs: equation 5. Function inputs & outputs: graph 6. Functions: Quiz 1 7. Function rules from equations 8. Function notation word problems 9. Domain and range from graph 10. Functions: Quiz 2 11. Identifying values in the domain 12. Determine the domain of functions 13. Function domain word problems 14. Recognize functions from graphs 15. Recognize functions from tables 16. Functions: Quiz 3 17. Relative maxima and minima 18. Absolute maxima and minima 19. Positive and negative intervals 20. Increasing and decreasing intervals 21. Graph interpretation word problems 22. Functions: Quiz 4 23. Average rate of change: graphs & tables 24. Average rate of change word problems 25. Evaluate inverse functions 26. Find inverses of linear functions 27. Functions: Quiz 5 28. Functions: Unit test"
- **Khan Algebra 1 Unit 8 opens "A function is like a machine"**
  - Source: Functions | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions
  - Quote: "A function is like a machine that takes an input and gives an output. Let's explore how we can graph, analyze, and create different types of functions."
- **Khan "Algebra (all content)" Unit 7 Functions: the order of topics**
  - Source: Functions | Algebra (all content) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-home/alg-functions
  - Quote: "This topic covers: * Evaluating functions * Domain & range of functions * Graphical features of functions * Average rate of change of functions * Function combination and composition * Function transformations (shift, reflect, stretch) * Piecewise functions * Inverse functions * Two-variable functions"

My reading: Khan's order is evaluate
and read values, function rules from equations, domain and range from a graph, then the domain of a formula, recognising a
function from a graph or table, key features, and the inverse of a linear function last. In the all-content unit the sequence is
evaluating, domain and range, graph features, rate of change, "function combination and composition", transformations, piecewise,
inverse. Both put the machine and notation first and the inverse last.


### 2.2 Khan Academy: Algebra 2 Unit 9, Transformations of functions

- **Khan Algebra 2, Unit 9 Transformations of functions: the skills in order**
  - Source: Transformations of functions | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:transformations
  - Quote: "1. Shift functions 2. Reflect functions 3. Even and odd functions: Graphs and tables 4. Even & odd functions: Equations 5. Transformations of functions: Quiz 1 6. Scale functions vertically 7. Scale functions horizontally 8. Identify function transformations 9. Transformations of functions: Quiz 2 10. Graphs of square and cube root functions 11. Graphs of exponential functions 12. Graphs of logarithmic functions 13. Transformations of functions: Quiz 3 14. Transformations of functions: Unit test"
- **Khan: transformations are moves on "parent functions"**
  - Source: Transformations of functions | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:transformations
  - Quote: "We can think graphs of absolute value and quadratic functions as transformations of the parent functions |x| and x². Importantly, we can extend this idea to include transformations of any function whatsoever! This fascinating concept allows us to graph many other types of functions, like square/cube root, exponential and logarithmic functions."

My reading: Khan teaches shifts, then
reflections, then even/odd symmetry, then vertical and horizontal scaling, then "identify function transformations", with
parent functions |x| and x² first and then square and cube roots. Shifting comes before scaling in every course I read.


### 2.3 BBC Bitesize (GCSE Maths)

- **BBC Bitesize GCSE Higher "Functions": first key point, a function links an input with an output**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "A function, 𝑓(𝑥), is a type of formula that links an input with an output. *"
- **Bitesize Higher "Functions": a composite function is a function of a function**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "A composite function , such as 𝑔𝑓(𝑥) is a function of a function."
- **Bitesize Higher "Functions": the function machine "multiply by 3 and then subtract 1"**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "A function takes an input value, applies a rule to it, and produces an output value. This can be demonstrated using a function machine. The function, multiply by 3 and then subtract 1 , can be applied to different values. If 5 is the input, the output is 14 because 5 × 3 – 1 = 14."
- **Bitesize tells learners to refresh substitution and changing the subject first**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "Support your confidence in this topic by refreshing your knowledge of substitution and changing the subject of formulae"
- **Bitesize "Transformation of functions" (Eduqas Higher) contents: translating, reflecting, combined, trigonometric**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "Translating functions 1. GCSE exam-style questions 4. Reflecting functions 1. GCSE exam-style questions 5. Combined transformations 1. GCSE exam-style questions 6. Trigonometric graph transformations"
- **Bitesize GCSE lists the "Other graphs" it teaches: quadratic, cubic, reciprocal, exponential, circle**
  - Source: GCSE Maths - Cambridge OCR - BBC Bitesize. https://www.bbc.co.uk/bitesize/examspecs/zcty7hv
  - Quote: "The most commonly occurring graphs are quadratic, cubic, reciprocal, exponential and circle graphs. Their"

My reading: Bitesize has two relevant GCSE Higher articles. "Functions" does notation, inverse
and composite in one page, with the machine drawn as the first picture and the inverse introduced as changing the subject.
"Transformation of functions" has translations, reflections, combined, and trigonometric examples, but no stretches (those come
at SQA Higher and at Khan Algebra 2). The GCSE "Other graphs" guide teaches quadratic, cubic and reciprocal in that order.


### 2.4 SQA Higher Maths (BBC Bitesize and maths.scot)

- **Bitesize Higher Maths (SQA) "Graph transformations": the same effect "regardless of the type of function"**
  - Source: Graph transformations - Identifying and sketching related functions - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zc6hhyc/revision/1
  - Quote: "The following changes to a function will produce a similar effect on the graph regardless of the type of function involved."
- **SQA Higher Maths functions and graphs content: transformations, inverse, domain and range, composite**
  - Source: Functions and Graphs – Higher Maths – Free Study Resources. https://www.maths.scot/higher/functions
  - Quote: "All Nat 5 functions work is assumed. * Identifying a function from a graph, or sketching a function after a transformation of the form \(k\tiny\ \normalsize f(x),\) \(f(kx),\) \(f(x)+k,\) \(f(x+k)\) or a combination of these * Sketching the inverse of a logarithmic or an exponential function * Knowing the meaning and use of the terms domain and range * Determining a composite function given \(f(x)\) and \(g(x),\) where \(f(x)\) and \(g(x)\) can be trigonometric, logarithmic, exponential or algebraic functions * Determining the inverse function \(f^{-1}(x)\) of given functions."

My reading: the Higher course is the first place where the
whole list sits together: sketching after a transformation, domain and range, composite function, inverse function. The
transformations named are k f(x), f(kx), f(x) + k and f(x + k), so stretches are included. The exponential and logarithmic parts
belong to the Exponentials and logarithms course.


### 2.5 HELM (Loughborough) Workbook 2, Basic Functions

- **HELM workbook 2 Basic Functions: contents and page numbers (Loughborough)**
  - Source: HELM workbook 2 - Basic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "1. Basic Concepts of Functions 2 2. Graphs of Functions and Parametric Form 11 3. One-to-One and Inverse Functions 20 4. Characterising Functions 26 5. The Straight Line 36 6. The Circle 46 7. Some Common Functions 62"
- **HELM 2.1: the function rule, input and output**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "A function can be thought of as a rule which operates on an input and produces an output ."
- **HELM 2.7: a catalogue of common functions in science and engineering**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "This Section provides a catalogue of some common functions often used in Science and Engineering. These include polynomials, rational functions, the modulus function and the unit step function."
- **HELM 2.1: the machine is drawn as a block diagram, or as two sets with an arrow**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "This is often illustrated pictorially in two ways as shown in Figure 1. The first way is by using a block diagram which consists of a box showing the input, the output and the rule. We often write the rule inside the box. The second way is to use two sets, one to represent the input and one to represent the output with an arrow showing the relationship between them."
- **HELM 2.7: transformations appear only as exercises on the modulus function (3|x|, |x + 1|, 7|x - 3|)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Sketch a graph of the following functions: (a) _f_ ( _x_ ) = 3 _|_ _x_ _|_ , (b) _f_ ( _x_ ) = _|_ _x_ + 1 _|_ , (c) _f_ ( _x_ ) = 7 _|_ _x_ _−_ 3 _|_ ."

My reading: HELM is the engineering order. It runs concept of a
function, graphs and domain and range, one-to-one and inverse functions, characterising functions (even and odd), the straight
line, the circle, and a catalogue of common functions. HELM defines the inverse after the graph and before the straight line, and its only transformation work is a set of exercises on the modulus function (3|x|, |x + 1|, 7|x − 3|). Its machine picture is a block diagram, and also two sets with an arrow.


### 2.6 Bird's Engineering Mathematics (Routledge)

The Bird contents pages are the ones the college set text uses. I did not
see inside the chapter, only the contents and a publisher abstract.

- **Bird's Engineering Mathematics (9th ed.) Section 4 Graphs, ending in chapter 31 Functions and their curves**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 4: Graphs 27. Straight line graphs 28. Reduction of non-linear laws to linear form 29. Graphs with logarithmic scales 30. Graphical solution of equations 31. Functions and their curves"
- **Bird's Higher Engineering Mathematics: Section C Graphs, chapter 16 Functions and their curves**
  - Source: Bird's Higher Engineering Mathematics - 9th Edition - John Bird - Rout. https://www.routledge.com/Birds-Higher-Engineering-Mathematics/Bird/p/book/9780367643737
  - Quote: "Section C Graphs 16 Functions and their curves 17 Irregular areas"
- **Bird's Basic Engineering Mathematics has straight line graphs and non-linear laws but no functions chapter**
  - Source: Bird's Basic Engineering Mathematics - 8th Edition - John Bird - Routl. https://www.routledge.com/Birds-Basic-Engineering-Mathematics/Bird/p/book/9780367643676
  - Quote: "17. Straight line graphs 18. Graphs reducing non-linear laws to linear form 19. Graphical solution of equations 20. Graphs with logarithmic scales"
- **Bird's chapter "Functions and their curves": continuous and discontinuous, odd and even, inverse functions: "the language of engineering"**
  - Source: Functions and their curves | 16 | v9 | Bird's Higher Engineering Mathe. https://www.taylorfrancis.com/chapters/mono/10.1201/9781003124221-16/functions-curves-john-bird
  - Quote: "Understanding of continuous and discontinuous functions, odd and even functions and inverse functions are helpful in this – it's all part of the ‘language of engineering’."
- **The same chapter lists the standard curves it describes**
  - Source: Functions and their curves | 16 | v9 | Bird's Higher Engineering Mathe. https://www.taylorfrancis.com/chapters/mono/10.1201/9781003124221-16/functions-curves-john-bird
  - Quote: "This chapter describes standard curves and their equations – straight line, quadratic, cubic, trigonometric, circle, ellipse, hyperbola, rectangular hyperbola, logarithmic function, exponential function and polar curves."

My reading: in the Basic book (the lead-in) there is no functions
chapter at all, and in the Engineering and Higher books "Functions and their curves" is one chapter inside the Graphs section (chapter 31 and chapter 16). The abstract says it is about standard curves, continuity, odd/even and inverse functions, as "the language of
engineering". The section titles of the 4th edition chapter (Standard curves, Simple transformations, Periodic functions,
Continuous and discontinuous functions, Even and odd functions, Inverse functions) were visible to me only on a mirror copy of the
book, so they are **UNCONFIRMED** and are not in `quotes.json`.


### 2.7 OpenStax College Algebra, chapter 3 (a free textbook order)

- **OpenStax College Algebra chapter 3 key concepts: domain and range first**
  - Source: Ch. 3 Key Concepts - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-key-concepts
  - Quote: "3.2 Domain and Range * The domain of a function includes all real input values that would not cause us to attempt an undefined mathematical operation, such as dividing by zero or taking the square root of a negative number."
- **OpenStax: composition, then transformation (shifts by adding to the output or to the input)**
  - Source: Ch. 3 Key Concepts - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-key-concepts
  - Quote: "3.4 Composition of Functions * We can perform algebraic operations on functions. See Example 1 . * When functions are combined, the output of the first (inner) function becomes the input of the second (outer) function. * The function produced by combining two functions is a composite function. See Example 2 and Example 3 . 3.4 Composition of Functions * A composite function can be evaluated by evaluating the inner function using the given input value and then evaluating the outer function taking as its input the output of the inner function. * A composite function can be evaluated from a table. See Example 5 . 3.4 Composition of Functions * The domain of a composite function consists of those inputs in the domain of the inner function that correspond to outputs of the inner function that are in the domain of the outer function. See Example 8 and Example 9 . 3.4 Composition of Functions * Just as functions can be combined to form a composite function, composite functions can be decomposed into simpler functions. * Functions can often be decomposed in more than one way. See Example 10 . 3.5 Transformation of Functions * A function can be shifted vertically by adding a constant to the output. See Example 1 and Example 2 . * A function can be shifted horizontally by adding a constant to the input."

My reading: OpenStax goes functions and notation,
domain and range, rates of change, composition, transformation, then inverses (3.7), the same as Khan.


### 2.8 What is common (consensus across the courses)

- Every course starts with the rule, input, output and notation, and with evaluating f at a number (Brilliant, Khan, HELM,
  Bitesize, OpenStax).
- Domain and range follow, taught on graphs (Brilliant levels 8 to 9, Khan, HELM 2.2, OpenStax 3.2, SQA).
- Families of graphs are shown as "parent" shapes: quadratic, cubic, reciprocal, square root (Bitesize, Brilliant, Khan, Bird).
- Shifts come before stretches; reflections sit with either (Khan, Bitesize, Brilliant).
- The inverse comes last in Brilliant, Khan and OpenStax, but earlier in HELM (2.3) and Bitesize, where it sits with composite
  functions in one article.
- Composite and inverse are tied: f⁻¹(f(x)) = x is itself a composite (HELM), so many courses teach them together.

My reading of an order for Dan: machine and notation; domain, range and the five graph shapes; shifts; stretches and flips;
one machine feeding another (composite); undoing a machine (inverse, which is rearranging a formula). That is Brilliant's order
with the graph shapes pulled earlier and the "operations" level dropped.



## 3. What a marine engineering HNC actually uses of this topic

Honest summary first: the college syllabuses
I could read do **not** name the "shift a graph" topic. The function vocabulary (domain, range, asymptote, inverse, composite)
is named in one place, the SQA HN unit. The MCA marine syllabuses use graphs and functions as tools: plot a law, put it in
straight-line form, read the gradient. I found no MCA syllabus titled "Applied Mathematics"; the maths lines are in the
"Mathematics" syllabus (Second Engineer) and in "General Engineering Science".



### 3.1 SQA HN Engineering Mathematics 1 (H7K0 33, SCQF 6)

- **SQA H7K033 Engineering Mathematics 1 (SCQF 6), purpose: functions, vectors, complex numbers**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions. Learners will also be introduced to 3-dimensional vectors and complex numbers."
- **H7K033 Outcome 1: functions and trigonometric equations; its knowledge and skills**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Outcome 1 Solve problems involving functions and trigonometric equations. # Knowledge and/or Skills  Properties of functions  Inverse functions  Composite Functions  Trigonometric equations"
- **H7K033 evidence requirement: domain, range and asymptotes; inverse; composite**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Identify the domain, range and asymptotes of a given function  Solve one problem involving an inverse function  Solve one problem involving a composite function"
- **H7K033 guidance: the function as a rule, "one and only one"**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Introduce the concept of the function (this may be done in terms of set theory and, in particular, a function or mapping as a rule which relates each element in one set to one and only one element in another set)"
- **H7K033 guidance: domain and range, poles, asymptotes**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Define the terms domain and range of a function  Introduce the concept of a pole (s) in a function and explain the impact of a pole (s) on the domain of a function which has one or more poles  Demonstrate the way in which to determine the range and domains of functions  Define the term asymptotes"
- **H7K033 guidance: determine and graph inverse functions; derive and evaluate composite functions**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Determine the inverse functions of a range of functions  Graph functions and their inverse functions  Introduce composite functions (again this may be done in terms of set theory)  Derive and evaluate a number of composite functions"
- **H7K033 recommended entry: algebra and "an ability to transpose engineering formulae"**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations."
- **H7K033 is "mandatory in a number of Higher National Certificates in Engineering"; properties of functions "commonly used in Engineering"**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "The Unit is mandatory in a number of Higher National Certificates in Engineering. This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. You will learn about the properties of some mathematical functions commonly used in Engineering including linear, trigonometrical, exponential and logarithmic functions."

My reading: this is the one syllabus line
for the exact vocabulary, and it is "mandatory in a number of Higher National Certificates in Engineering" (SQA, Scotland). Outcome 1 is assessed by trigonometric equations plus two of three items: the domain, range and asymptotes of a given function, one inverse-function problem, one composite-function problem. Its guidance goes as far as poles and "graph functions and their inverse
functions", and its entry expectation is transposing formulae, which is the inverse idea again.


### 3.2 Pearson BTEC HN Unit 4002 Engineering Mathematics

The 2024 unit descriptor extract I could fetch shows learning
outcomes and assessment criteria, not the "essential content" list.

- **Pearson BTEC HN Unit 4002 Engineering Mathematics (2024), P3: equations using functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Unit 4002 LO4 P8: rates of change for a range of mathematical functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P8 Examine rates of change for a range of mathematical functions."
- **Pearson HN 2017 specification: maths skills embedded include "use of algebraic, logarithmic and circular functions"**
  - Source: BTEC HNCD Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "use of algebraic, logarithmic and circular functions ● use of analytical and computational methods to evaluate and solve engineering"
- **Pearson HN 2017 Unit 2 Engineering Maths P3: solutions using exponential, logarithmic, trigonometric, hyperbolic functions**
  - Source: BTEC HNCD Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "P3 Determine solutions of equations using exponential, logarithmic, trigonometric and hyperbolic functions"

My reading: Pearson names the kinds of function
(exponential, logarithmic, trigonometric, hyperbolic, and "rates of change for a range of mathematical functions"), not the
function idea itself. The essential content list (under LO1, algebraic methods) was not visible to me, so any claim that Unit 4002 teaches domain, range or transformations is **UNCONFIRMED**.


### 3.3 MCA Second Engineer Written Examination Syllabus: Mathematics

These are the exact lines of the GOV.UK syllabus (the numbering other briefs cite, MCA 4.9 to 4.11, is the "Graphs" topic).

- **MCA Second Engineer Mathematics, section 4 Graphs: dependent and independent variables**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Defines the dependent and independent variables."
- **MCA: plots linear and non-linear graphs; the law of a straight line y = ax + b**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Plots linear and non-linear graphs (scales to be given in examination). 7. States that for a linear graph, only two plotting points are required. 8. States that plotting points may be given in the form: x = 1, y = 2, or (1,2). 9. States that the law of a straight line graph is of the form: y = ax + b, and defines a and b."
- **MCA: writes y = aX² + b as a straight line; solves pV^n = C graphically**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Writes the equation y = aX ² \+ b in the form of a straight line. 11. Solves graphically problems of the form pV n = C, where n is unknown."
- **MCA (Algebra, 2.1.36 and 2.1.37): direct and inverse variation and the constant of variation**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Describes direct and inverse variation. 37. Describes the use of the constant of variation."
- **MCA: "Writes derivatives in terms of functional notation"**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Writes derivatives in terms of functional notation."

My reading: the MCA's "graph" is a tool: dependent and
independent variable, plot a law, straight-line form, a law of the form pVⁿ = C, and inverse variation. These lines
are the reason this course should keep every graph tied to a quantity with units, and why the reciprocal (inverse variation) and
the square (y = aX² + b) must be in the family set. The only "functional notation" line is for derivatives.


### 3.4 MCA General Engineering Science I

- **MCA General Engineering Science I, 1.3 Graphs**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "1.3 Graphs 1. Form linear equations consistent with data provided. 2. Plot ordered pairs on graph paper, either given or calculated and join the points with an appropriate curve. 3. Interpret the equation for a straight-line graph, identifying the intercept and gradient."
- **MCA GES I, 2.2 Dynamics: graphs of force/distance and torque/angle from given data**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Draw graphs of force/distance and torque/angle from given data and interpret the area under the graph to Work Done."

My reading: the GES I graph lines are simpler than the Second Engineer ones (no law-fitting). They are linear equations from data, plot and join with "an appropriate curve", and the gradient and
intercept. Its dynamics line draws graphs of force/distance and torque/angle and reads work done from the area. Those are
functions as graphs (readings joined by a curve), which this course can supply the vocabulary for.


### 3.5 Warsash Maritime School (Solent University) engineer cadets

- **Warsash (Solent) engineer cadets: calculated numerical answers in applied heat, electrics, mechanics**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "In applied heat, electrics, and mechanics you will need to demonstrate your understanding of new ideas and concepts through answering descriptive questions and questions that require you to calculate numerical answers. The mathematics that you study during your first academic session as an engineering cadet will help you to develop the mathematical skills to enable you to tackle these numerical questions."
- **Warsash: what the cadets study before going to sea**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Marine and electro-technical engineering cadets at Warsash are required to study a variety of subjects prior to going to sea. These will include marine engineering principles and electrics before moving on to magnetism and, finally, mechanics which considers how both static (still forces) and dynamic forces (moving forces) act on an item of equipment."

My reading: the college expects
calculated numerical answers in applied heat, electrics and mechanics. That supports quantity-first examples over bare x and y.


## 4. The scope to cover, and what research says about each part



### 4.1 A function as a machine: input, rule, output, f(x) and evaluating

- **HELM: a function as a rule on an input, with a single output (Key Point 1)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "A function is a rule which operates on an input and produces a single output from that input."
- **HELM: a rule is a function if it gives only one output for any input**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "More precisely, a rule is a function if it produces only a single output for any given input."
- **HELM: the input is its "argument"**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The input to a function is sometimes called its argument . It is frequently necessary to obtain the output from a function if we are given its argument."
- **Bitesize: "f(x) = 3x - 1, x is the input and f is the function that we apply"**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "For instance, for the function 𝑓(𝑥) = 3𝑥 – 1, 𝑥 is the input and 𝑓 is the function that we apply, which in this example is 3𝑥 – 1."
- **Lumen (SECONDARY): "Some people think of functions as mathematical machines"**
  - Source: Functions and Their Notation | Intermediate Algebra. https://courses.lumenlearning.com/tallahassee-intermediatealgebra/chapter/17-1-1-identifying-functions
  - Quote: "Some people think of functions as “mathematical machines.” Imagine you have a machine that changes a number according to a specific rule, such as “multiply by 3 and add 2” or “divide by 5, add 25, and multiply by [latex]−1[/latex].” If you put a number into the machine, a new number will pop out the other end, having been changed according to the rule."
- **Lumen (SECONDARY): the parentheses in f(x) "do not mean multiply"**
  - Source: Functions and Their Notation | Intermediate Algebra. https://courses.lumenlearning.com/tallahassee-intermediatealgebra/chapter/17-1-1-identifying-functions
  - Quote: "the parentheses that are part of function notation do not mean multiply. The notation _f_ ( _x_ ) does not mean _f_ multiplied by _x_ . Instead the notation means “ _f_ of _x_ ” or “the function of _x_"
- **Lumen (SECONDARY): function notation is more flexible than y; inputs need not be numbers**
  - Source: Functions and Their Notation | Intermediate Algebra. https://courses.lumenlearning.com/tallahassee-intermediatealgebra/chapter/17-1-1-identifying-functions
  - Quote: "Function notation gives you more flexibility because you don’t have to use _y_ for every equation. Instead, you could use _f_ ( _x_ ) or _g_ ( _x_ ) or _c_ ( _x_ ). This can be a helpful way to distinguish equations of functions when you are dealing with more than one at a time."

My reading: every source uses the machine, and
the research (section 6.2) says it is a good start and also limited. HELM gives the clean definition (a rule that gives a single
output for any input) and a block diagram. Bitesize gives the arithmetic example (5 in, multiply by 3 and subtract 1, 14 out) that
fits the existing arithmetic habits. The notation note matters because "f(x)" looks like a product (section 6.1).


### 4.2 Domain and range in plain words

- **Khan: domain as "the set of all possible inputs"**
  - Source: How to find the domain of a function (video). https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function/v/domain-of-a-function-intro
  - Quote: "The domain of a function is the set of all possible inputs for the function."
- **HELM: domain, "the set of values which we allow the independent variable to take"**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The set of values which we allow the independent variable to take is called the domain"
- **HELM: range, "the set of values of the function for a given domain"**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The set of values of the function for a given domain, that is, the set of _y_ values, is called the range"
- **HELM: the range "is the set of values which the function takes" (read from the graph)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The range is the set of values which the function takes."
- **OpenStax: domain excludes inputs that cause an undefined operation, "dividing by zero or taking the square root of a negative number"**
  - Source: Ch. 3 Key Concepts - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-key-concepts
  - Quote: "The domain of a function includes all real input values that would not cause us to attempt an undefined mathematical operation, such as dividing by zero or taking the square root of a negative number."
- **OpenStax: domain is the x-axis extent of a graph, range the y-axis extent**
  - Source: 3.2 Domain and Range - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/3-2-domain-and-range
  - Quote: "Because the domain refers to the set of possible input values, the domain of a graph consists of all the input values shown on the x -axis. The range is the set of possible output values, which are shown on the y -axis."
- **Bitesize CCEA: the y = 1/x table has "No value" at x = 0**
  - Source: Module 7 (M7) - Number and algebra – Graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z8hqnk7
  - Quote: "–1 | No value | 1 | 0.5 | 0.33 | 0.25 | 0.2"

My reading: Khan, HELM and OpenStax all give a plain statement:
the domain is the inputs allowed, the range is the outputs you get. The two best everyday-engineering reasons for a limit on the
domain are the ones OpenStax names: dividing by zero (the 1/x table in Bitesize has "No value" at x = 0) and the square root of a
negative number. HELM adds that the range is read "by inspecting the graph". Research (6.8) says the range is the harder of the two.


### 4.3 The graphs of the families he will meet: straight line, square, cube, reciprocal 1/x, square root

- **Bitesize: quadratic graphs have a line of symmetry and a U shape when a is positive**
  - Source: Quadratic graphs - Other graphs - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zc62srd/revision/1
  - Quote: "All quadratic graphs have a line of symmetry. Positive quadratic graphs (where (a \textgreater 0)) are U-shaped and have a turning point at the bottom of the curve."
- **Bitesize: cubic graphs "are curved but can have more than one change of direction"**
  - Source: Cubic graphs - Other graphs - OCR - GCSE Maths Revision - OCR - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqr4jty/revision/2
  - Quote: "Cubic graphs are curved but can have more than one change of direction. Example"
- **Bitesize CCEA: a graph of the form y = 1/x "is known as a reciprocal graph"**
  - Source: Module 7 (M7) - Number and algebra – Graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z8hqnk7
  - Quote: "is known as a reciprocal graph and once drawn, looks like this"
- **HELM: y = x² is many-to-one (a horizontal line cuts it twice)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "We see that a horizontal line drawn on the graph cuts it more than once. This means that two (or more) different inputs have yielded the same output and so the function is many-to-one."
- **HELM: y = x³ is one-to-one (a horizontal line cuts it once)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "A horizontal line drawn on this graph will intersect the curve only once."
- **HELM: the rule "take the square root" is not a function until it is made the positive root**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "cannot be a rule for a function because for a given input there are two outputs"
- **HELM: "take the positive square root of the input" is a valid function rule**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "is a valid function rule because a given input produces a single output."
- **Brilliant Equations and Curves: Level 9 General Roots, inverse of cubing**
  - Source: Practice Equations and Curves | Brilliant. https://brilliant.org/courses/equations-and-curves/
  - Quote: "Level 9 General Roots Inverse of Cubing Graphing the Inverse Even Roots Odd Roots Fractional Powers Simplifying General Roots"
- **Kop et al.: experts link limited domain to root functions and asymptotes to broken (reciprocal) functions**
  - Source: Graphing formulas: Unraveling experts’ recognition processes. https://research-portal.uu.nl/ws/files/36911141/graphing.pdf
  - Quote: "For the different function families in our research, the experts used salient attributes: limited domain was linked to root functions, power functions and logarithmic functions; vertical asymptotes were linked to logarithmic functions and broken functions"

My reading: Bitesize's list
(quadratic, cubic, reciprocal) plus the square root is close to the set in Brilliant's Equations and Curves and the Utrecht experts'
"function families". HELM's many-to-one / one-to-one pairing of x² and x³ is a strong way to tell the square from the cube
and sets up the inverse (a root needs a restriction). The straight line is already known, so here it is one family among five.
The Powers and roots brief explicitly leaves "the graphs of y = x², y = √x and y = 1/x, and domain and range" for this course.


### 4.4 Reading a graph as a function

- **Lumen (SECONDARY): for each input on a graph of a function there is exactly one output**
  - Source: Functions and Their Notation | Intermediate Algebra. https://courses.lumenlearning.com/tallahassee-intermediatealgebra/chapter/17-1-1-identifying-functions
  - Quote: "The fact that each input value has exactly one output value means graphs of functions have certain characteristics. For each input on the graph, there will be exactly one output."
- **HELM: the graph of a function is built from a table of input and output values**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "We can choose several values for the input to this function and calculate the corresponding outputs."

My reading: this is the habit "one input, one output" read off a graph, plus reading
values and the domain and range. Brilliant spends a level on it (non-function behaviour). Research (6.4, 6.5) warns against the
vertical line test used without understanding, and against reading a graph as a picture of the path.


### 4.5 Transformations: shift up, down, left, right, stretch, reflect, and how each changes the rule

- **Bitesize Eduqas Higher: f(x) + n translates the graph vertically up**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "𝑓(𝑥) + 𝑛 translates 𝑓(𝑥) vertically"
- **Bitesize: f(x + n) translates the graph horizontally to the left**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "𝑓(𝑥 + 𝑛) translates 𝑓(𝑥) horizontally to the"
- **Bitesize: f(x - n) translates the graph horizontally to the right**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "𝑓(𝑥 – 𝑛) translates 𝑓(𝑥) horizontally to the"
- **Bitesize: reflections change a sign, -g(x) in the x-axis, g(-x) in the y-axis**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "A function, 𝑔(𝑥), is reflected when the sign is changed. * –𝑔(𝑥) reflects 𝑔(𝑥) in the 𝑥-axis. The point (𝑥, 𝑦) becomes (𝑥, – 𝑦)."
- **Bitesize Higher Maths: adding a constant to the function shifts the graph up or down**
  - Source: Graph transformations - Identifying and sketching related functions - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zc6hhyc/revision/1
  - Quote: "Adding or subtracting a constant (k) to a function has the effect of shifting the graph up or down vertically by (k) units."
- **Bitesize Higher Maths: adding a constant to the x term shifts the graph left or right**
  - Source: Graph transformations - Identifying and sketching related functions - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zc6hhyc/revision/1
  - Quote: "Adding or subtracting a constant (k) to the (x) term has the effect of shifting the graph left or right along the (x)-axis."
- **OpenStax: with a vertical shift "the input values stay the same and only the output values change"**
  - Source: 3.5 Transformation of Functions - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-5-transformation-of-functions
  - Quote: "Notice that, with a vertical shift, the input values stay the same and only the output values change."
- **K12 LibreTexts (SECONDARY): the horizontal shift is "the opposite of what most people think at first"**
  - Source: 1.2: 1.2 Graphical Transformations - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Mathematics/Precalculus/01%3A_Functions_and_Graphs/1.02%3A_1.2_Graphical_Transformations
  - Quote: "Notice that this is the opposite of what most people think at first."
- **K12 LibreTexts (SECONDARY): "apply the transformation to a specific function that is known"**
  - Source: 1.2: 1.2 Graphical Transformations - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Mathematics/Precalculus/01%3A_Functions_and_Graphs/1.02%3A_1.2_Graphical_Transformations
  - Quote: "Often it makes sense to apply the transformation to a specific function that is known and then describe the transformation that you see."
- **OpenStax: a vertical shift is a change to the output, "outside" the function; the input is "inside"**
  - Source: 3.5 Transformation of Functions - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-5-transformation-of-functions
  - Quote: "We just saw that the vertical shift is a change to the output, or outside, of the function. We will now look at how changes to input, on the inside of the function, change its graph and meaning."
- **K12 LibreTexts (SECONDARY): -g(2x) is a reflection in the x axis and a horizontal compression by a factor of 2**
  - Source: 1.2: 1.2 Graphical Transformations - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Mathematics/Precalculus/01%3A_Functions_and_Graphs/1.02%3A_1.2_Graphical_Transformations
  - Quote: "This transformation is a vertical reflection across the x axis and a horizontal compression by a factor of 2."

My reading: all sources agree on the rules, in
words: adding to the output (outside) moves the graph up or down; adding to the input (inside) moves it left or right, "the opposite
of what most people think at first"; multiplying the output stretches vertically and a minus flips it in the x-axis; multiplying the input squeezes or stretches it sideways (K12 LibreTexts: g(2x) is "a horizontal compression by a factor of 2") and a minus flips it in the y-axis. Bitesize and OpenStax give the outside/inside idea ("a change to the output, or outside, of the function"), which is the most reusable single sentence. Stretches are in SQA Higher, Khan Algebra 2 and Brilliant but not in Bitesize GCSE.


### 4.6 The inverse function as undoing: rearranging a formula is finding an inverse

- **Bitesize: an inverse function is the original function in reverse**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "An inverse function links the output value back to the input value, meaning it is the original function in reverse."
- **Bitesize: the inverse is found by rearranging, "change the subject and use inverse processes"**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "To find an inverse function, the equation is rearranged to change the subject and use inverse processes."
- **Bitesize: the inverse of "multiplies by 3 and subtracts one" is "add one and then divide by 3"**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "For example, for a function that multiplies by 3 and subtracts one , the inverse function is add one and then divide by 3 ."
- **Bitesize: use "order of operations (BIDMAS) in reverse"**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "Take care when choosing inverse operations and use order of operations (BIDMAS) in reverse."
- **OpenStax: "evaluation is easier than solving", the reason to want the inverse formula**
  - Source: 3.7 Inverse Functions - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-7-inverse-functions
  - Quote: "She realizes that since evaluation is easier than solving, it would be much more convenient to have a different formula, one that takes the Celsius temperature and outputs the Fahrenheit temperature."
- **OpenStax: inverse functions "undo" each other**
  - Source: 3.7 Inverse Functions - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-7-inverse-functions
  - Quote: "Informally, this means that inverse functions “undo” each other."
- **HELM: the inverse reverses the process; only one-to-one functions have one**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Not all functions possess an inverse function. In fact, only one-to-one functions do so."
- **Wiki (SECONDARY): to undo f then g, undo g first then f**
  - Source: Inverse Functions - Department of Mathematics at UTSA. https://mathresearch.utsa.edu/wiki/index.php?title=Inverse_Functions
  - Quote: "To reverse this process, we must first subtract five, and then divide by three"
- **SQA H7K033: transposing formulae is expected before the unit; inverse functions are in it**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae"

My reading: Bitesize states the link in
one line: finding the inverse is "rearranged to change the subject and use inverse processes". The college entry line
("transpose engineering formulae") is the same skill. Two further points: the inverse undoes the steps in reverse order (Bitesize, the wiki page), and only a one-to-one function has an inverse (HELM), so the square needs a restricted domain before a root can be its inverse (my reading).


### 4.7 Composite functions as one machine feeding another

- **Bitesize Higher: composite function, the output of one is the input of the other**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "Composite functions are created by combining two functions. They are made when the output from one function is used as the input for another function."
- **Bitesize Higher: fg(x) means find g(x) first, then substitute into f**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "𝑓𝑔(𝑥) is calculated by finding 𝑔(𝑥) first, and then substituting this into the function 𝑓."
- **OpenStax: composition, "the output of one function becomes the input of another"**
  - Source: 3.4 Composition of Functions - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/3-4-composition-of-functions
  - Quote: "The process of combining functions so that the output of one function becomes the input of another is known as a composition of functions"
- **OpenStax: evaluate the inner function first, then use its output as the input of the outer**
  - Source: 3.4 Composition of Functions - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/3-4-composition-of-functions
  - Quote: "we evaluate the inner function using the starting input and then use the inner function’s output as the input for the outer function."
- **OpenStax: the composition "has to make sense in terms of inputs and outputs"**
  - Source: 3.4 Composition of Functions - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/3-4-composition-of-functions
  - Quote: "Note that the range of the inside function (the first function to be evaluated) needs to be within the domain of the outside function. Less formally, the composition has to make sense in terms of inputs and outputs."
- **Bitesize Higher Maths (SQA): when asked for f(g(x)) and g(f(x)), "the order is important"**
  - Source: Composite functions - Determining composite and inverse functions - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zrxcqp3/revision/1
  - Quote: "the order is important."
- **HELM: f^-1(f(x)) = x is itself a composite function**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Note that the composite function _f_ _−_ ¹ ( _f_ ( _x_ )) = _x_ as shown in Figure 17."

My reading: Bitesize and OpenStax use the same words, the output of one function is the input of the other. Bitesize warns that the order matters, and OpenStax adds that the first machine's outputs must be inputs the second can take. The best trade example is the instrument signal chain in 7.6, where each stage is a machine
and the order cannot be swapped. HELM's f⁻¹(f(x)) = x shows the inverse as a composite that returns the input.


### 4.8 Later previews (quadratics, exponentials, trig)

- **Bitesize: transformations apply "in the same way" to trigonometric graphs**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "Applying transformations of functions to trigonometric graphs is carried out in the same way as other functions."

My reading: Bitesize says transformations "apply in the same
way" to the sine curve, so the same rules can be previewed on a wave in one screen. Vertex form, completing the square, the
exponential and the logarithm (the inverse of the exponential) stay with their own courses.


## 5. Prerequisites: what this topic leans on, what Dan has, what must be taught inline



### 5.1 What the sources assume

- **Brilliant prerequisite line again: coordinate plane, basic algebra, y = mx + c**
  - Source: Practice Introduction to Functions | Brilliant. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Before starting this course you should have familiarity with the coordinate plane, basic algebra and linear relationships of the form y=mx + c."
- **SQA Higher Maths: "All Nat 5 functions work is assumed"**
  - Source: Functions and Graphs – Higher Maths – Free Study Resources. https://www.maths.scot/higher/functions
  - Quote: "All Nat 5 functions work is assumed."
- **Bitesize Higher "Functions": substitution and changing the subject first**
  - Source: Higher – Functions – GCSE Maths Revision – BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zvd3wsg
  - Quote: "Support your confidence in this topic by refreshing your knowledge of substitution and changing the subject of formulae"
- **Kop et al.: school curricula pay most attention to linear and quadratic functions**
  - Source: Graphing formulas: Unraveling experts’ recognition processes. https://research-portal.uu.nl/ws/files/36911141/graphing.pdf
  - Quote: "In secondary school curricula much attention is paid to basic functions, in particular to linear and quadratic functions."

My reading (from the briefs in `build/maths/`, not from lessons I opened):

**Dan has, from built or assumed-built courses** (never re-teach):
- Substitution into a formula, and rearranging a formula (Solving equations, Linear equations lesson 6, e.g. R = R₀(1 + αΔT)).
- The coordinate plane, scales, reading a graph, straight lines through zero (The coordinate plane); gradient, y = mx + c,
  "a law from readings" and the m and c handles (Straight-line graphs).
- Squares, cubes, roots, negative powers as "one over", fractional powers, and "P = I²R: twice the current gives four times the heat",
  "power goes with speed cubed" and pVⁿ = C (Powers and roots lesson 7). Plotting y against x² is there too.
- Inverse proportion and Boyle's law (Proportional reasoning); negative numbers in substitution; fractions and reciprocals.
- Rates and the idea that a straight line has the same slope everywhere (Calculus fundamentals).

**Must be taught inline here** (new words and ideas): the notation f(x) and "f of x"; domain and range as words; "one input, one
output" and one-to-one / many-to-one; the idea of a transformation of a graph and its rule; composite and inverse as a function
idea (not just rearranging).

**Left for later courses**: vertex form and completing the square (Quadratics and polynomials); the exponential and the logarithm
as an inverse pair (Exponentials and logarithms); sine and cosine waves, amplitude and phase (Trigonometry); piecewise,
floor/ceiling and periodic functions (not in Dan's folder). The Linear systems brief says nothing in that course needs function
notation, so the notation really is new here.


## 6. Misconceptions and learning science for each skill

Sources are research papers (ERIC, journals), a literature review, one AQA examiner report and Bitesize's
own wording. NCTM and the OCR/Edexcel GCSE examiner reports I searched did not give a usable line on these topics (section 9).



### 6.1 Notation: f(x) read as "f times x"

- **Notation f(x) is not a product: Lumen states the fact directly (SECONDARY)**
  - Source: Functions and Their Notation | Intermediate Algebra. https://courses.lumenlearning.com/tallahassee-intermediatealgebra/chapter/17-1-1-identifying-functions
  - Quote: "The notation _f_ ( _x_ ) does not mean _f_ multiplied by _x_ ."
- **Literature review: students have difficulty with the meaning of function notation**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "Students have difficulties in understanding the meaning of the mathematical notation"
- **Ayeh (2025) clinical interviews: over-reliance on the vertical line test, and confusion between function notation and variable inputs**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. https://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "Furthermore, the study found specific misconceptions such as the overreliance on the vertical line test, the confusion between function notation and variable inputs, and the misapplication of continuous graphing to discrete data."

My reading: the cure is to say "f of x" aloud every time and to feed f numbers and also
expressions (f(a + b)), as HELM and Lumen do. Letters other than f and x should be used early.


### 6.2 The machine picture is good but incomplete

- **The machine metaphor is common, useful at first, but incomplete**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "This is not a wrong interpretation, and it is very useful for the initial stages of learning; however, it is incomplete because it reduces the concept to some types of functions, mainly those that are defined with algebraic expressions"
- **Function-box teaching can lead to "all functions can be expressed with a formula"**
  - Source: Student teachers’ knowledge of students’. https://files.eric.ed.gov/fulltext/EJ1327591.pdf
  - Quote: "Teachers should be aware of the sources of the misconceptions associated with the use of certain representations, such as the function box that can lead to the misconception that all functions can be expressed with a formula."
- **Students struggle to see a function both as a machine and as an object (Utrecht, J. Math. Behavior 2017)**
  - Source: Graphing formulas: Unraveling experts’ recognition processes. https://research-portal.uu.nl/ws/files/36911141/graphing.pdf
  - Quote: "Students have difficulties in seeing a function both as an input-output machine and as an object"
- **A function as an object: one object, many representations (arrow chains, tables, graphs, formulas, phrases)**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "A function is a mathematical object which can be represented in different ways, such as arrow chains, tables, graphs, formulas, and phrases"

My reading: this is the main design warning. Start with the machine; then show it also as a table, a graph and a rule, as
one object; and add machines that have no neat formula (a table of readings) so "has a formula" is not the definition.


### 6.3 "Only lines and parabolas are functions" and other restrictions

- **"Only straight lines or parabolas are functions"**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "A misconception related to graphic representation is that only graphs that represent straight lines or parabolas correspond to a function’s representation"
- **Constant functions are not "really functions" to students**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "One of them is that constant functions ( , k being a constant) are not really functions"
- **f(x) = 8 "is seen as not a function but a location on a graph"**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. https://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "Many students also believe a function must represent only two sets with a one-to-one relation (Zaslavsky, 1990). This understanding of function creates conceptual difficulties in students’ minds, such that the expression “𝑓𝑓(𝑥𝑥) = 8” is seen as not a function but a location on a graph."
- **Discontinuous functions are not accepted as functions**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "Discontinuous functions are also especially problematic for students [ 16 , 24 , 33 , 36 , 39 , 40 , 41 ]. The fact that their graph is not a continuous line makes them assume that what is represented is not a function"
- **Vinner and Dreyfus 1989: some students say a function's graph must be continuous and single-rule**
  - Source: Student teachers’ knowledge of students’. https://files.eric.ed.gov/fulltext/EJ1327591.pdf
  - Quote: "Some of the students propose that a function, which is represented with a graph, must be continuous and that it cannot be defined by different expressions on different subdomains"

My reading: this is why the course needs the cube, the reciprocal and the square root early,
and a table-only function. A constant function (y = 3, for example) and a function with a gap (1/x) are needed as examples.


### 6.4 The vertical line test used as a recipe

- **Over-reliance on the vertical line test**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. https://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "Interestingly, the student used only the vertical line test concept to determine which graph diagrams represented a function."
- **HELM: a many-to-one rule is still a function, because each chosen input has only one arrow out**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Note that whilst this is many-to-one it is still a function since any chosen input value has only one arrow emerging from it."

My reading: teach "one input has only one output" first, then the vertical line as a way of seeing it.
HELM's horizontal-line check for one-to-one (square: twice, cube: once) is the same idea turned the other way.


### 6.5 Graph-as-picture

- **Graph-as-picture: students treat the graph as "a photo of a physical situation"**
  - Source: Learning Difficulties with the Concept of Function in Maths: A Literature Review. https://www.mdpi.com/2227-7102/13/5/495
  - Quote: "They consider that the graphic representation is like a photo of a physical situation; they do not interpret it as a relationship between some input values located on the abscissa axis and some output values located on the ordinate axis"
- **Graph-as-picture again (arXiv 2025): "a picture or map of the physical situation"**
  - Source: Exploring Students' Understanding of Linear and Quadratic Relationships in a Projectile Motion Context. https://arxiv.org/pdf/2512.11518
  - Quote: "In other words, students often treat the graph as a literal depiction of the phenomenon, interpreting it as a picture or map of the physical situation rather than as a representation of how quantities covary."
- **Named misconceptions in the literature: graph-as-picture, slope-height confusion, interval-point confusion**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. https://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "has identified function representation misconceptions such as graph-as-picture misconception, slope-height confusion, or interval-point confusion."

My reading: any graph with a story (a tank filling, a motor speeding up) must be read as "this quantity against that
one", never as the path of something. Labelled axes with units help.


### 6.6 Horizontal shifts go the "wrong" way

- **Horizontal shift: the graph of y = (x - 3)² is a "counterintuitive fact", even to teachers**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "As students, we memorized this result as one of the counterintuitive facts of mathematics. As teachers, we attempted to explain this phenomenon to our students, often creating a conflict between their intuition and our explanations."
- **Most people guess the graph of y = (x - 3)² sits to the left**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "Most people conjecture that graph (b) will appear three units to the left of graph (a)."
- **Students "just know how to do this": no wish to understand the direction**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "In summary, there was no desire on the part of student-interviewees to understand or explain the phenomenon."
- **Eisenberg and Dreyfus (as reported): a horizontal translation is harder to visualise than a vertical one**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "They acknowledged the difficulty in visualizing a horizontal translation in comparison to a vertical one"
- **Baker, Hemenway and Trigueros (as reported): vertical changes act on the function, horizontal changes on the input**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "“vertical transformations are actions performed directly on the basic functions, while horizontal transformations consist of actions that are performed on the independent variable of the function and further action is needed on the object resulting from the first action to get the result of the transformation”"
- **Baker et al. and Eisenberg and Dreyfus: an object conception of function may be a prerequisite**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "Baker et al. agree with Eisenberg and Dreyfus in their observation that an object conception of function may be a prerequisite to the effective understanding of transformations of functions."
- **Some teachers found plugging in numbers and plotting points more convincing than the graphing tool alone**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "Plugging numbers into the equation, creating a table of values, and then plotting the points seemed more convincing for some teachers than simply accepting what the computer or graphing calculator was showing."
- **Zazkis et al.: the aim is to balance the dissonance, with graphing devices**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "Our goal is to balance the dissonance presented by the discord between initial intuition and graphical image. This is done successfully with the use of graphing devices, either electronic or manual."
- **K12 LibreTexts (SECONDARY): "A common misconception is to shift right because the three is positive"**
  - Source: 1.2: 1.2 Graphical Transformations - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Mathematics/Precalculus/01%3A_Functions_and_Graphs/1.02%3A_1.2_Graphical_Transformations
  - Quote: "A common misconception is to shift right because the three is positive."
- **No student mentioned the point-by-point approach**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "Interestingly though, a point-wise approach was not mentioned by any of the students."
- **Zazkis et al. propose placing function transformations in the context of transformations of points**
  - Source: doi:10.1016/j.jmathb.2003.09.003. https://peterliljedahl.com/wp-content/uploads/JA-JMB-2003.pdf
  - Quote: "we wish to situate the discussion of transformations of functions in the context of transformations."

My reading: this is the strongest research finding for the shifting part. The direction is a stable obstacle, even among
teachers; remembering "do the opposite" works without understanding. Zazkis et al. aim "to balance the dissonance" with graphing devices, say some teachers found plugging in numbers and plotting points more convincing than the tool alone (no student mentioned it), and propose placing function transformations in the context of moving points, the Coordinate Transformations view. My own reading of why x − 3 moves the graph 3 to the right is that the input must be 3 bigger to give the old output. A drag-to-predict screen (predict first, then see) fits this. Vertical shifts behave as expected, so teach them first.


### 6.7 Order of combined transformations

- **Order of transformations: outside the argument follows the order of operations; inside is read backwards (K12 LibreTexts, SECONDARY)**
  - Source: 1.2: 1.2 Graphical Transformations - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Mathematics/Precalculus/01%3A_Functions_and_Graphs/1.02%3A_1.2_Graphical_Transformations
  - Quote: "This method is counter-intuitive because it requires reading the transformations backwards (the opposite of the way the order of operations tells you to)."
- **Bitesize: with more than one transformation "the order matters"**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "When a function has more than one transformation, the order matters ."
- **Bitesize: outside the brackets follows the order of operations; -f(x) + 2 reflects first, then moves up**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "Transformations outside the brackets follow the standard order of operations (multiplication/reflection before addition/translation). For example, –𝑓 (𝑥) + 2 means reflect in the 𝑥-axis first, then translate up 2 units."
- **Bitesize: "If you are unsure how a combined transformation looks, work out some coordinates"**
  - Source: What are transformation of functions? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zftbh4j
  - Quote: "If you are unsure how a combined transformation looks, work out some coordinates to help you."

My reading: outside the bracket follows the order of operations, inside runs backwards, and the safe
method is to check a couple of points, as Bitesize says. This is the part to keep to two transformations at a time.


### 6.8 Domain and range

- **Domain and range: finding the range is harder than finding the domain (ERIC, graphs of functions)**
  - Source: HOW STUDENTS COME TO UNDERSTAND THE DOMAIN AND RANGE FOR THE GRAPHS OF FUNCTIONS. https://files.eric.ed.gov/fulltext/ED599786.pdf
  - Quote: "In general, determining the range was more difficult than determining the domain for the students."
- **Students focus on the y-coordinate of a point on the y-axis when asked for the domain**
  - Source: HOW STUDENTS COME TO UNDERSTAND THE DOMAIN AND RANGE FOR THE GRAPHS OF FUNCTIONS. https://files.eric.ed.gov/fulltext/ED599786.pdf
  - Quote: "However, if a graph intersected a y -axis or had a vertex on the y -axis, students often focused on the y -coordinate values of the point."

My reading: the range is harder than the domain, so teach the domain first and read the range off the graph (HELM), using
the 1/x gap and the square-root edge as the first examples.


### 6.9 Composite functions: the order

- **Composite functions: AQA examiner report (A-level Maths Paper 2, June 2023): most common error was giving fg(x)**
  - Source: Examiner report: Paper 2 - June 2023. https://www.aqa.org.uk/files/sample-papers-and-mark-schemes.2023.june.AQA-73572-WRE-JUN23_PDF/886780c070b05be5c8f2f277695a32f9640e2bcc.pdf
  - Quote: "Part (a) was answered correctly by 90% of students with the most common error being to give the composite function fg( x )."
- **Bitesize Higher Maths (SQA): when asked for f(g(x)) and g(f(x)), "the order is important"**
  - Source: Composite functions - Determining composite and inverse functions - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zrxcqp3/revision/1
  - Quote: "the order is important."

My reading: the AQA report is for A-level Maths Paper 2, June 2023, question 7(a); the report does not show the question, so
that the error was an order mix-up (giving fg when gf was asked) is my inference and is **UNCONFIRMED**. Bitesize states that order matters. A screen with two machines that cannot be swapped (a unit change and a scale) shows it without algebra.


### 6.10 Inverse functions: notation, and graphs on one pair of axes

- **Inverse notation: f^-1 looks like an exponent (Emory)**
  - Source: Inverse Functions. https://mathcenter.oxford.emory.edu/site/math100/inverses
  - Quote: "A common source of confusion for students stems from how similar this notation looks to exponentiation."
- **HELM: "Do not confuse the -1 with an index"**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Do not confuse the ‘ _−_ 1’ with an index, or power. Here the superscript is used purely as the notation for the inverse function."
- **Cooper (Penn): the inverse function concept "appears to be harder than most people realize"**
  - Source: Inverse functions - math.upenn.edu. https://www2.math.upenn.edu/~ancoop/1070/sec-modeling-4.html
  - Quote: "The concept of an inverse function appears to be harder than most people realize."
- **AMS blog: graphing f and f^-1 on the same axes "created confusion"**
  - Source: Inverse Functions: We're Teaching It All Wrong! | - AMS Blogs. https://blogs.ams.org/matheducation/2016/11/28/inverse-functions-were-teaching-it-all-wrong
  - Quote: "on the same axes created confusion and did nothing to help us understand inverse functions. There"

My reading: say "inverse" aloud, not "f to the minus one" as a power;
use a pair of machines facing each other rather than two curves on one grid. The graph reflection in y = x can come as a short screen at
the end, since research and AMS both say it confuses.


### 6.11 Learning science for this course (predict, play, explain)

- **Learning science: various representations should be seen as one object (Thompson 1994, via Ayeh)**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. http://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "According to Thompson (1994), various function representations, including equations, tables, and graphs, should be viewed as a single thing that represents a single object function rather than as distinct entities."
- **Learning science: teachers have mostly used algebra, not graphs (Eisenberg and Dreyfus 1994, via Ayeh)**
  - Source: Students’ mathematics conceptual challenges: Exploring students’ thinking, understanding, and misconceptions in functions and graphs. http://files.eric.ed.gov/fulltext/EJ1484071.pdf
  - Quote: "According to Eisenberg and Dreyfus (1994), secondary school math teachers have traditionally focused their courses on using algebraic representations of functions rather than the graphical method, which impedes students’ mental development of functions."
- **Learning science: dynamic representations support covariation reasoning (PME-NA 2021)**
  - Source: Proceedings of the 43rd Annual Meeting of PME-NA. https://par.nsf.gov/servlets/purl/10358508
  - Quote: "Findings indicate that while static representations restrict attention given to covariation, dynamic representations support PSMTs’ reasoning about covariation including making connections to how covariation is represented in static graphs."
- **Learning science: covariational reasoning is foundational for modelling and calculus**
  - Source: Proceedings of the 43rd Annual Meeting of PME-NA. https://par.nsf.gov/servlets/purl/10358508
  - Quote: "The coordination of two quantities represented in a graph of a function and the ways they change in relation to each other is called covariational reasoning and has been identified as foundational for mathematical modeling as well as many calculus concepts"
- **Learning science: dragging the input and watching the output (dynagraph)**
  - Source: Proceedings of the 43rd Annual Meeting of PME-NA. https://par.nsf.gov/servlets/purl/10358508
  - Quote: "Students can test their conjectures of the relationship between input and output by dragging the input and observing the resulting change in the output."
- **Learning science: graphing technology can support linking algebra to graph (Kop et al.)**
  - Source: Graphing formulas: Unraveling experts’ recognition processes. https://research-portal.uu.nl/ws/files/36911141/graphing.pdf
  - Quote: "Students continue to experience difficulties with seeing the relationship between algebraic and graphical representations, although graphing technology can support students’ understanding in linking representations of functions"
- **Learning science: a repertoire of basic functions (Eisenberg and Dreyfus 1994, via Kop et al.)**
  - Source: Graphing formulas: Unraveling experts’ recognition processes. https://research-portal.uu.nl/ws/files/36911141/graphing.pdf
  - Quote: "Eisenberg and Dreyfus (1994) wrote about the need for a repertoire of basic functions and knowledge of the characteristics of the representations of these functions."

My reading: the evidence supports interaction where the learner moves the input and watches the output
(dynagraph), several representations of one function, and starting from familiar basic shapes (Kop et al.: experts organise graphs by
families and attributes). It also supports predicting before seeing for horizontal shifts, since the intuition is wrong at first
(Zazkis et al.). These match the app's "predict, play, explain" loop.


## 7. Where it is used for an electrician going into marine engineering

Each use has a quote from a reachable page. Several are already in Dan's courses as
formulas (the cube law, P = I²R, pVⁿ = C, R = R₀(1 + αΔT)); here they are the same things seen as a graph or a function. The brief
should not teach the formulas again.



### 7.1 The straight line: instrument scaling, y = mx + b, offset and gain

- **4-20 mA instrument scaling is a straight-line function y = mx + b**
  - Source: Relating 4 to 20 mA Signals to Instrument Variables | Understanding Analog Instrumentation | Textbook. https://control.com/textbook/analog-electronic-instrumentation/relating-4-to-20-ma-signals-to-instrument-variables
  - Quote: "Each real-world value must be converted into its analog current equivalent, then into a scaled integer value, and finally back into a real-world representation, all with the linear equation: y=mx+b."
- **Same page: 4-20 mA is a 0 to 100 percent scale, "linear"**
  - Source: Relating 4 to 20 mA Signals to Instrument Variables | Understanding Analog Instrumentation | Textbook. https://control.com/textbook/analog-electronic-instrumentation/relating-4-to-20-ma-signals-to-instrument-variables
  - Quote: "A 4 to 20 mA current signal represents some signal along a 0 to 100 percent scale."
- **TI RTD transmitter design: "offset and gain calibration" (shift and stretch of the line)**
  - Source: RTD Temperature Transmitter for 2-Wire, 4 to 20-mA Current Loop Systems (Rev. A). https://www.ti.com/lit/ug/tidu182a/tidu182a.pdf
  - Quote: "This design also addresses system-level calibration, both offset and gain calibration, to improve ADC and DAC accuracy. Linear interpolation is also included in this design to address the non-linearity of the RTD element."

My reading: the 4 to 20 mA scale is the best "stretch and shift"
example for an electrician: "gain" stretches (m), "offset" shifts (the 4 mA live zero, b). It is a straight line he already knows, now seen as
a machine whose rule has been stretched and shifted.


### 7.2 A linear function of temperature

- **Resistivity changes with temperature change by a rule with a constant alpha; for larger changes "a nonlinear equation may be needed" (Lumen, SECONDARY)**
  - Source: Module 6 Resistance | Science 111. https://courses.lumenlearning.com/ivytech-sci111/chapter/resistance-and-resistivity
  - Quote: "For larger temperature changes, _α_ may vary or a nonlinear equation may be needed to find"

My reading: resistivity (and so resistance) as a function of temperature change is a straight line with the
slope and start value, the form Dan has already met in Linear equations. The Lumen text says that for larger changes a nonlinear equation is needed.


### 7.3 The square: P = I²R

- **P = I²R: power depends on the square of the current (HyperPhysics)**
  - Source: Electric Power. http://hyperphysics.phy-astr.gsu.edu/hbase/electric/elepow.html
  - Quote: "depends upon the square of the current dictates that for high power applications you should minimize the current."
- **Doubling the voltage on a 25 W bulb "nearly quadruples" the power (LibreTexts, SECONDARY)**
  - Source: 11.4.5: Electric Power and Energy - Physics LibreTexts. https://phys.libretexts.org/Courses/Coalinga_College/Physical_Science_for_Educators_%28CID%3A_PHYS_14%29/11%3A_Electricity/11.04%3A_Electric_Current_and_Resistance/11.4.05%3A_Electric_Power_and_Energy
  - Quote: "Thus, when the voltage is doubled to a 25-W bulb, its power nearly quadruples to about 100 W, burning it out."

My reading: the parabola (square) family, in an electrician's own formula.


### 7.4 The cube: propeller law and affinity laws

- **Ship engine load is proportional to the cube of propeller speed (generalised propeller law)**
  - Source: Ship Propeller Law Transient Cycle: Performance and Emissions by Mojibul Sajjad, Thuy Chu Van, G. M. Hasan Shahariar, Kabir Suara, Ali Zare, Nicholas Surawski, Timothy A. Bodisco, Zoran Ristovski, Richard J. Brown :: SSRN. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4783941
  - Quote: "The generalised propeller law states that the ship engine load is proportional to the cube of the rotational speed of the propeller."
- **Propeller law: power about N³, torque about N² (marine engineers' blog, SECONDARY)**
  - Source: Propeller curve and its significance - Marine engineers knowledge. https://www.marineengineersknowledge.com/2025/06/propeller%20curve.html
  - Quote: "The power (P) required to turn the propeller is approximately proportional to the cube of the propeller speed (N - RPM)."
- **Fan affinity laws: power with the cube of speed; a fan at 50% speed uses 12.5% of the power**
  - Source: Affinity Law - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/affinity-law
  - Quote: "The power drawn is proportional to the cube of the rotational speed and slowing a fan to 50% speed reduces the power used to 12.5%."
- **Pump affinity laws: capacity with speed, head with speed squared, brake horsepower with speed cubed**
  - Source: Affinity Law - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/affinity-law
  - Quote: "Capacity varies directly as the speed or impeller diameter • TDH varies as the square of the speed or impeller diameter • BHP varies as the cube of the speed or impeller diameter"
- **The propeller law "works well" in steady running but "breaks down" at partial load**
  - Source: Ship Propeller Law Transient Cycle: Performance and Emissions by Mojibul Sajjad, Thuy Chu Van, G. M. Hasan Shahariar, Kabir Suara, Ali Zare, Nicholas Surawski, Timothy A. Bodisco, Zoran Ristovski, Richard J. Brown :: SSRN. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4783941
  - Quote: "During steady-state running, such as at high speed and load, the propeller law works well, but breaks down when the ship runs under partial loading conditions, such as at a slower speed and transient"

My reading: the cube is the family with the most marine weight: engine load against propeller speed, and fan and
pump power against speed. The propeller-law quote from the marine blog is **SECONDARY**; the SSRN abstract states the law itself. The SSRN paper
also says the law breaks down at partial load, so this is a model, not an exact rule.


### 7.5 The reciprocal: current against resistance, and Boyle's law

- **Current is cut in half if resistance doubles: I = V/R is a reciprocal (LibreTexts, SECONDARY)**
  - Source: 20.2: Ohm’s Law - Resistance and Simple Circuits - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/College_Physics/College_Physics_1e_(OpenStax)/20:_Electric_Current_Resistance_and_Ohm's_Law/20.02:_Ohms_Law_-_Resistance_and_Simple_Circuits
  - Quote: "Thus, for example, current is cut in half if resistance doubles."
- **Boyle's law: plot P against V and you get a hyperbola**
  - Source: 9.2 Relating Pressure, Volume, Amount, and Temperature: The Ideal Gas Law - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law
  - Quote: "If we plot P versus V , we obtain a hyperbola"
- **pV diagram: volume falls as pressure rises, "The resulting graph is a hyperbola"**
  - Source: 2.1 Molecular Model of an Ideal Gas - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/2-1-molecular-model-of-an-ideal-gas
  - Quote: "For example, the volume of the gas decreases as the pressure increases. The resulting graph is a hyperbola."

My reading: the reciprocal family (I = V/R against R, and p = C/V), a hyperbola, with the "no value at zero" gap, and
the MCA line for pVⁿ = C (3.3).


### 7.6 The square root: differential-pressure flow, and the signal chain as a composite

- **Differential-pressure flow: DP is proportional to the square of the flow, so flow comes from the square root of DP**
  - Source: Square root scaling for differential pressure flowmeters - Control Engineering. https://www.controleng.com/square-root-scaling-for-differential-pressure-flowmeters
  - Quote: "Regardless of the type of obstruction (orifice plate, Venturi or Pitot tube, etc), the DP is proportional to the square of the flow. Therefore the system must scale flow from the square root of the DP."
- **12 mA is 50% DP but 71% flow**
  - Source: Square root scaling for differential pressure flowmeters - Control Engineering. https://www.controleng.com/square-root-scaling-for-differential-pressure-flowmeters
  - Quote: "But the root of a number from 0-1 is larger: √0.5 = 0.707. So if there is a 12 mA signal from the DP cell, that’s 50% DP, but 71% flow rate."
- **Emerson transmitters have "Linear and Square Root" output settings**
  - Source: Rosemount 3051 Pressure Transmitter - Emerson. https://www.emerson.com/is/content/emerson/en/measurement-instrumentation/technical/products/pressure/documents/doc-rosemount-3051-00809-0105-4007.pdf
  - Quote: "The transmitter has two output settings: Linear and Square Root."
- **Square root extraction and its inverse, as formulas on the 4-20 mA scale**
  - Source: Square Root Extraction Method and Formula. https://www.controlandinstrumentation.com/flow/square-root-extraction.html
  - Quote: "To convert a a linear 4-20mA signal to a square root signal use the following formula: [Output Sq Rt] = 4mA + (4 x Square Root of ([Output Linear] – 4mA)) And to convert a square root signal to a linear 4-20mA signal use this formula: [Output Linear] = 4mA + (([Output Sq Rt] - 4mA)^2 / 16)"
- **The signal chain is a composite function: DP to mA to square root to flow**
  - Source: Square-Root Extraction in Differential Pressure Transmitters: Correctly Scaling the 4–20 mA Signal for Differential-Pressure Flow Measurement - ICS Schneider Messtechnik GmbH. https://www.ics-schneider.de/radizierung-im-differenzdrucktransmitter-4-20-ma-signal-bei-wirkdruck-durchfluss-korrekt-skalieren?lang=en
  - Quote: "The signal chain is therefore differential pressure → linear 4...20 mA signal → square root extraction in PLC → flow ."
- **The square root is easier in the transmitter, because at the low end a small change in DP is a large change in flow**
  - Source: Square root scaling for differential pressure flowmeters - Control Engineering. https://www.controleng.com/square-root-scaling-for-differential-pressure-flowmeters
  - Quote: "because, on the low end, a very small change in DP results in a large change in flow."
- **Take the square root in the transmitter or in the controller, "but not both"**
  - Source: Square root scaling for differential pressure flowmeters - Control Engineering. https://www.controleng.com/square-root-scaling-for-differential-pressure-flowmeters
  - Quote: "The square root for DP-based flow can be taken either in the transmitter or in the controller (but not both)."

My reading: this is the strongest single trade
example for the course. Flow is the square root of the pressure difference (the square root graph, its limit at zero, the very steep start), the
inverse (squaring) is given as a formula for the 4 to 20 mA scale, and the chain DP to mA to square root to flow is a composite of machines
whose order and location matter ("but not both"). It uses the square root, the inverse and the composite together.


### 7.7 The inverse: converting back, and changing the subject

- **Temperature conversion and its inverse: "evaluation is easier than solving"**
  - Source: 3.7 Inverse Functions - College Algebra | OpenStax. https://openstax.org/books/college-algebra/pages/3-7-inverse-functions
  - Quote: "She realizes that since evaluation is easier than solving, it would be much more convenient to have a different formula, one that takes the Celsius temperature and outputs the Fahrenheit temperature."
- **Australian marine engineering competency unit: manipulate formulae to change subjects**
  - Source: MARL009 Perform basic marine engineering calculations. https://training.gov.au/TrainingComponentFiles/MAR/MARL009_R1.pdf
  - Quote: "Algebraic formulae and equations are manipulated to change subjects, as"

My reading: Celsius to Fahrenheit and back is the plain inverse. The training.gov.au line is an
Australian marine engineering competency (MARL009), used only to show that "change the subject" is expected there too; it is not an MCA line.


### 7.8 Shifts and stretches on a wave: DC offset, amplitude, phase (preview)

- **AC waveform with DC offset: adding a DC level shifts the wave up (Engineering LibreTexts, SECONDARY)**
  - Source: 1.2: Sinusoidal Waveforms - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/01%3A_Fundamentals/1.2%3A_Sinusoidal_Waveforms
  - Quote: "Adding a positive DC level shifts the wave up vertically, while a negative DC level shifts the wave down vertically. This"
- **Phase shift: leading is drawn to the left, lagging to the right (Engineering LibreTexts, SECONDARY)**
  - Source: 1.2: Sinusoidal Waveforms - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/01%3A_Fundamentals/1.2%3A_Sinusoidal_Waveforms
  - Quote: "Remember, if the wave is shifted to the left then it is leading and positive, while a shift to the right is lagging or delayed in time, and thus negative."
- **Sine wave in the general form with offset, peak value, frequency and phase (Engineering LibreTexts, SECONDARY)**
  - Source: 1.2: Sinusoidal Waveforms - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/01%3A_Fundamentals/1.2%3A_Sinusoidal_Waveforms
  - Quote: "Combining the foregoing elements allows us to develop a general format for a sine wave (voltage shown)"
- **Math is Fun: phase shift is horizontal, vertical shift is vertical**
  - Source: Amplitude, Period, Phase Shift and Frequency - Math is Fun. https://www.mathsisfun.com/algebra/amplitude-period-frequency-phase-shift.html
  - Quote: "The Phase Shift is how far the function is shifted horizontally from the usual position."

My reading: the AC waveform has every transformation in
one formula: amplitude is a vertical stretch, DC offset is a vertical shift, phase is a horizontal shift (and the direction is the same
"wrong way" as in 6.6: leading means drawn to the left). That belongs to Trigonometry, so here it is a one-screen preview with the formula only.


## 8. Size: how many lessons the benchmarks spend, and which core supports six to eight lessons



### 8.1 What the benchmarks spend

- **Khan Algebra 1 Unit 8: 22 skills**
  - Source: Functions | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions
  - Quote: "Unit 8: Functions 22 skills"
- **HELM 2: seven sections, with page numbers**
  - Source: HELM workbook 2 - Basic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Contents Contents 2 Basic Functions 1. Basic Concepts of Functions 2 2. Graphs of Functions and Parametric Form 11 3. One-to-One and Inverse Functions 20 4. Characterising Functions 26 5. The Straight Line 36 6. The Circle 46 7. Some Common Functions 62"

My reading:
- Brilliant spends 68 lessons on Introduction to Functions and 60 on Coordinate Transformations, far more than six to eight, because it
  also does piecewise, floor/ceiling, periodic, operations on functions and shape transformations.
- Khan has 22 skills in Algebra 1 Unit 8, plus the 14-item list of Algebra 2 Unit 9 (10 skills, three quizzes and a test).
- HELM Workbook 2 is seven sections; sections 2.1 to 2.4 (pages 2 to 35) and the catalogue in 2.7 are the function sections. HELM's own list gives the workbook as 75 pages, a line I saw in a search result but the checker could not find on the page, so the page count is **UNCONFIRMED**.
- Bitesize has two Higher articles (functions; transformations) plus the "Other graphs" guide.
- Bird gives one chapter, inside the Graphs section.

**Which core supports six to eight lessons** (my reading; the brief decides): the common spine of the sources, cut to what a marine engineer uses, is seven steps, with an eighth as a stretch:
1. The machine: rule, input, output, f(x), evaluating (Brilliant L1 to L2; Khan 1 to 5; HELM 2.1; Bitesize).
2. Domain and range, and "one input, one output" (Brilliant L4, L8; Khan; HELM 2.2; SQA).
3. The five shapes: line, square, cube, reciprocal, square root, with one-to-one and many-to-one (Bitesize; HELM 2.3; Brilliant L3, L9).
4. Shifts up, down, left, right, and what changes in the rule (Brilliant L12; Bitesize; Khan A2).
5. Stretches and flips, and the order of two moves together (Brilliant L12 to L13; SQA Higher; Khan A2).
6. One machine feeding another: composite functions and the signal chain (Brilliant L11; Bitesize; OpenStax 3.4; SQA).
7. Undoing a machine: the inverse, and rearranging a formula (Brilliant L14; Bitesize; HELM 2.3; SQA).
8. (stretch) Reading laws from graphs: square, cube, reciprocal and root in marine formulas, as a "which family is this?" mixed set (MCA 4.x).
Dropped for Dan: piecewise, floor/ceiling, periodic, operations on functions, even/odd, shape transformations (rotation, similarity).


## 9. What I could not confirm

The following are **UNCONFIRMED**, or were seen but are not in `quotes.json`:
- **Brilliant lesson contents.** Both Brilliant pages give lesson titles only; I did not open a lesson, so what each lesson draws is unknown.
- **Pearson Unit 4002 essential content.** Only the learning outcomes and assessment criteria were visible. Whether the unit teaches domain, range,
  composite or inverse functions, or transformations of graphs, is unknown. No Pearson line names them.
- **An MCA syllabus titled "Applied Mathematics".** I did not find one; I used "Mathematics" (Second Engineer) and General Engineering Science I.
  The Chief Engineer syllabuses were not searched for function lines in this run.
- **Bird section titles for the 4th-edition chapter** ("Standard curves, Simple transformations, Periodic functions, Continuous and discontinuous
  functions, Even and odd functions, Inverse functions") were visible only on a mirror copy of the book, which the checker rejects. The publisher
  abstract is in `quotes.json` instead.
- **HELM Workbook 2 is 75 pages** (HELM Workbook 49 student's guide). The line was in a search result but the checker cannot find it on the page.
- **Khan "Algebra 1 (Illustrative Mathematics) Unit 5, 40 items"** was cut in the search result and is not quoted. The Algebra 1 Unit 8 list (22 skills)
  and the Algebra 2 Unit 9 list are quoted instead.
- **The AQA examiner report** is for A-level Maths (Paper 2, June 2023, question 7a). It does not show the question, so reading the error as an
  order mix-up is my inference.
- **NCTM and GCSE examiner reports.** I searched Edexcel, OCR, AQA and Eduqas GCSE reports for composite and inverse function errors and found no
  line that names them (the Eduqas 2026 report mentions a function machine question only). I found no NCTM page. The misconception evidence
  is research papers, one literature review and Bitesize's own wording.
- **A teaching blog's list of misconceptions** (f(x) read as f times x; "a function is a graph"; "the vertical line test is how you identify
  functions") was seen only in a cut search result, so it is not quoted; the Lumen page and the literature review say the same things.
- **Pump affinity law on turn2engineering.com** was cut in the search result; the ScienceDirect page is quoted instead.
- **Ship resistance goes with speed squared** is stated only on a marine engineers' blog (SECONDARY); not used as a finding. The propeller-law
  quote from that blog is also SECONDARY, and the SSRN abstract is the primary line.
- **Nothing here is a lesson plan.** The seven-lesson shape in section 8 is my reading of the sources, for the brief to accept or change.


