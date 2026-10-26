# Statistics for engineers: research notes

Researched 26 Oct 2026 for the Statistics for engineers course brief (the first course in the Maths shelf's
Probability, statistics and data folder; blurb "Measurements, trends and reliability: how far to trust a reading,
whether a drift is wear or noise, and how often equipment fails."). The brief itself is not written here; these
notes are its evidence. Dan is an electrician and a submariner on the electrical engineering path. Next year he does
a Level 3 marine engineering course (general engineering first, then submarine and nuclear propulsion). He asked for
foundations that see him through any new topic, not a remake of that course. So this is one short practical course,
not the seven statistics and probability courses that follow it in the folder (Descriptive statistics, Data
visualisation, Probability fundamentals, Conditional probability, Expected value, Regression and prediction, Bayesian
reasoning), which are not planned. It carries inline the little probability it needs. Electronics and power
electronics (Electrical shelf, next) is where the ground it defers goes.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. Findings I could
not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are
marked "My reading" and are not quotes. Mirror and copy sites were avoided. Two housekeeping points: tool file
`66-web_fetch.json` is the connector's reply for the Khan Academy overview page, which was too long for the tool's
reply limit and was saved by the harness; I wrapped that saved reply unchanged as a tool file (nothing retyped). And
where a quote carries odd spacing or a stray symbol (for example "prob ability", "so mething", or a missing sigma),
that is how the page's text came back; I kept it so the quote still matches.

What Dan already has, so that none of it is re-taught: Foundational maths (Fractions, Negative numbers, Percentages,
Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals), Algebra (Linear equations,
Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and polynomials,
Exponentials and logarithms, Trigonometry, Complex numbers), Calculus fundamentals, Vectors, Differential equations,
Matrices and Linear algebra, and the electrical courses AC circuits, Design and verification, Motors and HV Subsea
Cable Testing.

---

## 1. Benchmark: Brilliant's statistics, data and probability courses

Brilliant has no single "statistics for engineers" or "introduction to statistics" course. Its statistics and data
ground is spread over six reachable courses, which are below in the order of a learner who starts from nothing. Pages
move: Brilliant is renaming its courses, levels and lessons (see 1.7), and the same course sometimes shows slightly
different counts on two copies of its page (see 1.1). The only thing the pages give is
titles, so the pictures and interactives inside each lesson are **UNCONFIRMED** (I did not open a lesson).

### 1.1 Everyday Statistics (descriptive statistics): 36 lessons in 8 levels
The page is `brilliant.org/courses/basic-math/`. It is the descriptive core: means first (levels 1 to 3), then the
median (levels 4 and 5), then quartiles and box plots (levels 6 and 7) and last outliers (level 8). Standard
deviation is named in the description but no lesson title names it, so where it is taught is **UNCONFIRMED**.
Level Review screens are not counted as lessons.

- **Brilliant Everyday Statistics is 36 lessons and about 360 exercises (a later page copy says 434 exercises)**
  - Source: Practice Everyday Statistics | Brilliant. https://brilliant.org/courses/basic-math/
  - Quote: "Reason about data and descriptive statistics in a practical context. 36 Lessons 360 Exercises"
- **A second copy of the Everyday Statistics page gives 434 exercises, so counts of exercises move; lessons stay at 36**
  - Source: Practice Everyday Statistics | Brilliant. https://brilliant.org/courses/basic-math
  - Quote: "Reason about data and descriptive statistics in a practical context. 36 Lessons 434 Exercises"
- **Everyday Statistics levels 1 to 4: means, rebalancing, adding points, median**
  - Source: Practice Everyday Statistics | Brilliant. https://brilliant.org/courses/basic-math/
  - Quote: "Level 1 Means Means Balancing Distributions Mean Values Finding Totals Level Review Level 2 Rebalancing Distributions Predicting Means Rebalancing Asymmetric Distributions Means of Lists Level Review Level 3 Adding Points Splitting Finding Means Adding a Point Updating Means Level Review Level 4 Median Comparisons Median Finding Medians Splitting Medians of Lists Level Review"
- **Everyday Statistics levels 5 to 8: more medians, quartiles, box plots, outliers**
  - Source: Practice Everyday Statistics | Brilliant. https://brilliant.org/courses/basic-math/
  - Quote: "Level 5 More Medians Adding a Point Comparing Median and Mean Modes Middle 50% Segmenting Data Level Review Level 6 Quartiles Quartiles Interquartile Range Quartiles of Lists Boxplots Level Review Level 7 Box and Whisker Plots Adding Whiskers Matching the Boxplot The Range Comparing Distributions Level 8 Outliers Outliers Skewing the Mean Defining Outliers Identifying Outliers Outside the Whiskers"
- **Everyday Statistics description: mean, median, mode, then variability including standard deviation, with no heavy calculation**
  - Source: Practice Everyday Statistics | Brilliant. https://brilliant.org/courses/basic-math/
  - Quote: "Our journey begins with an interactive introduction to common measures of central tendency—mean, median, and mode. You’ll discover how these measures shift when you add new data or analyze entire datasets—using intuitive techniques that sidestep complex calculations. Next, we dive deeper into visualizing and comparing datasets—exploring variability (range, quartiles, and standard deviation) and examining how these measures reflect the shape of your data"

My reading of the order, from the titles only: the mean comes first (levels 1 to 3, with "Balancing", "Rebalancing"
and "Adding a Point"), and the median is brought in by comparison with it (levels 4 and 5, "Comparing Median and
Mean"), so "why the average alone misleads" is the opening idea of the whole course. Outliers come last, once centre
and spread are secure ("Skewing the Mean" is in level 8).

### 1.2 Exploring Data Visually: 29 lessons in 6 levels
The page is `brilliant.org/courses/visual-exploration/`. The part that matters for this course is level 3 (Line Graphs:
Line Graphs, Trends, Comparing Trends) and level 4 (Scatter Plots), plus Seasonal Variation in level 2. The rest is
chart reading and data tables (levels 5 and 6 are filtering and grouping data and a rentals case study, which this
course does not need).

- **Brilliant Exploring Data Visually is 29 lessons and 237 exercises**
  - Source: Practice Exploring Data Visually | Brilliant. https://brilliant.org/courses/visual-exploration/
  - Quote: "Build a solid foundation in data analysis with visualizations and data transformations. 29 Lessons 237 Exercises"
- **Exploring Data Visually levels 1 to 4: bar charts, boxplots, line graphs (Trends), scatter plots**
  - Source: Practice Exploring Data Visually | Brilliant. https://brilliant.org/courses/visual-exploration/
  - Quote: "Level 1 Bar Charts and Pie Charts Reading Bar Charts Analyzing Bar Charts Pie Charts Histograms Percentiles Level Review Level 2 Boxplots Boxplots Comparing Boxplots Seasonal Variation Level Review Level 3 Line Graphs Line Graphs Trends Comparing Trends Level Review Level 4 Scatter Plots Observing Relationships Reading Scatter Plots Log Scales Comparing on Log Scales Level Review"
- **Exploring Data Visually description and prerequisites**
  - Source: Practice Exploring Data Visually | Brilliant. https://brilliant.org/courses/visual-exploration/
  - Quote: "Answer data analysis questions with summary statistics from visualizations such as box and whisker plots, line graphs, scatterplots, bar charts, and histograms. Apply data transformations such as filter and groupby to analyze data. Use visualizations to represent and communicate about data effectively. Decide which plot type to use based on the data type that you have. Learn when and how to implement logarithmic scales (as opposed to linear ones) to best represent the story your data tells. Topics covered Bar charts Pie charts Line graphs Scatterplots Histograms Box and whisker plots Linear and Logarithmic scales Summary statistics Distributions Filter Groupby Aggregate Prerequisites and next steps You should be comfortable with calculating percentages. Knowledge of how to calculate the mean, median, and mode is beneficial though it is covered briefly in the course."

### 1.3 Probability in Data: 19 lessons in 5 levels
The page is `brilliant.org/courses/probability-fundamentals/`. It teaches the rule of sum and the rule of product
(the OR and AND rules in this course), then conditional probability, Bayes' Rule and simulation. Its only listed
prerequisite is Fractions.

- **Brilliant Probability in Data is 19 lessons and 183 exercises, prerequisite Fractions**
  - Source: Practice Probability in Data | Brilliant. https://brilliant.org/courses/probability-fundamentals/understanding-probability?lesson=mutually-exclusive-probability
  - Quote: "Build a foundation in probability to better understand the likelihood of events. 19 Lessons 183 Exercises"
- **Probability in Data levels: estimating, combining and conditional probability, models, case studies**
  - Source: Practice Probability in Data | Brilliant. https://brilliant.org/courses/probability-fundamentals/understanding-probability?lesson=mutually-exclusive-probability
  - Quote: "Level 1 Understanding Probability Estimating Probabilities Simulating Outcomes The Past And The Future Changing Fortunes Mutually Exclusive Events Level Review Level 2 Computing Probabilities Combining Probabilities Conditional Probability Total Probability Updating Predictions Level 3 Assumptions and Models Dependence and Independence Building Models Tuning Models Level 4 Case Study Influence Probabilities Simulation I Updating the Influence Probabilities Level 5 Case Study Part 2 Spreading False News Twitter Bots Using Tweet Features A Simple Classifier"
- **Probability in Data topics include the rule of sum and the rule of product**
  - Source: Practice Probability in Data | Brilliant. https://brilliant.org/courses/probability-fundamentals/understanding-probability?lesson=mutually-exclusive-probability
  - Quote: "Topics covered Estimating Probability Rule of Sum Rule of Product Conditional Probability Bayes' Rule Dependence and Independence Cumulative Probabilities Probability Estimates Updating Probabilities Probability Simulation"

### 1.4 Probability and Chance: 31 lessons in 9 levels
The page is `brilliant.org/courses/winning-with-probability/`. Its first level is called "Introduction to Probability".
The Regression and Predicting with Probability pages list "Introduction to Probability" as a prerequisite, so this is
most likely the course meant by that name (**UNCONFIRMED**: the prerequisite page does not link to it). AND and OR probabilities come in levels 6
and 7, after expected value, and "Independent AND" is in level 9.

- **Brilliant Probability and Chance (the course that starts at Introduction to Probability) is 31 lessons and 406 exercises**
  - Source: Practice Probability and Chance | Brilliant. https://brilliant.org/courses/winning-with-probability/probability-relationships?lesson=outcomes-in-or
  - Quote: "Use probability to make better decisions. 31 Lessons 406 Exercises"
- **Probability and Chance puts AND and OR probabilities in levels 6 and 7, after expected value**
  - Source: Practice Probability and Chance | Brilliant. https://brilliant.org/courses/winning-with-probability/probability-relationships?lesson=outcomes-in-or
  - Quote: "Level 4 Expected Value Probability and Value Variable Rewards Expected Value Calculating Expected Value Level Review Level 5 Expected Value Comparisons Comparing Value Multiple Event Value Multiple Event Comparisons Level Review Level 6 Expressing Probability Venn Diagrams AND Probabilities OR Probabilities Level 7 Probability Relationships Outcomes in OR Calculating OR NOT Probability Level 8 Conditional Probability Conditional Probability Dependent or Independent Identifying Dependence Level 9 Calculating with Conditionals Two Way Dependence Calculating Conditionals Independent AND Multiplying with Dependence"

### 1.5 Regression: 23 lessons in 8 levels
The page is `brilliant.org/courses/explaining-variation/`. Only levels 1 and 2 (Correlation, Correlation Extremes,
Simple Linear Regression, Calculating Error, Regression and Prediction) are near this course. Multiple regression,
model building and the case studies are beyond a fitted line and are left out.

- **Brilliant Regression is 23 lessons; prerequisites are Exploring Data Visually and Introduction to Probability**
  - Source: Practice Regression | Brilliant. https://brilliant.org/courses/explaining-variation/?from_llp=data-analysis
  - Quote: "Leverage the power of correlation and regression to understand relationships and make predictions with data. 23 Lessons 186 Exercises"
- **Regression levels: correlation, regression, paradoxes, multiple regression, models, case studies**
  - Source: Practice Regression | Brilliant. https://brilliant.org/courses/explaining-variation/?from_llp=data-analysis
  - Quote: "Level 1 Correlation Correlation Correlation Extremes Simple Linear Regression Level Review Level 2 Regression Calculating Error Regression and Prediction Level 3 Regression Paradoxes Nonlinear Relationships Simpson's Paradox Level 4 From Simple to Multiple Regression Use Multiple Variables Understand Coefficients Optimize Coefficients Level 5 Building Models Assess the Model Choose Variables Avoid Overfitting Interpret the Model Level Review Level 6 Variable Types Use Categorical Variables Explore Interactions Transform Variables Level Review Level 7 Case Study EV Trends Exploring EV Correlations Exploring Data Subpopulations Level 8 Case Study Part 2 Battery Electric Vehicles Plug-in Hybrid Electric Vehicles Changing the Shape of the Data"
- **Regression prerequisites**
  - Source: Practice Regression | Brilliant. https://brilliant.org/courses/explaining-variation/?from_llp=data-analysis
  - Quote: "Prerequisites and next steps Exploring Data Visually Introduction to Probability"

### 1.6 Predicting with Probability: 15 lessons in 5 levels
Not needed here (probability mass functions, conditional probability, Bayes, case studies). Listed so the folder's
unplanned courses can be matched to it.

- **Brilliant Predicting with Probability is 15 lessons**
  - Source: Practice Predicting with Probability | Brilliant. https://brilliant.org/courses/probabilistic-prediction/conditional-probability?lesson=joint-probabilities
  - Quote: "Harness data to predict what lies ahead. 15 Lessons 88 Exercises"
- **Predicting with Probability prerequisites**
  - Source: Practice Predicting with Probability | Brilliant. https://brilliant.org/courses/probabilistic-prediction/conditional-probability?lesson=joint-probabilities
  - Quote: "Prerequisites and next steps Introduction to Probability Data Analysis Fundamentals Fluency in converting between decimals and percentages."

### 1.7 Where they sit in Brilliant's path
Brilliant lists its data analysis courses in this order and places the learning path at the Intermediate level. Its
help page says its statistics coverage runs from descriptive statistics to Bayesian reasoning. "Clustering &
Classification" is in the list but I did not read its page, so its lessons are **UNCONFIRMED** (it is machine
learning and not needed here).

- **Brilliant lists its data analysis courses in this order**
  - Source: Brilliant | The Smartest Way to Learn Data Analysis. https://brilliant.org/data
  - Quote: "Data Analysis: Covered topics Exploring Data Visually Probability in Data Clustering & Classification Regression Predicting with Probability"
- **Brilliant says its statistics coverage runs from descriptive statistics to Bayesian reasoning**
  - Source: What math does Brilliant cover? | Brilliant. https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/
  - Quote: "Yes. Brilliant covers descriptive statistics, data visualization, prob ability, conditional probability, expected value, regression, probabilistic prediction, and Bayesian reasoning across the Everyday Math, Data Analysis, and Mind-Bending Math paths."
- **Brilliant is renaming courses to topics, levels to units and lessons to concepts, so names and counts on its pages move**
  - Source: What are Learning Paths? | Brilliant. https://brilliant.org/help/features/what-are-learning-paths
  - Quote: "updating names across Brilliant: courses are now topics, levels are units, and lessons are concepts."

My reading: Brilliant's order is pictures of data first (Exploring Data Visually), then probability, then regression,
then prediction; Everyday Statistics (descriptive statistics) is not in the Data Analysis list above and is the
foundation under it (Exploring Data Visually only needs percentages, and covers the mean, median and mode "briefly"). There is no Brilliant course on
measurement uncertainty, tolerance, control charts or reliability. Those parts of Dan's scope (2, 4 as drift against
noise, and 5) have no Brilliant benchmark, and the benchmark for them is the engineering sources in sections 2 and 3.
In this app's Maths shelf (`docs/shelves-maths.json`) the Probability, statistics and data folder holds Statistics for
engineers first and then seven unplanned courses; Everyday statistics and Probability and chance sit in the Everyday
maths folder, and are not Dan's course either.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy: Statistics and probability (16 units)
Khan teaches in this order: data first, then centre, spread and the normal curve, then scatter plots and lines, and
only then probability, random variables and inference. Units 3 to 5 are the ones near this course.

- **Khan Academy Statistics and probability has 16 units, starting with data summary and ending with ANOVA**
  - Source: Statistics and Probability | Khan Academy. https://www.khanacademy.org/math/statistics-probability
  - Quote: "Statistics and probability 16 units Unit 1 Analyzing categorical data Unit 2 Displaying and comparing quantitative data Unit 3 Summarizing quantitative data ... Unit 9 Random variables Unit 10 Sampling distributions Unit 11 Confidence intervals ... Unit 13 Two-sample inference for the difference between groups Unit 14 Inference for categorical data (chi-square tests) ... Unit 16 Analysis of variance (ANOVA)"
- **Khan unit 3 teaches standard deviation of a population, then a sample**
  - Source: Statistics and Probability | Khan Academy. https://www.khanacademy.org/math/statistics-probability
  - Quote: "Variance and standard deviation of a population 1. Measures of spread: range, variance & standard deviation 2. Variance of a population 3. Population standard deviation 4. The idea of spread and standard deviation 5. Calculating standard deviation step by step 6. Standard deviation of a population 7. Mean and standard deviation versus median and IQR"
- **Khan unit 4 teaches z-scores then the empirical rule**
  - Source: Statistics and Probability | Khan Academy. https://www.khanacademy.org/math/statistics-probability
  - Quote: "Z-scores 1. Normal distribution problem: z-scores (from ck12.org) 2. Comparing with z-scores 3. ... Normal distributions and the empirical rule 1. Qualitative sense of normal distributions 2. Normal distribution problems: Empirical rule 3. Standard normal distribution and the empirical rule (from ck12.org) 4. More empirical rule and z-score practice (from ck12.org) 5. Empirical rule 6. Normal distributions review"
- **Khan unit 5 teaches trend lines (eyeballing the line of best fit) before least-squares**
  - Source: Statistics and Probability | Khan Academy. https://www.khanacademy.org/math/statistics-probability
  - Quote: "Introduction to trend lines Eyeballing the line of best fit 4. Estimating with linear regression (linear models) 5. ... Estimating slope of line of best fit 8. Equations of trend lines: Phone data"
- **Khan Academy probability library has a multiplication rule for independent events (with the at-least-one idea)**
  - Source: Statistics and Probability | Khan Academy. https://www.khanacademy.org/math/statistics-probability
  - Quote: "Multiplication rule for independent events "At least one" probability with coin flipping 6. Free-throw probability"

My reading: Khan puts "Mean and standard deviation versus median and IQR" at the end of the standard deviation
lessons, the z-score before the empirical rule, and "Eyeballing the line of best fit" before the least-squares
equation. That is the order Dan's course should follow inside each part: picture first, then rule.

### 2.2 BBC Bitesize (National 5 and GCSE)
- **Bitesize National 5 teaches standard deviation as how far on average results are from the mean**
  - Source: Standard deviation - Comparing data sets using statistics - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z94297h/revision/4
  - Quote: "Standard deviation is an important measure of spread or dispersion. It tells us how far, on average the results are from the mean. Therefore if the standard deviation is small, then this tells us that the results are close to the mean, whereas if the standard deviation is large, then the results are more spread out."
- **Bitesize shows two sets with the same mean, median and range but different spread**
  - Source: Standard deviation - Comparing data sets using statistics - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z94297h/revision/4
  - Quote: "For example, the following two data sets are significantly different in nature and yet have the same mean, median and range. Some sort of numerical measure which distinguishes between them would be useful."

### 2.3 SQA National 5 and Higher Applications of Mathematics
These are school-level lines in the Scottish system. They are useful as the floor: the statistics a school leaver
has met, which the course can assume has been seen once but not kept.

- **SQA National 5 Applications of Mathematics: mean, median, mode, range, interquartile range, standard deviation and a line of best fit**
  - Source: National 5 Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-applications-mathematics.pdf
  - Quote: "Using statistics to analyse and compare data sets  Calculating mean, median, mode, range, interquartile range, and standard deviation Drawing a line of best fit from given data"
- **SQA National 5 Applications of Mathematics: tolerance limits and compatibility of fitting components**
  - Source: National 5 Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-applications-mathematics.pdf
  - Quote: "Considering the effects of tolerance  Given the tolerance, calculate the limits  Given the accuracy of the methods of production of two fitting components, consider the implications for compatibility"
- **SQA Higher Applications of Mathematics: location and dispersion, mean and standard deviation, median and interquartile range**
  - Source: Higher Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-applications-mathematics.pdf
  - Quote: "interpreting the distribution of data, with particular reference to symmetry, normality, and skewness  deriving, understanding, and interpreting sample measures of location and dispersion, including mean and standard deviation, and median and interquartile range"
- **SQA Higher Applications of Mathematics: scatter plots, simple linear regression, prediction, trends such as seasonality**
  - Source: Higher Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-applications-mathematics.pdf
  - Quote: "Applying statistical skills to correlation and linear regression  interpreting and constructing scatter plots  using simple linear regression  interpreting the slope and intercept parameters in relation to data  using linear models for prediction  assessing the accuracy of predictions  understanding and interpreting correlations  understanding the applicability of Pearson’s product-moment correlation coefficient  exploring trends in data, for example seasonality"
- **SQA Higher: predictions must stay within the range of the data, and correlation does not imply causation**
  - Source: Higher Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-applications-mathematics.pdf
  - Quote: "understand that a correlation does not imply causation. For example, a positive correlation between incidents of knife crime and global temperatures may exist, but this does not imply that there is a relationship  understand the influence of outliers in correlation — that the presence of outliers may reduce the correlation  use software to fit a linear regression model, where appropriate  interpret the slope and intercept parameters in the context of the data  use the linear regression model to predict the dependent variable and comment on the accuracy of the prediction: Version 2.0 36 Statistics and probability Skills Explanation Examples ― predictions need to be within the range of the data used to make"
- **SQA Higher Applications of Mathematics: independent events and AND / OR conditions**
  - Source: Higher Applications of Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-applications-mathematics.pdf
  - Quote: "demonstrate knowledge and understanding of basic probabilities of independent events  interpret information represented in tables or graphs, such as tree diagrams and Venn diagrams  derive conditional probabilities from tree diagrams and Venn diagrams (using AND and OR conditions)  determine combinations of independent events."

### 2.4 HELM (Helping Engineers Learn Mathematics, Loughborough)
HELM is the course written for engineers, so its order is the best match. Statistics are workbooks 35 to 46, with
reliability and quality control last, after the normal distribution and regression.

- **HELM has 50 workbooks; workbooks 35 to 46 are the probability and statistics material**
  - Source: Helping Engineers Learn Mathematics Workbooks (HELM) | Mathematics Learning Support Centre | Loughborough University. https://www.lboro.ac.uk/departments/mlsc/student-resources/helm-workbooks
  - Quote: "Workbooks 35 - 46 contain probability and statistics material for engineering undergraduates."
- **HELM statistics workbooks by title: 35 to 39, then 43 to 46 (the excerpt skips 40 to 42)**
  - Source: HELM: Helping Engineers Learn Mathematics - STACK Docs. https://docs.stack-assessment.org/en/STACK_question_admin/Library/HELM
  - Quote: "35. Sets and Probability 36. Descriptive Statistics 37. Discrete Probability Distributions 38. Continuous Probability Distributions 39. The Normal Distribution ... 43. Regression and Correlation 44. Analysis of Variance 45. Non-parametric Statistics 46. Reliability and Quality Control"
- **HELM 36 Descriptive Statistics learning outcomes**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "explain why statistics is important for engineers. • explain what is meant by the term descriptive statistics • calculate means, medians, modes and standard deviations • draw a variety of statistical diagrams"
- **HELM 39 The Normal Distribution learning outcomes and tolerance framing**
  - Source: 39 39. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/39_1.pdf
  - Quote: "Piston rings are mass-produced. The target internal diameter is 45 mm but records show that the diameters are normally distributed with mean 45 mm and standard deviation 0.05 mm. An acceptable diameter is one within the range 44.95 mm to 45.05 mm. What proportion of the output is unacceptable?"
- **HELM 43 Regression and Correlation: eyeballing a line is unsatisfactory, so least squares**
  - Source: 43 43. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook43/43_1_rgrssn.pdf
  - Quote: "finding a regression line by eye is unsatisfactory as a general statistical method since it involves guess-work in drawing the line with the associated errors in any results obtained."
- **HELM Workbook 46 Reliability and Quality Control contains 46.1 Reliability and 46.2 Quality Control**
  - Source: About the HELM Project. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/50_1.pdf
  - Quote: "Workbook 46 - Reliability and Quality Control (38 pages) 46\.1 Reliability 46\.2 Quality Control"
- **HELM 46.1 Reliability learning outcomes**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "Learning Outcomes On completion you should be able to . . . • appreciate the importance of lifetime distributions • complete reliability calculations for simple systems • state the relationship between the Weibull distribution and the exponential distribution"
- **HELM Workbook 46 aim: reliability first, then statistical quality control, with the basic calculations for each**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "You will first learn about the importance of the concept of reliability applied to systems and products. The second Section introduces you to the very important topic of quality control in production processes. In both cases you will learn how to perform the basic calculations necessary to use each topic in practice."

My reading: HELM puts the sequence as probability (35), descriptive statistics (36), distributions (37 to 39),
sampling to hypothesis tests (40 to 42), regression (43), and then reliability (46.1) and quality control (46.2).
Dan's five parts take 36, then measurement (not a HELM workbook), then 39 and 36.2, then 43 and 46.2, then 46.1. Four
of the five lean on HELM almost directly.

### 2.5 Bird's Engineering Mathematics (9th edition)
- **Bird's Engineering Mathematics (9th ed.) Section 11 Statistics: chapters 60 to 67**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 11: Statistics 60\. Presentation of statistical data 61\. Mean, median, mode and standard deviation 62\. Probability"
- **Bird's chapters 63 to 67: binomial and Poisson, normal, correlation, regression, sampling**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "The binomial and Poisson distribution 64\. The normal distribution 65\. Linear correlation 66\. Linear regression 67\. Sampling and estimation theories"
- **Bird's chapter 61 sections: central tendency, mean median mode, standard deviation, quartiles**
  - Source: Bird’s Engineering Mathematics; NinthEdition. https://api.pageplace.de/preview/DT0400.9781000351941_A40491292/preview-9781000351941_A40491292.pdf
  - Quote: "61 Mean, median, mode and standard deviation 629 61\.1 Measures of central tendency 629 61.2 Mean, median and mode for discrete data 630 61.3 Mean, median and mode for grouped data 631 61.4 Standard deviation 632 61.5 Quartiles, deciles and percentiles"

My reading: Bird has the same order as HELM (data, centre and spread, probability, binomial and Poisson, normal,
correlation, regression, sampling). Bird's chapter 61 packs mean, median, mode, standard deviation and quartiles into
one chapter.

---

## 3. What an engineer actually uses of this topic

### 3.1 Pearson BTEC Higher National Engineering: Unit 4002 (and two optional units)
Unit 4002 Engineering Mathematics (formerly "Engineering Maths") is a core mandatory unit in the Pearson HNC/HND
Engineering qualifications. Its second learning outcome is the statistics line. The optional statistical
process control unit (4037) and manufacturing operations mathematics (4079) show where the same ideas go next.

- **Pearson HN Engineering specification 2024: Unit 4002 is a core mandatory unit (previously titled Engineering Maths)**
  - Source: Higher Nationals. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "Core Mandatory 4002: Engineering Mathematics 15 4 ... Note 56: Level 4 Engineering Maths is retitled as Engineering Mathematics."
- **Pearson BTEC HN Engineering Unit 4002 (core in every HN Engineering pathway) LO2 and its pass criteria on statistics**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO2 Investigate applications of statistical and probability techniques to interpret, organise, and present data P4 Investigate engineering data by calculating mean, mode, median, and standard deviation. P5 Calculate probabilities within Poisson, binomially and normally distributed engineering random variables. M2 Conduct an engineering hypothesis test and interpret the results."
- **Unit 4002 distinction: present data for a non-technical audience**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "D1 Present data as meaningful information using appropriate methods that can be understood by a non- technical audience."
- **Unit 4002 LO1 pass criterion P3 builds on exponential and logarithmic functions (Dan has these)**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson optional Unit 4037 Statistical Process Control: natural against assignable causes of variation, then mean, range and standard deviation**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P2 Distinguish the significance between natural and assignable causes of variation. M1 Analyse data to construct the frequency distribution and calculate the mean, range and standard deviation of a given process."
- **Pearson Unit 4079 Manufacturing Operations Mathematics: mean and standard deviation, then Gaussian probabilities**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO2 Apply a variety of statistical and probability techniques to interpret information and organise and present data P4 Summarise data by calculating mean and standard deviation of various manufactured products/parts. P5 Calculate likely probabilities using frequency and Gaussian distributions of manufactured products."

My reading: the Pass criteria are exactly centre and spread, and probabilities from a distribution (normal here;
Poisson and binomial are outside this course). The Merit line (a hypothesis test) is outside the scope Dan set. The
distinction line (data presented for a non-technical audience) fits the idea of stating a result with its
uncertainty plainly. Unit 4037's "natural and assignable causes of variation" is the same split as common cause and
special cause, which is the drift-against-noise idea of part 4.

### 3.2 SQA Higher National mathematics for engineering
- **SQA NextGen HN Engineering Mathematics is a suite of five units**
  - Source: J7GK 46 Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "The five units are: • Engineering Mathematics 1 at SCQF level 6 • Engineering Mathematics 2 at SCQF level 7 • Engineering Mathematics 3 at SCQF level 7 • Engineering Mathematics 4 at SCQF level 8 • Engineering Mathematics 5 at SCQF level 8"
- **SQA Engineering Mathematics 3 (2014 spec) is differentiation and integration, with no statistics outcome**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/H7K234.pdf
  - Quote: "Outcome 1 Use differentiation techniques to solve mathematical problems. ... Outcome 2 Use integration techniques to solve mathematical problems."
- **SQA NextGen HN lists probability and statistics only as a level 8 data science unit**
  - Source: NextGen: HN course documents - Qualifications Scotland. https://www.sqa.org.uk/sqa/110487.html
  - Quote: "Probability and Statistics in Data Science (J6CK 48 SCQF level 8)"
- **SQA legacy HN grid had Statistics for Engineering in three half-credit units: descriptive, inferential, control charts**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Statistics for Engineering (Descriptive ) 7481634 Statistics for Engineering (Inferential) 7481644 Statistics for Engineering (Control Charts)"

My reading: I could not find a statistics unit in the current SQA engineering mathematics suite (five units,
Engineering Mathematics 1 to 5). Engineering Mathematics 3 (the 2014 specification) is differentiation and integration.
The NextGen course documents page lists Probability and Statistics in Data Science and Mathematics for Data, both at
SCQF level 8, which is above what Dan needs, and the 2001 legacy grid listed Statistics for Engineering as three units
(descriptive, inferential, control charts). **UNCONFIRMED:** the outcomes of Engineering Mathematics 1 (I saw only
excerpts: functions, exponentials and logarithms, vectors and complex numbers), 2, 4 and 5, and whether a lower-level
statistics unit exists in the NextGen list.

### 3.3 MCA (Maritime and Coastguard Agency) engineer officer and ETO
- **MCA engineering Certificate of Competency documents include SQA Management Level Mathematics, Applied Heat and Applied Mechanics**
  - Source: Engineering CoC Requirements - GOV.UK. https://www.gov.uk/government/publications/coc-requirements/engineering-coc-requirements
  - Quote: "SQA Management Level Mathematics SQA Management Level Engineering Drawing SQA Management Level Applied Heat SQA Management Level Applied Mechanics"
- **MCA management-level Mathematics written syllabus (marine engineer officers): the contents list has no statistics**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Contents 1. 1. Arithmetic 2. 2. Algebra 3. 3. Logarithms 4. 4. Graphs 5. 5. Trigonometry 6. 6. Mensuration 7. 7. Calculus - differentiation 8. 8. Calculus - integration"
- **MCA mathematics syllabus 1.1: error as a percentage, and rates and averages**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "7. Expresses an error as a percentage. ... 10. Understands rates, averages, proportional rates of doing work and cost."
- **MCA ETO syllabus (MSN 1860) topic 4: trending HV insulation resistance tests and polarisation index**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Polarisation Index test for HV transformers;  Trending HV IR tests."
- **MCA ETO syllabus: use of measuring and calibrating instruments**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Interpreting technical drawing;  The use of measuring and calibrating instruments;"
- **MCA ETO syllabus: emergency generator auto start, battery bank and UPS testing**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Testing and maintenance of the auto start system for the emergency generator in the event of main power failure;  Battery bank and UPS – maintenance and testing procedures."

My reading: the management-level Mathematics written syllabus for marine engineer officers has eight headings
(arithmetic to integration) and no statistics heading; its only nearby lines are errors as a percentage and "rates,
averages". The ETO syllabus (MSN 1860) is where measurement and trends show up: testing and measuring equipment,
calibration, trending insulation resistance tests and testing the emergency generator and UPS. So the MCA route does not
ask for statistics as a subject, but its maintenance lines assume the habits of this course. **UNCONFIRMED:** the MCA
oral exam syllabus (MIN 654) lines; the page I fetched did not show them. The ETO syllabus and mathematics syllabus
excerpts I read contain neither the word "reliability" nor "statistics".

### 3.4 Measurement uncertainty: what the calibration bodies say
These are public guides from the UK's national measurement bodies and from an instrument maker. They give Dan's part 2
its words (error, uncertainty, accuracy, resolution, random, systematic, confidence).

- **NPL: error against uncertainty**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "is the difference between the measured value and the ‘true value’ of the thing being measured. Uncertainty is a quantification of the doubt about the measurement result."
- **NPL: an uncertainty needs two numbers, an interval and a confidence level**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "two numbers are really needed in order to quantify an uncertainty. One is the width of the margin, or interval . The other is a confidence level , and states how sure we are that the ‘true value’ is within that margin. For example: We might say that the length of a certain stick measures 20 centimetres plus or minus 1 centimetre, at the 95 percent confidence level."
- **NPL: random and systematic effects, and what repeating readings can and cannot do**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "random - where repeating the measurement gives a randomly different result. If so, the more measurements you make, and then average, the better estimate you generally can expect to get. or • systematic - where the same influence affects the result for each of the repeated measurements (but you may not be able to tell). In this case, you learn nothing extra just by repeating measurements."
- **NPL: the spread of repeated readings tells you about the uncertainty**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "When repeated measurements give different results, we want to know how widely spread the readings are. The spread of values tells us something about the uncertainty of a measurement."
- **NPL: how to state a result with its uncertainty**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "The measurement result, together with the uncertainty figure, e.g. ‘The length of the stick was 20 cm ±1 cm.’ • The statement of the coverage factor and the level of confidence."
- **NPL: the uncertainty decides how many decimal places to report**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "The uncertainty in a measurement result may define how many decimal places you should report. For example, if the uncertainty in your result is in the first decimal place, then the measurement result should probably also be stated to one decimal place, e.g. 20.1 cm ± 0.2 cm."
- **NPL: the word precision is often misused for accuracy or uncertainty**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "precision a term meaning ‘fineness of discrimination’ but often misused to mean ‘accuracy’ or ‘uncertainty’. Its use should be avoided if possible."
- **UKAS LAB 12: random errors give scatter around a mean**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "5.4 Random errors arise from random statistical variations of the observations (random effects). Every time a measurement is performed under the same conditions, random effects from various sources affect the measured value. A series of measurements produces a scatter of measured values around a mean value. A number of sources may contribute to variability each time a measurement is performed, and their influence may be continually changing."
- **UKAS LAB 12: systematic errors (finite resolution, drift) do not change when you repeat**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "5.5 Systematic errors arise from imperfect knowledge of measurement processes such as finite resolution or drift in the characteristics of measuring equipment. These errors remain unchanged when a measurement is repeated under the same conditions, and their effect is to introduce a displacement between the value of the measurand and the experimentally determined mean value."
- **UKAS LAB 12 lists instrument resolution among the sources of uncertainty**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "(f) Instrument resolution or discrimination threshold, or errors in graduation of a scale"
- **UKAS LAB 12: k = 2 is about 95 %, k = 3 about 99.7 %**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "that the probability distribution can be assumed to be normal and that a value of k = 2 defines an interval having a coverage probability of approximately 95 %. For more critical applications, a value of k = 3 defines an interval having a coverage probability of approximately 99.7 %."
- **UKAS LAB 12: report the value with its expanded uncertainty at 95 %**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "9.1.3 Unless otherwise specified, the result of the measurement should be reported, together with the expanded uncertainty appropriate to the 95 % level of coverage, as in the following example: Measured value 100.10 (units) Measurement uncertainty 0.11 (units)"
- **UKAS LAB 12: if the uncertainty interval overlaps the tolerance limit you cannot state pass or fail**
  - Source: LAB 12. https://www.ukas.com/wp-content/uploads/schedule_uploads/759162/LAB-12-The-Expression-of-Uncertainty-in-Testing.pdf
  - Quote: "interval overlaps the limit, it is not possible to confirm conformity or non-conformity at the stated level of coverage. The test result and expanded uncertainty should be reported together with a statement indicating that conformity was not demonstrated."
- **Fluke: accuracy is the largest allowable error under stated conditions**
  - Source: Why Digital Multimeter Accuracy and Precision Matter | Fluke. https://www.fluke.com/en-us/learn/blog/digital-multimeters/accuracy-precision
  - Quote: "Accuracy refers to the largest allowable error that occurs under specific operating conditions. It is expressed as a percentage and indicates how close the measurement displayed is to the actual (standard) value of the signal measured."
- **Fluke: a 100.0 V reading at plus or minus 2 percent, and at (2% + 2 counts)**
  - Source: Why Digital Multimeter Accuracy and Precision Matter | Fluke. https://www.fluke.com/en-us/learn/blog/digital-multimeters/accuracy-precision
  - Quote: "A reading of 100.0 V on a digital multimeter with an accuracy of ±2% can range from 98.0 V to 102.0 V. This may be fine for some applications, but unacceptable for more sensitive electronic equipment. Accuracy may also include a specified amount of digits (counts) added to the basic accuracy rating. For example, an accuracy of ±(2%+2) means that a reading of 100.0 V on the multimeter can be from 97.8 V to 102.2 V."
- **Fluke: resolution is the smallest increment the tool can show**
  - Source: Why Digital Multimeter Accuracy and Precision Matter | Fluke. https://www.fluke.com/en-us/learn/blog/digital-multimeters/accuracy-precision
  - Quote: "Resolution is the smallest increment a tool can detect and display. For a nonelectrical example, consider two rulers. One marked with 1/16-inch hatch marks offers greater resolution than one marked with quarter-inch hatch marks."
- **Fluke 1660 manual: accuracy is stated as plus or minus (percent of reading plus digit counts)**
  - Source: 1662/1663/1664 FC UM R3 ENG. https://media.fluke.com/75807436-7228-4144-8190-b309010baaca_original%20file.pdf
  - Quote: "The accuracy specification is defined as ±(% reading +digit counts) at 23 °C ±5 °C, ≤80 % RH."
- **Fluke 1660 manual: operating uncertainty per EN 61557 counts every influence factor**
  - Source: 1662/1663/1664 FC UM R3 ENG. https://media.fluke.com/75807436-7228-4144-8190-b309010baaca_original%20file.pdf
  - Quote: "The Operating Uncertainty shows the maximum possible uncertainty when all influence factors E1-E10 are counted."
- **Fluke 1664 FC: RCD trip current measurement accuracy plus or minus 5 percent**
  - Source: Fluke 1664 FC Installation Multifunction Tester | Fluke. https://www.fluke.com/en-us/product/electrical-testing/installation-testers/fluke-1664-fc
  - Quote: "RCD/FI-Tripping Current Measurement/Ramp Test (IΔN) ... Measurement accuracy | ±5%"

My reading, and a check on the numbers: Fluke's example works. Two percent of 100.0 V is 2.0 V and two counts at 0.1 V
is 0.2 V, so plus or minus 2.2 V gives 97.8 V to 102.2 V. The instrument manual for an installation tester states its
accuracy the same way, as percent of reading plus digits, and adds an "operating uncertainty" that counts every influence
factor. The UKAS LAB 12 rule in its section 10 (an interval that overlaps a limit cannot show a pass or a fail) is the most useful
single idea for an inspector who is told to compare a reading with a limit.

### 3.5 Reliability: failure rate, MTBF, the bathtub curve and R = e^(-lambda t)
These are the public primers I could read. NIST (US standards body) and HELM are the originals. Bel (a component maker)
is a trade page. The Kohler UPS paper is a maker's paper: its failure-rate figures are the maker's, so they are
**SECONDARY** as numbers and the course should never present them as facts about any UPS (they can be labelled
example figures). NREL (a US government laboratory) wrote the standby diesel generator report. NFPA is a US fire code
body's blog.

- **NIST handbook: only the exponential distribution has a constant failure rate; MTTF = 1/lambda**
  - Source: 8.1.6.1. Exponential. https://www.itl.nist.gov/div898/handbook/apr/section1/apr161.htm
  - Quote: "The exponential distribution is the only distribution to have a constant failure rate. Also, another name for the exponential mean is the Mean Time To Fail or MTTF"
- **NIST handbook: early failure, intrinsic (stable) failure and wearout periods**
  - Source: 8.1.2.4. "Bathtub" curve. https://www.itl.nist.gov/div898/handbook/apr/section1/apr124.htm
  - Quote: "The initial region that begins at time zero when a customer first begins to use the product is characterized by a high but rapidly decreasing failure rate. This region is known as the Early Failure Period (also referred to as Infant Mortality Period , from the actuarial origins of the first bathtub curve plots). This decreasing failure rate typically lasts several weeks to a few months. Next, the failure rate levels off and remains roughly constant for (hopefully) the majority of the useful life of the product. This long period of a level failure rate is known as the Intrinsic Failure Period (also called the Stable Failure Period ) and the constant failure rate level is called the Intrinsic Failure Rate . Note that most systems spend most of their lifetimes operating in this flat portion of the bathtub curve Finally, if units from the population remain in use long enough, the failure rate begins to increase as materials wear out and degradation failures occur at an ever increasing rate. This is the Wearout Failure Period"
- **HELM 46: the hazard rate graph is the bathtub graph**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "A graph of H ( t ) often shows a high initial failure rate followed by a period of relative reliability followed by a period of increasingly high failure rates as a system or component ages. A typical graph (sometimes called a bathtub graph)"
- **HELM 46: the exponential model, random failures only, good as new**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "This is just the probability that failure occurs in the interval (0 , t ) and implies that ageing has no effect on failure. This is sometimes referred to as the ‘good as new syndrome.’ It is worth noting that in the modelling of many complex systems it is assumed that only random component failures are important. This enables us to assume the use of the exponential distribution since initial failures are removed by a ‘running-in’ process and the time to ultimate failure is usually long."
- **Bel: reliability as probability of working for a stated time, R(t) = e^(-lambda t), in the flat part of the bathtub**
  - Source: A Closer Look at MTBF, Reliability, and Life Expectancy | Bel. https://www.belfuse.com/resource-library/blog/mtbf-reliability-and-life-expectancy
  - Quote: "Reliability is defined as the probability that an individual unit of the product, operating under specified conditions, will work correctly for a specified length of time. It can be expressed statistically as: R(t) = e -λt Where λ is the intrinsic failure rate, excluding early failures (infant mortality) and wear-out failures (end of life). Hence reliability is the probability of failure in the flat central part of the familiar bathtub curve shown below."
- **Bel: the MTBF is not the expected life; only 36.7 percent of units reach the MTBF**
  - Source: A Closer Look at MTBF, Reliability, and Life Expectancy | Bel. https://www.belfuse.com/resource-library/blog/mtbf-reliability-and-life-expectancy
  - Quote: "Consider a component that has an intrinsic failure rate (λ) of 10 -6 failures/hour. Although the MTBF is 1 million hours, the R(t) = e -λt curve, shown in the graph below, tells us that only 36.7% of units are statistically likely to operate for this long. 60.6% can be expected to operate for 500,000 hours, and further we can expect 90.5% to last for a lifetime of 100,000 hours."
- **HELM 46: worked exponential example, a bulb with a 8000 hour mean**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "The lifetime of a modern low-wattage electronic light bulb is known to be expo- nentially distributed with a mean of 8000 hours. Find the proportion of bulbs that may be expected to fail before 7000 hours use."
- **HELM 46: series fails if any fails; parallel works while any works; independent components**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "With a series design, the system will fail if any component fails. With a parallel design, the system will work as long as any component works. Assuming that the components are independent, we can express the reliability of the series design as R Series = R 1 × R 2 × · · · × R n simply by multiplying the probabilities. Since each reliability value is less than one, we may conclude that a series design is less reliable than its least reliable component."
- **HELM 46: the parallel formula from F = 1 - R**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "Observing that F i = 1 − R i , where F i represents the failure of the i th component and R i represents the reliability of the i th component we may write F System = F 1 F 2 F 3 → R System = 1 − F 1 F 2 F 3 = 1 − (1 − R 1)(1 − R 2)(1 − R 3)"
- **HELM 46: engineers include redundant components in parallel**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "Engineers will sometimes include ‘redundant’components in parallel to improve reliability."
- **HELM 46: two components that both must work, and the independence assumption**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "A particular electronic device will only function correctly if two essential compo- nents both function correctly. The lifetime of the first component is known to be exponentially distributed with a mean of 6000 hours and the lifetime of the second component is known to be exponentially distributed with a mean of 7000 hours. Find the proportion of devices that may be expected to fail before 8000 hours use. State clearly any assumptions you make."
- **HELM 46: the assumption is that components operate independently**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "The assumption made is that the components operate independently."
- **HELM 46: the series answer, just under 92 percent fail before 8000 hours**
  - Source: 46 46. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook46/46_1_reliability.pdf
  - Quote: "and we expect just under 92% of the devices to fail before 8000 hours use."
- **NREL: MTBF cannot give the runtime failure probability of a standby generator that sits idle**
  - Source: Emergency Diesel Generator Reliability and Installation Energy Security. https://www.nrel.gov/docs/fy20osti/76553.pdf
  - Quote: "Typically, the mean time between failure (MTBF) is used to define the reliability of repairable components. But because EDGs sit idle most of their lifetimes, MTBF cannot be used to estimate the probability of an EDG’s runtime failure."
- **NREL: a generator in its useful life has a constant running failure rate, so R(t) = e^(-lambda t)**
  - Source: Emergency Diesel Generator Reliability and Installation Energy Security. https://www.nrel.gov/docs/fy20osti/76553.pdf
  - Quote: "In terms of the reliability literature’s “Bathtub Model” (Figure 3), the generator is in its useful life period. During this period, we assume that the failure rate while running, λ, is constant. If one considers only run time failures, R(t) is:"
- **NREL: a standby generator can fail by being unavailable, failing to start, or failing to run**
  - Source: Emergency Diesel Generator Reliability and Installation Energy Security. https://www.nrel.gov/docs/fy20osti/76553.pdf
  - Quote: "A generator can fail due to being unavailable at the start of an outage, being available but failing to start, and starting but subsequently failing to run."
- **NREL: two generators survive if at least one survives (the OR rule)**
  - Source: Emergency Diesel Generator Reliability and Installation Energy Security. https://www.nrel.gov/docs/fy20osti/76553.pdf
  - Quote: "If two generators are connected to a building, then the system survives if at least one of the generators survives."
- **Kohler UPS paper: a UPS as rectifier, battery and inverter in series, failure rates add, MTBF 20 000 hours**
  - Source: White paper: Reliability of parallel redundant White paper: Reliability of parallel redundant UPS UPS. https://www.ups.rehlko.co.uk/wp-content/uploads/2019/12/Kohler-Uninterruptible-Power-Reliability-of-parallel-redundant-UPS.pdf
  - Quote: "MTBFUPS = 1/λUPS λUPS = λRECT + λBATT + λINV Figures from statistical failure analysis show λRECT = 20 per million hours, λBATT = 10 per million hours, λINV = 20 per million hours. If these figures are applied in the equation, MTBFUPS for a UPS system without static bypass switch will be 20 000 hours."
- **Kohler UPS paper: a parallel redundant UPS depends on its single point of failure, the parallel bus**
  - Source: White paper: Reliability of parallel redundant White paper: Reliability of parallel redundant UPS UPS. https://www.ups.rehlko.co.uk/wp-content/uploads/2019/12/Kohler-Uninterruptible-Power-Reliability-of-parallel-redundant-UPS.pdf
  - Quote: "The reliability of an (n+1) parallel redundant system depends largely on the failure rate of the parallel bus, which is the only single point of failure."
- **Kohler UPS paper: availability depends on MTBF and time to repair**
  - Source: White paper: Reliability of parallel redundant White paper: Reliability of parallel redundant UPS UPS. https://www.ups.rehlko.co.uk/wp-content/uploads/2019/12/Kohler-Uninterruptible-Power-Reliability-of-parallel-redundant-UPS.pdf
  - Quote: "These cases show how important MTTR is for reaching high availabilities."
- **NFPA: battery failure is the most common cause of standby generator failure; exercise monthly**
  - Source: An Overview of NFPA 110. https://www.nfpa.org/news-blogs-and-articles/blogs/2023/01/23/an-overview-of-nfpa-110
  - Quote: "if the batteries in a diesel generator fail, then the entire system will not operate; in fact, battery failure is the most common cause of generator failure."
- **NFPA 110: inspected weekly, exercised monthly, tested every 36 months**
  - Source: An Overview of NFPA 110. https://www.nfpa.org/news-blogs-and-articles/blogs/2023/01/23/an-overview-of-nfpa-110
  - Quote: "In general, the emergency power supply system needs to be inspected weekly, exercised monthly, and tested at least once every 36 months."

My reading, and two checks that matter for the brief:

- **HELM's worked Example 1 has an arithmetic slip.** It writes F(7000) = 1 - e^(-7000/8000) = 1 - e^(-0.675) = 0.4908
  and "about 49%". But 7000 / 8000 is 0.875, not 0.675. With 0.875, F(7000) = 1 - e^(-0.875) = 0.583, so about 58% of the
  bulbs fail before 7000 hours. The brief should not reuse HELM's 49%. (My arithmetic, not a quote.) HELM's second
  worked example checks out: R1(8000) = e^(-8000/6000) = 0.2636 and R2(8000) = e^(-8000/7000) = 0.3189, so both work
  with probability 0.0841 and about 92% fail before 8000 hours.
- **Bel's numbers are consistent.** With lambda = 10^-6 per hour, R at the MTBF is e^-1 = 0.368, at half the MTBF it is
  e^-0.5 = 0.607, and at a tenth it is e^-0.1 = 0.905, which are the 36.7%, 60.6% and 90.5% on the page.
- **Series and parallel in two lines:** series multiplies the reliabilities (HELM, "simply by multiplying the
  probabilities"). Parallel multiplies the failure probabilities and subtracts from 1. NREL's two-generator line says the same in words: the system survives if at least one generator survives, which is
  1 - (1 - R1)(1 - R2). Both are the AND and OR rules, taught inline.
- **Independence is an assumption, and HELM states it again and again** ("Assuming that the components are independent",
  "the components operate independently"). The Kohler paper shows a place where it fails to hold: in a parallel
  redundant UPS the parallel bus is the one single point of failure. NREL shows a second limit: a standby generator can
  be unavailable, fail to start or fail to run, so R(t) alone is not the whole answer.

---

## 4. The scope to cover, and what research says about each part

One short practical course, five parts in this order. Each part has what the sources say, then my reading. Findings
already quoted in section 3 are pointed to, not repeated.

### 4.1 Part 1: the middle and the spread of a set of readings
What the sources say: HELM 36 (above, 2.4) is the model for part 1. It explains why engineers need statistics, defines
mean, median and standard deviation, and warns that the mean and standard deviation are pulled by an extreme value.

- **HELM 36: engineers experiment, analyse data and must reach defensible conclusions**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "Engineers have to experiment, analyse data and reach defensible conclusions about the outcomes of their experiments to determine how products behave when tested under real conditions."
- **HELM 36: the mean and standard deviation are sensitive to extreme values**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "Traditionally, the location and spread of a distribution are measured by calculating its mean and standard deviation. The problem with these statistics is that are sensitive to the influence of extreme values."
- **HELM 36: one value of 60 instead of 6 drags the mean above 92 percent of the data**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "The effects of changes in extreme values are easily illustrated by looking at what happens if we take the last number to be 60 instead of 6. This destroys the symmetry of the distribution and gives mean ¯ x = 8 and standard deviation s n − 1 = 16 . 42. Clearly, these values do not describe the distribution very well at all, a mean which is higher than 92% of the members of the distribution can hardly be described as representative!"
- **HELM 36: when the data are lopsided the median and interquartile range say more than mean and standard deviation**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "Here the median and inter-quartile range are preferable to the mean and standard deviation - they represent the bulk of the data much more realistically."
- **HELM 36: do not rely on summary numbers alone; shape matters**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "You should not rely on summary statistics such as the mean and standard deviation or median and mid-spread alone to represent a data set. Remember that if a distribution has outliers, gaps, skewness or multiple peaks, then shape is probably more important than location and spread."
- **HELM 36: how to find the standard deviation: subtract the mean, square, average, root**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "from every raw data value, subtract the mean, square the results, average them and then take the square root."
- **HELM 36: separate symbols for a population (mu, sigma) and for a sample (x-bar, s)**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "The symbols µ and σ are used to represent the mean and standard deviation of a population and ¯ x and s are used to represent the mean and standard deviation of a sample taken from a population."
- **Bitesize National 5: there are two formulae for standard deviation, and it names the most common one (n - 1 in its text)**
  - Source: Standard deviation - Comparing data sets using statistics - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z94297h/revision/4
  - Quote: "There are two formulae for calculating the standard deviation, however the most commonly used formula to calculate the standard deviation is:"
- **NPL: on a calculator use the s (sigma n minus one) key for the estimated standard deviation of readings**
  - Source: Good Practice Guide No. 11. https://eprintspublications.npl.co.uk/1568/1/MGPG11.pdf
  - Quote: "(‘sigma n minus one’) key (sometimes marked ‘ s’ ) gives you the estimated standard deviation of the ‘population’ based on your limited sample."

My reading, and what to watch:
- **Dividing by n or by n - 1 is a convention and the sources differ.** HELM's own recipe is to "average" the squared
  deviations (divide by n) and then separates population from sample symbols; Bitesize says two formulae exist and
  gives n - 1 as the most commonly used (the page's formula uses n - 1); NPL says use the "sigma n minus one" key on a
  calculator for readings. For a set of readings from an instrument, n - 1 is the usual choice. Say so once and give the reason (a short
  list of readings is a small sample of all the readings you could take). The brief should pick one and say where the
  other is used.
- **HELM's "60 instead of 6" example is not reproducible from the extract.** It says the mean becomes 8 and s is 16.42,
  but those do not follow from the six numbers the extract shows (1 to 5 and 60 give a mean of 12.5), so the data set
  must be longer than the extract. The brief should build its own readings, labelled as example figures, rather than copy
  these.
- The "average alone misleads" lesson is best built the way Bitesize does it (2.2) and delMas and Liu suggest (6.1): two
  sets with the same mean, median and range but a different spread.
- Real-looking readings to use (from the task, not from a source): insulation resistance, earth fault loop impedance and
  RCD trip times from Dan's own qualifications.

### 4.2 Part 2: how far to trust a reading
Sources: NPL, UKAS and Fluke in 3.4. The extra lines here are about tolerance and the words that get muddled.

- **HELM 39: production aims at a mean, and a tolerance is set on deviations because of random errors**
  - Source: 39 39. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/39_1.pdf
  - Quote: "Usually, a mean is aimed for but due to random errors in the production process a tolerance is set on deviations from the mean. For example if we produce piston rings which have a target mean internal diameter of 45 mm then realistically we expect the diameter to deviate only slightly from this value. The deviations from the mean value are often modelled very well by the normal distribution"
- **NUSTEM (ASE definitions): precision is used for smallest scale division; a better word is resolution; accuracy and uncertainty defined**
  - Source: Measuring g via Free Fall - NUSTEM. https://nustem.uk/activity/measuring-g/
  - Quote: "A better term might be ‘resolution’. Other ASE definitions: > Accuracy: a result is accurate if it is close to the true value. > > Uncertainty: the interval within which the true value can be expected to lie."

My reading: the chain for part 2 is resolution (the step on the display) then accuracy (the guaranteed band, percent of
reading plus counts) then repeat readings (random scatter, which averaging shrinks) then systematic error (an offset
that repeating does not shrink) then stating the result with its uncertainty and checking it against a limit. NPL and
UKAS give that chain in their own words; Fluke gives the figures. "Precision" and "accuracy" are the words to be careful
with (NPL says precision is "often misused"; NUSTEM, a teaching resource quoting ASE definitions, says a better word for
the smallest step is resolution).

### 4.3 Part 3: the normal curve, the 68-95-99.7 rule, tolerance bands and honest outliers
- **HELM 39: a strain gauge of 100 ohms, standard deviation 0.2 ohm, specification 100 plus or minus 0.5 ohm**
  - Source: 39 39. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/39_1.pdf
  - Quote: "The resistance of a strain gauge is normally distributed with a mean of 100 ohms and a standard deviation of 0.2 ohms. To meet the specification, the resistance must be within the range 100 ± 0 . 5 ohms. (a) What percentage of gauges are unacceptable?"
- **HELM 46.2: natural tolerance limits of 3 sigma either side of the mean**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "Figure 1 below shows two normal distributions each with so-called natural tolerance limits of 3 σ either side of the mean."
- **HELM 46.2: a worked packing-weight example puts control limits at the mean plus and minus 3 sigma (205.8 and 194.8 g)**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "two further horizontal lines representing the upper and lower control limits. The values of these limits are given by ¯ x ± 3 σ and are calculated as 205.8 and 194.8"
- **SECONDARY (LibreTexts): the empirical rule, 68 / 95 / 99.7 percent**
  - Source: 2.4: The Normal Distribution - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Applied_Mathematics/Book%3A_College_Mathematics_for_Everyday_Life_(Inigo_et_al)/02%3A_Statistics_-_Part_2/2.04%3A_The_Normal_Distribution
  - Quote: "Approximately 68% of the data is within one standard deviation of the mean. Approximately 95% of the data is within two standard deviations of the mean. Approximately 99.7% of the data is within three standard deviations of the mean."
- **HELM 36: treat a value beyond 3.3 standard deviations as an outlier worth investigating**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "Knowing that some 99.7% of a normal population lies within 3 standard deviations of the mean, we could treat any value further than say 3.3 standard deviations from the mean as on outlier. This choice essentially implies that a value has less than 1 in a 1000 of chance of occurring naturally outside the range defined by 3.3 standard deviations from the mean."
- **HELM 36: never automatically reject an outlier; ask why it happened**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "These criteria should be used with some caution and never automatically used simply to reject an outlier. You should always ask why such a value occurred in the first place and work to answer such a question sensibly before considering rejection."
- **HELM 36: outliers may be bad data or point to something worth investigating**
  - Source: 36 36. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2036%20Descriptive%20Statistics.pdf
  - Quote: "Outliers can be extremely important since they may be (for example) erroneous data or they may point the way to further investigations of a data set."
- **NIST handbook: we typically do not want to simply delete an outlier**
  - Source: 1.3.5.17. Detection of Outliers. https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm
  - Quote: "In some cases, it may not be possible to determine if an outlying point is bad data. Outliers may be due to random variation or may indicate so mething scientifically interesting. In any event, we typically do not want to simply delete the outlying observation."
- **NIST glossary: deleting an outlier is easiest to justify when an unusual cause is identified**
  - Source: itl.nist.gov. https://www.itl.nist.gov/div898/handbook/glossary.htm
  - Quote: "The deletion of a particular outlier from a data analysis is easiest to justify when such an usual cause has been identified."

My reading, and what to watch:
- The 68-95-99.7 rule is quoted here from LibreTexts (**SECONDARY**: it republishes college text). The same numbers
  appear as k = 1, 2 and 3 in UKAS (3.4: about 95 % for k = 2 and about 99.7 % for k = 3) and as "99.7% ... within 3
  standard deviations" in HELM 36 above. HELM 46.2 and NIST both give the 3 sigma tail as about 0.3%. Use UKAS and HELM
  as the cited ones.
- **The outlier rule is a convention, and the numbers differ.** HELM 36 uses 3.3 standard deviations (less than 1 in
  1000), HELM 46.2 and the control chart rules use 3 (about 0.3%), and HELM's second criterion uses fences of 1.5 and 3
  interquartile ranges. The agreed point in every source is not the number but the habit: investigate first, and delete
  only when there is a cause.
- A normal curve is a model, not a fact about the readings. HELM says the deviations from the target in production "are
  often modelled very well" by it (4.2); the course should say "often" too and not claim every set of readings is
  normal.
- **Dan's own case:** the strain gauge example (100 ohms, standard deviation 0.2 ohm, specification 100 plus or minus
  0.5 ohm) is a ready-made tolerance-band question. Under the normal model the band is 2.5 standard deviations either
  side, so about 1.2% fall outside (HELM gives 1.24%). I computed the 2.5; the 1.24% is HELM's.

### 4.4 Part 4: trends over time, a line of best fit, drift against noise, correlation is not cause
Insulation resistance trending is the trade's own example, so the ideas are anchored there. The stats side is
the run chart and control chart rules.

- **Megger guide: what matters is the trend over time, because single readings vary**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "insulation resistance readings should be considered relative. They can be quite different for one motor or machine tested three days in a row, yet not mean bad insulation. What really matters is the trend in readings over a time period, showing lessening resistance and warning of coming problems."
- **Megger guide: a persistent downward trend is fair warning even above the minimum**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "Any persistent downward trend is usually fair warning of trouble ahead, even though the readings may be higher than the suggested minimum safe values."
- **Megger guide: test the same way each time and at the same (or corrected) temperature**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "you should make these periodic tests in the same way each time. That is, with the same test connections and with the same test voltage applied for the same length of time. Also you should make tests at about the same temperature, or correct them to the same temperature."
- **Megger guide: rule of thumb of halving resistance for each 10 degrees C rise**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "For every 10°C increase in temperature, halve the resistance; or, for every 10°C decrease, double the resistance."
- **Megger guide: a mill motor record, as measured against corrected to 20 degrees C, shows the trend**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "Curve A shows test values as measured; Curve B shows same values corrected to 20°C (see page 22), giving a definite downward trend toward an unsafe condition."
- **Megger guide: stable low readings may be fine; the trend of the curve may matter more than the values**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "Conversely, allowances must be made for equipment in service showing periodic test values lower than the suggested minimum safe values, so long as the values remain stable or consistent. In such cases, after due consideration has been given to temperature and humidity conditions at the time of test, there may be no need for concern."
- **Ontario Health run chart tool: common cause variation is inherent in the system, special cause is not**
  - Source: Measurement – Interpreting Run Charts. https://www.ontariohealth.ca/content/dam/ontariohealth/documents/qi-tools-and-resources/run-charts-tool.pdf
  - Quote: "Common cause is the term used for variation that is inherent in the system."
- **Ontario Health run chart tool: its special cause rules (eight or more on one side of the mean, six increasing or decreasing)**
  - Source: Measurement – Interpreting Run Charts. https://www.ontariohealth.ca/content/dam/ontariohealth/documents/qi-tools-and-resources/run-charts-tool.pdf
  - Quote: "The rules for determining special cause are as follows: • A single point outside the control limits • 8 or more points in a row on one side of the mean • 6 consecutive points increasing or decreasing"
- **Ontario Health run chart tool: a shift is 6 or more points on one side of the median**
  - Source: Measurement – Interpreting Run Charts. https://www.ontariohealth.ca/content/dam/ontariohealth/documents/qi-tools-and-resources/run-charts-tool.pdf
  - Quote: "A shift (signalling change) is 6 or more consecutive points, either all above or all below the median."
- **Weitzman Institute run chart guide: a trend is 7 or more points (6 when there are fewer than 21), so the count is a convention**
  - Source: RUN AND CONTROL CHARTS IN A NUTSHELL W ?. https://education.weitzmaninstitute.org/sites/default/files/course/2025-02/Run%20and%20Control%20Charts.pdf
  - Quote: "Trends: 7 or more data points in a row that increase or decrease (or 6 in a row if there are fewer than 21 data points; two successive points of the same value count as one)."
- **NIST handbook: trend rule of 6 in a row**
  - Source: 6.3.2. What are Variables Control Charts?. https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm
  - Quote: "Trend Rules: |6 in a row trending up or down. 14 in a row alternating up and down"
- **Minitab: Test 3 for a trend is six points in a row, all increasing or all decreasing**
  - Source: Using tests for special causes in control charts - Minitab. https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/control-charts/supporting-topics/basics/using-tests-for-special-causes
  - Quote: "Test 3: Six points in a row, all increasing or all decreasing"
- **Minitab: Test 2 for a shift is nine points in a row on the same side of the centre line**
  - Source: Using tests for special causes in control charts - Minitab. https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/control-charts/supporting-topics/basics/using-tests-for-special-causes
  - Quote: "Test 2: Nine points in a row on the same side of the center line"
- **NIST handbook: the WECO rules are based on probability; 3 sigma is a 0.3 percent event**
  - Source: 6. Process or Product Monitoring and Control. https://www.itl.nist.gov/div898/handbook/toolaids/pff/pmc.pdf
  - Quote: "The WECO rules are based on probability. We know that, for a normal distribution, the probability of encountering a point outside ± 3 is 0.3%. This is a rare event."
- **HELM 46.2: a pattern in the points shows a special cause that needs investigating; the eight tests**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "Remember that a process can only be considered to be in control if the occurrence of points above and below the chart mean is random and within the control limits. The occurrence of a pattern indicates a special cause for the variation, one that needs to be investigated."
- **HELM 46.2: the eight tests include eight in a row on one side of the centre line, six in a row increasing or decreasing, and fourteen alternating**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "Eight points in a row on the same side of the centre line. ... Six points in a row, all increasing or all decreasing. • Fourteen points in a row, alternating up and down."
- **HELM 46.2: the first four tests are the Western Electric Rules**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "The first four of these tests are sometimes referred as the Western Electric Rules. They were first published in the Western Electric Handbook issued to employees in 1956."
- **HELM 46.2: a sample mean outside the 3 sigma limits has about a 0.3 percent chance when the process is in control**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "the probability of a sample mean falling outside the region defined by the 3 σ control limits is about 0.3%."
- **HELM 43: a fitted line passes through the mean of the points, a useful check**
  - Source: 43 43. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook43/43_1_rgrssn.pdf
  - Quote: "This shows that the mean of the array always lies on the regression line. Since the mean is easily calculated, the result forms a useful check for a plotted regression line."
- **HELM 43: a poor fit may mean the relationship is not linear**
  - Source: 43 43. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook43/43_1_rgrssn.pdf
  - Quote: "Poor fit may suggest, for example, that the relationship is not in fact linear and that a fundamental assumption made has been violated."
- **Australian Bureau of Statistics: a correlation does not mean one variable causes the other**
  - Source: Correlation and causation | Australian Bureau of Statistics. https://www.abs.gov.au/statistics/understanding-statistics/statistical-terms-and-concepts/correlation-and-causation
  - Quote: "A correlation between variables, however, does not automatically mean that the change in one variable is the cause of the change in the values of the other variable."

My reading, and what to watch:
- **The number of points that counts as a drift, or as a shift, is a convention and the sources disagree.** For a
  trend (points steadily up or down): NIST's Western Electric rule is 6 in a row, HELM 46.2's list says 6, Minitab's
  Test 3 says 6, Ontario Health says 6; the Weitzman run chart guide says 7 or more (or 6 if there are fewer than 21
  points) and counts two equal points as one. For a shift (a run on one side of the middle): Ontario Health says 6 or
  more points on one side of the median in a run chart, and 8 or more on one side of the mean among its control chart
  rules; HELM 46.2 says 8; Minitab's Test 2 says 9. The course should teach the reason (a run of 6 going the same way
  is rare by chance alone) and treat the number as a choice, not as a law.
- **Compare like with like.** Megger's rules (same test connections, same voltage, same time, same or corrected
  temperature) are what makes a trend readable. Their rule of thumb is to halve the resistance for each 10 degrees C of
  rise, and their example corrects a motor's readings to 20 degrees C to show the downward trend. A "drift" that
  is really a temperature swing is a likely false alarm.
- The line of best fit is the same line Dan laid by eye in Straight-line graphs (lesson 6) and The coordinate plane
  (lesson 4); HELM 43 and Khan say eyeballing is where it starts and least squares is where it goes. HELM adds two checks
  worth teaching: the line passes through the mean of the points, and a poor fit may mean the relationship is not linear.
  The slope of the line is the drift per unit of time.
- "Correlation is not cause" is quoted from the Australian Bureau of Statistics and the SQA Higher line in 2.3. The
  misconception sources in 6.3 warn about teaching the slogan too hard.
- Stay inside the data: SQA Higher says predictions must stay within the range of the data used to make the model. For a
  maintenance engineer this is "do not run the line out to zero ohms and call it a date".
- Control charts are bigger than this course needs. The reasons to keep the idea are that HELM 46.2, NIST and Pearson 4037
  all use it, and that a 3 sigma limit built from earlier readings is the honest answer to "is this reading unusual".

### 4.5 Part 5: reliability, failure rate, MTBF, the bathtub curve, R = e^(-lambda t), series and parallel
The sources are in 3.5. The extra lines for the AND and OR rules taught inline are SQA Higher's "basic probabilities of independent events ...
AND and OR conditions" (2.3) and Khan's "Multiplication rule for independent events" lesson (2.1). The Brilliant levels in
1.4 show the same rules placed late (levels 6, 7 and 9) after counting and expected value. Dan's course cannot afford that route, so the rules
are taught on reliabilities directly, as HELM does.

My reading, and what to watch:
- **R = e^(-lambda t) uses the curve Dan already has.** Exponentials and logarithms lesson 3 (the time constant) has the
  0.368 left after one time constant. R(t) at t = 1 / lambda is the same 0.368, and the MTBF is the same number as the time
  constant (1 / lambda). The brief should say so once and not re-teach the decay curve.
- The model holds only in the flat middle of the bathtub (NIST, Bel, NREL, HELM). Early failures and wear-out need other
  models (Weibull in HELM 46.1 section 3), which are outside this course.
- **MTBF is not a life.** Bel's example (only 36.7% of units reach the MTBF) is the one to build on. NREL adds a second
  limit: for equipment that sits idle, like a standby generator, MTBF does not give the chance that it runs when needed.
- Public equipment to use, with example figures labelled: a UPS (rectifier, battery, inverter in series; Kohler), a
  standby diesel generator (NREL, NFPA), a battery bank and a pump. Nothing beyond the public submarine outline in CLAUDE.md
  is used or needed.

---

## 5. Prerequisites: what this topic leans on

What the sources assume:

- **Brilliant Probability in Data lists Fractions as its only prerequisite**
  - Source: Practice Probability in Data | Brilliant. https://brilliant.org/courses/probability-fundamentals/understanding-probability?lesson=mutually-exclusive-probability
  - Quote: "Use probability to represent and interpret data and events effectively. Decide how to work with dependent and independent events, apply Bayes' Rule to update probability estimates, and run simulations to better estimate outcomes. Prerequisites Fractions"
- **HELM 39 (normal distribution) assumes basic probability and continuous random variables, which this course teaches inline in outline**
  - Source: 39 39. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/39_1.pdf
  - Quote: "be familiar with the basic properties of probability • be familiar with continuous random variables"
- **HELM 43 (regression) assumes descriptive statistics first**
  - Source: 43 43. https://sse.tees.ac.uk/helm/pages/workbooks_1_50_jan2008/workbook43/43_1_rgrssn.pdf
  - Quote: "have knowledge of Descriptive Statistics ( 36)"
- **HELM 46.1 Reliability assumes probability and continuous distributions (taught inline here in outline only)**
  - Source: Helm Workbook 46 Reliability And Quality Control. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2046%20Reliability%20and%20Quality%20Control.pdf
  - Quote: "Before starting this Section you should . . . • be familiar with the results and concepts met in the study of probability • understand and be able to use continuous probability distributions"

What Dan already has from his built courses, with the course that gives it (my reading of the course briefs in
`docs/courses`; not new quotes):
- Percentages, Fractions and Proportional reasoning: percent of reading, a percentage tolerance, a probability as a
  fraction of one. Brilliant's Exploring Data Visually asks for "comfortable with calculating percentages" (1.2).
- Negative numbers: a deviation from the mean is above or below it.
- Powers and roots: squaring and the square root, which is all the standard deviation needs.
- AC circuits (lesson 2, rms) and Calculus fundamentals (lesson 10): rms as the root of the mean of the squares. The
  standard deviation is the same recipe with deviations in place of voltages. That gives a link to use and not a lesson
  to repeat.
- The coordinate plane (lesson 4, a best-fit line laid by eye; lesson 5, reading inside and beyond the data) and
  Straight-line graphs (lesson 6, laying a line through scattered readings with a count above and below): the line, its
  slope, interpolation and extrapolation. The Straight-line graphs brief names least squares and regression as "the HN
  follow-up", so a fitted line is where this course starts.
- Functions and their graphs, and Exponentials and logarithms (lesson 3, the time constant): the decay curve behind
  R = e^(-lambda t). Differential equations (lesson 2, decay) covers the same decay law if the brief wants one link.
- Design and verification, HV Subsea Cable Testing and Dan's inspection and testing qualifications (insulation
  resistance, earth fault loop impedance, RCD trip times, PAT records): the readings, the limits and the words
  "test", "limit" and "record". A line in the repo's Inspection and testing brief says his own slides have an
  average-and-deviation rule for the earth electrode test (their "E1" rule, with a x 1.2 and a 5% ceiling). I did not see
  the guidance note's wording, so it is **UNCONFIRMED**; it is a good example if it can be confirmed, because it is an
  average and a deviation in a trade test.

What must be taught inline (not in a built course): the idea of a set of readings as a spread, not a number; mean and
median; range; standard deviation (the root of the mean of the squared deviations); the normal curve and the standard
deviation as a ruler (the z-score); accuracy, resolution, random and systematic error and an uncertainty with its level
of confidence; the fitted line on readings over time and what slope means as a drift; probability as a number between 0
and 1, AND for independent events (multiply), OR (one minus the product of the failure chances) and NOT; the failure
rate, the MTBF and the survival probability.

What is left out: hypothesis tests and the Merit-level line of Pearson 4002; binomial and Poisson distributions; sampling
distributions and confidence intervals for a mean (the uncertainty of a mean is stated with a coverage factor, taken
from NPL, not derived); the Weibull distribution; Bayesian reasoning; regression beyond a fitted line (correlation
coefficient, residuals, multiple regression).

Ground deferred, and where it goes: noise, tolerance and measurement in electronic circuits (and the decibel and
signal-to-noise ideas that come with them) belong to Electronics and power electronics (Electrical shelf, next).

---

## 6. Misconceptions and learning science, with sources

### 6.1 Spread, the mean and the standard deviation
- **Cooper and Shore: students lose track of what the graph represents**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "Students’ misconceptions often stemmed from their difficulty in maintaining understanding of the data that are being represented graphically."
- **Cooper and Shore: students use the range alone as the measure of variability**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "The tendency to use the range for a measure of variability, ignoring the significance of the frequencies, is exacerbated when students view data in a histogram; that is, without seeing the raw data in list form, they tend to focus only on the numbers they see – those along the x -axis. Thus, the range of the data is easily gleaned from the horizontal axis, and then, crude and unsophisticated as it may be, used for comparison purposes as a measure of variability."
- **Cooper and Shore: 50 percent judged variability by the varying heights of bars**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "The more troubling finding is that 50% of the students judged variability by focusing on the varying heights of the bars, implying variability in frequencies, rather than data values."
- **Cooper and Shore: the add-up-and-divide mean is used without a link to the data values**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "although the "add up and divide" algorithm for finding the mean was confidently employed, it was sometimes unaccompanied by a connection to the appropriate data values."
- **Cooper and Shore: teach variability as a concept, not only as formulas**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "Instructors should explicitly discuss the concept of variability of data in general and not limit the focus to quantifying variability through common measures such as range, interquartile range, and standard deviation. Students should have a sense of what is meant by variability of data. It is important to acknowledge that the concept of variability is inherently more abstract than that of center."
- **Cooper and Shore: start from a flat distribution and show different spreads with the same mean and median**
  - Source: Journal of Statistics Education, v16n2: Linda L. Cooper and Felice S. Shore. https://jse.amstat.org/v16n2/Cooper.html
  - Quote: "students should examine histograms of little and great variation. One possibility is to have students start with a "discrete uniform" distribution where all bars have the same height. A discussion would follow that focuses on how distributions with the same mean and median could differ in variability."
- **delMas and Liu: students move from one-dimensional to mean-centred ideas of standard deviation**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "In general, students moved from simple, one-dimensional understandings of the standard deviation that did not consider variation about the mean to more mean-centered conceptualizations that coordinated the effects of frequency (density) and deviation from the mean."
- **delMas and Liu: students judge spread by the bumpiness of a histogram**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "some students judge the variability of the distribution on the basis of variation in the heights of bars, or the perceived “bumpiness” of the graph, rather than the relative density of the data around the mean"
- **delMas and Liu: students place values far from each other, with no mention of distance from the mean**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "Some students stated that an arrangement should produce the largest possible standard deviation if the values (or the bars) are placed as far away from each other as possible. No mention was made of distance (or deviation) from the mean in these statements."
- **delMas and Liu: teaching a formula and the empirical rule does not give understanding of standard deviation**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "Most instruction on the standard deviation tends to emphasize teaching a formula, practice with performing calculations, and tying the standard deviation to the empirical rule of the normal distribution. This emphasis on calculations and procedures does not necessarily promote a conceptual understanding of standard deviation."
- **delMas and Liu: the mean as a self-adjusting fulcrum**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "Imagery that metaphorically considers the mean to behave like a self-adjusting fulcrum on a balance comes close to the necessary conception."
- **delMas and Liu: software that lets students predict, test and see feedback builds the idea**
  - Source: untitled. https://www.stat.auckland.ac.nz/~iase/serj/SERJ4(1)_delMas_Liu.pdf
  - Quote: "Such software facilitates the development of conceptual understanding by accommodating students’ current levels of understanding, providing familiar models and representations, supporting exploration by promoting the frequent generation and testing of predictions, providing clear feedback"
- **Konold and Pollatsek: data as signal and noise is the most fundamental idea in statistics**
  - Source: Data Analysis as the Search for Signals in Noisy Processes. https://srri.umass.edu/sites/srri/files/KonoldPollatsek2002/index.pdf
  - Quote: "The idea of data as a mixture of signal and noise is perhaps the most fundamental concept in statistics."
- **Konold and Pollatsek: students can compute means and medians but do not know how to apply or interpret them**
  - Source: Data Analysis as the Search for Signals in Noisy Processes. https://srri.umass.edu/sites/srri/files/KonoldPollatsek2002/index.pdf
  - Quote: "though many students know, for example, how to compute means or medians, they do not know how to apply or inter- pret them."
- **Konold and Pollatsek: a mean of repeat weighings is easy to accept as the signal because the variation belongs to the measuring**
  - Source: Data Analysis as the Search for Signals in Noisy Processes. https://srri.umass.edu/sites/srri/files/KonoldPollatsek2002/index.pdf
  - Quote: "In this case, we could easily interpret the sample average as a good approximation to a signal or a central tendency and view the variability around it as the result of random error."
- **Konold and Pollatsek: that view is much harder when you average one measurement each of many different objects**
  - Source: Data Analysis as the Search for Signals in Noisy Processes. https://srri.umass.edu/sites/srri/files/KonoldPollatsek2002/index.pdf
  - Quote: "That interpretation is much harder to hold when, rather than repeatedly measuring an attribute of a single object, we measure an attribute of many different objects, taking one measurement for each object and averaging them."
- **GAISE College Report: statistical thinking includes the omnipresence of variability**
  - Source: GAISE College Report. https://www.amstat.org/asa/files/pdfs/GAISE/2005GaiseCollege_Full.pdf
  - Quote: "Statistical thinking has been described as understanding the need for data, the importance of data production, the omnipresence of variability, and the quantification and explanation of variability"
- **GAISE College Report: use real data**
  - Source: GAISE College Report. https://www.amstat.org/asa/files/pdfs/GAISE/2005GaiseCollege_Full.pdf
  - Quote: "Recommendation 2 : Use real data."
- **SQA National 5 Mathematics 2025 course report: some answers did not show a clear understanding of standard deviation**
  - Source: National 5 Mathematics 2025 course report. https://www.sqa.org.uk/sqa/files_ccc/2025-n5-course-report-mathematics.pdf
  - Quote: "Some responses did not demonstrate a clear understanding o f the term ‘standard deviation’"

My reading, and what each means for the course:
- **Spread is read from the wrong thing.** Students judge variability from the bumpiness of the bars, or from the range
  alone (Cooper and Shore, delMas and Liu). So the picture for spread should be a row of readings on a number line (the
  values themselves, each drawn), with the mean marked and a line from each reading to the mean, so that the distance
  from the mean is visible and the bar heights are not.
- **Standard deviation taught as a formula plus the empirical rule does not give understanding** (delMas and Liu). The
  design that did work was software where students predicted, moved the bars, saw the result and tried again, with
  the mean treated as a balance point. That is a predict-play-explain interactive: drag a reading, predict what happens
  to the mean and to the spread, and check.
- **Compare sets with the same mean and median** and a different spread (Cooper and Shore; Bitesize). Start from a flat
  set.
- **The mean of repeat readings is easy to accept as the signal; the mean of a batch of different things is harder**
  (Konold and Pollatsek). Both occur in Dan's work (ten readings of one circuit against one reading each on ten circuits). Say
  which one the number is.
- GAISE (the American Statistical Association's guidelines) puts variability at the centre and recommends real data. The
  course should use real-looking readings from his trade, labelled as example figures.

### 6.2 Measurement: one reading is the answer
- **Buffler et al. (2001): first-year physics students and the point and set paradigms of measurement**
  - Source: ERIC - EJ638164 - The Development of First Year Physics Students' Ideas about Measurement in Terms of Point and Set Paradigms., International Journal of Science Education, 2001. https://eric.ed.gov/?id=EJ638164
  - Quote: "Discusses the results of a study that explored first year university students' ideas about measurement in the physics laboratory."
- **Buffler et al.: the point paradigm reasons only from individual readings**
  - Source: The development of first year physics students' ideas about measurement in terms of point and set paradigms: International Journal of Science Education: Vol 23, No 11. https://www.tandfonline.com/doi/abs/10.1080/09500690110039567
  - Quote: "At the heart of the point paradigm is that both action and reasoning are based solely on individual measurements in a data set."
- **Student reasoning study (2022): the point paradigm believes one reading can give the true value and the uncertainty can be zero**
  - Source: Full article: Investigating student reasoning about measurement uncertainty and ability to draw conclusions from measurement data in inquiry-based university physics labs. https://www.tandfonline.com/doi/full/10.1080/09500693.2022.2156824
  - Quote: "The point paradigm is characterised as a belief that a single measurement can in principle yield the true value. In contrast, the set paradigm is described as a belief that a measurement distribution is required to gain information about the true value. Students in the point paradigm tend to believe that the measurement uncertainty can in principle be zero."
- **Oak National Academy (GCSE physics): averaging repeat readings does not change the errors in the original readings**
  - Source: Measuring the speed of water waves from distance and time GCSE | KS4 | Y10 Physics Foundation AQA | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/physics-secondary-ks4-foundation-aqa/units/measuring-waves/lessons/measuring-the-speed-of-water-waves-from-distance-and-time
  - Quote: "Calculating a mean of repeat readings reduces (random) errors in measurements. Calculating a mean reduces the effect that random errors have on a final result. The random errors in the original readings are unaffected."
- **BBC Bitesize KS3: a mean of repeat readings reduces the effect of random errors**
  - Source: Observation and measurement skills - Working scientifically - KS3 Science - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zm37jsg
  - Quote: "By calculating a mean, it helps reduce the effect of random errors that may otherwise make a result inaccurate ."

My reading:
- The "point" view (one reading is the answer) against the "set" view (a series of readings needs a mean and a spread)
  is the best-documented measurement misconception (Buffler et al. 2001, a 2022 paper on the point and set paradigms in physics
  labs). Students in the point view believe the uncertainty can be zero. The course should show that the same circuit
  gives different loop impedance readings, then show the spread.
- **Averaging is oversold.** Oak National Academy lists "calculating a mean of repeat readings reduces random errors"
  as a misconception, and says the mean reduces the effect on the final result but the errors in the readings are
  unchanged. BBC Bitesize says the mean "helps reduce the effect of random errors". These agree if worded carefully.
  NPL (3.4) adds the harder half: a systematic error is not reduced by repeating at all. This is the line to make
  visible in a picture (a shifted cluster).
- "Precision", "accuracy" and "resolution" are used loosely (NPL, NUSTEM in 3.4 and 4.2). Define each once and use it the
  same way throughout.

### 6.3 Correlation and cause
- **Frontiers in Psychology (2025): students may over-learn the slogan as correlation cannot mean causation**
  - Source: Frontiers | Improving the teaching of “correlation does not equal causation” in Introductory Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1645518/full
  - Quote: "who may incorrectly interpret it to mean that “correlation cannot mean causation.”"
- **Think-aloud study: a student held that correlation does not imply causation is a universal rule**
  - Source: Think-aloud interviews: A tool for exploring student statistical reasoning. https://arxiv.org/pdf/1911.00535v3
  - Quote: "it was unclear whether all students understood when causal conclusions could actually be drawn: one student stated that "correlation does not imply causation is a universal rule"

My reading: teach "a link in the data does not show that one thing causes the other" together with how a cause is shown
(change one thing and watch). Do not teach the slogan as a ban. Maintenance data is full of shared causes
(the season moves both the temperature and the readings). Dan's example: insulation resistance falls as the machine
warms (Megger, 4.4).

### 6.4 Reliability: series, parallel and MTBF
- **OCR Cambridge Technical Engineering examiners (Jan 2024): candidates muddled the machine-working probabilities for components A and B**
  - Source: 716504 Examiners Report Mathematics For Engineering. https://www.ocr.org.uk/Images/716504-examiners-report-mathematics-for-engineering.pdf
  - Quote: "Many candidates were confused by not reading the question carefully and so used probabilities to do with the machine still working “if A was still working but B was not”. The simple answer was made rather more complicated as a result."

My reading: an engineering exam board's examiners (OCR Level 3 Cambridge Technical in Engineering, January 2024) saw
candidates using the wrong probability for a two-component machine ("A working but B not") when the question was
simpler. Series and parallel are muddled by the words "and" and "or". Drawing both diagrams and writing the failure
case and the working case side by side addresses this. For MTBF, see Bel and NREL (3.5): the misconception sources are
trade pages, not research papers. I did not find a research paper on MTBF misconceptions; the two sources are a maker's
blog and a government laboratory report (**SECONDARY** as pedagogy).

---

## 7. Where it is used for an electrician going into marine engineering

Each use below is a public source. None says how the Royal Navy or any boat does it, and nothing is claimed about
that; these are merchant, civil and class-society sources.

- **IMO ISM Code 10.3: identify critical equipment, promote its reliability, regularly test stand-by equipment**
  - Source: A 741 18. https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.741(18).pdf
  - Quote: "The Company should establish procedures in SMS to identify equipment and technical systems the sudden operational failure of which may result in hazardous situations. The SMS should provide for specific measures aimed at promoting the reliability of such equipment or systems. These measures should include the regular testing of stand-by arrangements and equipment or technical systems that are not in continuous use."
- **SKYbrary: condition monitoring measures parameters periodically or continuously to spot significant changes before failure**
  - Source: Aircraft Condition Monitoring System (ACMS) | SKYbrary Aviation Safety. https://skybrary.aero/articles/aircraft-condition-monitoring-system-acms
  - Quote: "Condition monitoring (CM) is a critical component of predictive maintenance. It is the process by which one or more parameters of a machine are either periodically measured, or continuously monitored, to identify significant changes that usually are indicative of an impending failure."
- **ABS (class society): offers a Condition Monitoring Program for machinery vibration**
  - Source: Guidance Notes On Ship Vibration. https://ww2.eagle.org/content/dam/eagle/rules-and-guides/current/conventional_ocean_service/147-guidance-notes-on-ship-vibration/147-ship-vibration-gn-sep-23.pdf
  - Quote: "ABS offers a Condition Monitoring Program for machinery vibration (7-A-14/5.1.2 of the ABS Rules for Survey After Construction (Part 7)"

Together with sections already quoted:
- **Trending insulation resistance.** MCA ETO syllabus topic 4 lists "Trending HV IR tests" and "Polarisation Index test"
  (3.3), and Megger says the trend over time is what matters (4.4).
- **Testing and measuring equipment, calibration.** MCA ETO syllabus lists "construction and operation of electrical
  testing and measuring equipment" and "the use of measuring and calibrating instruments" (3.3); UKAS, NPL and Fluke
  say what a reading's accuracy and uncertainty are (3.4).
- **Standby equipment and reliability.** The ISM Code section 10.3 above (identify equipment whose sudden failure is
  hazardous, promote its reliability, regularly test the stand-by equipment). The MCA ETO syllabus lists testing and
  maintenance of the emergency generator's auto start and of battery bank and UPS (3.3). NFPA's blog says battery
  failure is the most common cause of generator failure and that the system is exercised monthly (3.5). NREL's
  generator report is the worked reliability calculation for a standby diesel generator (3.5).
- **Statistical process control and condition monitoring.** Pearson 4037 (3.1). The class society ABS lists a
  condition monitoring programme for machinery vibration; SKYbrary gives the general definition (measure periodically
  or continuously and look for significant change).
- **The public apprenticeship standard for his kind of work.** The Engineering technician standard (ST0457), which has
  Maritime electrical fitter as an option (the Royal Navy has an approved bespoke end-point assessment for it), asks for
  "mathematical techniques" in a maritime electrical environment, for reading, analysing and interpreting engineering
  data, and for testing and diagnostic work with measuring equipment. It does not use the word statistics. It does list
  condition monitoring and planned maintenance, in its mechatronics maintenance option.
- **Public apprenticeship standard ST0457 Engineering technician (core knowledge): general engineering mathematics and understanding data**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "understanding of general engineering/manufacturing mathematical and scientific principles, methods, techniques, graphical expressions, symbols formulae and calculations used by engineering technicians ... understanding and interpreting relevant engineering/manufacturing data and documentation in order to complete their job role"
- **ST0457 option 5, Maritime electrical fitter: the role is testing, fault diagnosis and maintenance of electrical systems on maritime vessels, with measuring and diagnostic equipment**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "The Electrical Fitter utilises engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of electrical and data systems on maritime vessels. ... a variety of measuring and diagnostic equipment and processes to ensure individual components and assemblies meet the required specification."
- **ST0457 option 5: understand the specific mathematical techniques in a maritime electrical/electronic environment**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "understand the specific mathematical techniques, formula and calculation in a maritime electrical/electronic environment"
- **ST0457 option 5: read, analyse and interpret engineering data, and undertake testing and diagnostic activities**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "read, analyse and interpret engineering data, drawings and documentation used in the design, build, operation and repair of maritime vessels ... undertake testing, inspection and diagnostic activities on components, equipment and systems on maritime vessels, making adjustments where applicable."
- **ST0457 option 10 (mechatronics maintenance technician): condition monitoring and planned maintenance are named skills in the same standard**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "read and interpret relevant data and documentation used to maintain components, equipment and systems carry out condition monitoring of plant and equipment carry out planned maintenance activities on plant and equipment"
- **ST0457 notes that the Royal Navy has an approved bespoke end-point assessment for options 5 and 6 (the standard is public; its content is not claimed here as how the Navy trains)**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-4
  - Quote: "On options 5 - Maritime electrical fitter and 6 - Maritime mechanical fitter, bespoke EPA arrangements have been approved by IfATE for the Royal Navy."
- **Maths on the Level 3 route.** The MCA management-level syllabus has no statistics (3.3) and the apprenticeship
  standard does not name it. So the first place Dan meets these ideas in his qualifications is most likely through
  measurement, maintenance and test documents, not a maths unit. That is my guess (**UNCONFIRMED**): I have no public
  syllabus for his Level 3 marine engineering course and did not search for one, as asked.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 5 lessons

The benchmark's lesson counts, from the pages in section 1 (named lessons, Level Review not counted):
- Everyday Statistics: 36 lessons in all. By my count levels 1 to 5 (mean and median) are 23 lessons, levels 6 and 7
  (quartiles, box plots, range) are 8, and level 8 (outliers) is 5.
- Exploring Data Visually: 29 lessons in all. The line graph level has 3, the scatter plot level 4 and Seasonal
  Variation 1.
- Regression: 23 lessons in all. The two near levels (Correlation and Regression) have 5.
- Probability and Chance: 31 lessons in all. AND, OR, NOT and Independent AND are about 7 of them (levels 6, 7 and 9).
- Probability in Data: 19 lessons. Predicting with Probability: 15.

So Brilliant spends 153 lessons across its six courses, and about 55 of them on ground near Dan's five parts, while Dan wants
five. Even the near ground is too large. By my count Brilliant takes 23 lessons on mean and median alone.

The engineering sources are far more compact and fit five lessons:
- HELM covers four of Dan's five parts with one section each: Workbook 36 (descriptive statistics and exploring data),
  39 (the normal distribution), 43 (regression and correlation) and 46 (reliability and quality control, 38 pages in all,
  with 46.1 Reliability the shorter half). The fifth part (measurement uncertainty) is NPL's Good Practice Guide 11 and
  UKAS LAB 12.

My reading, a core that supports five lessons for Dan:
1. **Centre and spread of readings** (HELM 36.1, Bitesize, NPL section 3). Mean, median, range, standard deviation, and why the
   average alone misleads.
2. **How far to trust a reading** (NPL GPG 11, UKAS LAB 12, Fluke). Resolution, accuracy as percent plus counts, scatter against
   offset, a result stated with its uncertainty, and comparison with a limit.
3. **The normal curve and honest outliers** (HELM 39, HELM 36.2, HELM 46.2). Standard deviation as a ruler, 68-95-99.7, tolerance
   bands, z-score, and investigate before deleting.
4. **Trends over time** (Megger, HELM 43, NIST and HELM 46.2 rules). A fitted line, drift against noise, compare like
   with like, and correlation is not cause.
5. **Reliability** (HELM 46.1, NIST, Bel, NREL, Kohler). Failure rate, MTBF, the bathtub, survival probability, series and
   parallel, with AND and OR taught inline. This is the fullest lesson. If it will not fit twelve screens, the series and
   parallel half is the part to split into a sixth lesson, though five were asked for. That is a guess: **UNCONFIRMED**
   until a lesson is built.

---

## Open points (everything I could not confirm)

- **UNCONFIRMED:** what is inside Brilliant's lessons (only titles are visible), and the lessons of Clustering &
  Classification.
- **UNCONFIRMED:** the outcomes of SQA Engineering Mathematics 2, 4 and 5; the MCA oral exam syllabus (MIN 654); any public
  syllabus for Dan's Level 3 marine engineering course; the Inspection and testing guidance note's wording of the E1 rule.
- **Do not copy:** HELM 46 Example 1 (the 49%; it should be 58%), HELM 36's "60 instead of 6" figures, the Kohler paper's
  failure rates as facts about real UPS units.
- **SECONDARY:** the 68-95-99.7 rule quote (LibreTexts); the Kohler failure-rate figures; trade pages on MTBF (Bel).
- No Royal Navy or submarine source was sought or used.
