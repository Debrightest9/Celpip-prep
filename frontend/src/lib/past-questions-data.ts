// CELPIP-style past practice questions
// Organized by skill and part, following official CELPIP test structure

export type Skill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export interface MCQQuestion {
  num: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface ReadingListeningSet {
  id: string;
  skill: 'READING' | 'LISTENING';
  part: number;
  partName: string;
  source: string;
  passage: string; // text for reading; audio script for listening
  questions: MCQQuestion[];
}

export interface WritingSet {
  id: string;
  skill: 'WRITING';
  part: number;
  partName: string;
  source: string;
  task: string;
  timeAllowed: string;
  wordCount: string;
  sampleResponse: string;
  scoringTips: string[];
}

export interface SpeakingSet {
  id: string;
  skill: 'SPEAKING';
  part: number;
  partName: string;
  source: string;
  prompt: string;
  situation?: string;
  preparationTime: string;
  responseTime: string;
  sampleResponse: string;
  scoringTips: string[];
}

export type PastQuestionSet = ReadingListeningSet | WritingSet | SpeakingSet;

// ─────────────────────────────────────────────
// READING — 4 Parts
// Part 1: Reading Correspondence (email/letter)
// Part 2: Reading to Apply a Diagram
// Part 3: Reading for Information
// Part 4: Reading for Viewpoints
// ─────────────────────────────────────────────

export const READING_SETS: ReadingListeningSet[] = [
  {
    id: 'r1-s1',
    skill: 'READING',
    part: 1,
    partName: 'Reading Correspondence',
    source: 'Sample Set 1',
    passage: `From: Jessica Harmon <j.harmon@bellnet.ca>
To: Marcus Osei <m.osei@cityworks.ca>
Subject: Community Garden — Permit Application Update
Date: Tuesday, September 12

Hi Marcus,

I am writing to follow up on the permit application we submitted last month for the Riverdale Community Garden expansion. As you may recall, our group proposed converting the unused lot at the corner of Elm Street and Dufferin Avenue into a shared green space for neighbourhood residents.

We understand the city requires a public consultation period before approving projects of this nature. We have already held two open-house meetings at the Riverdale Community Centre — one on August 5 and another on August 19 — and both were well attended, with over 60 residents providing written feedback. Nearly 85% of respondents expressed strong support for the project.

However, we are concerned about a recent notice we received indicating that a zoning review may delay the approval by an additional three months. This delay would push our planting window past the first frost, making it impossible to start the garden this season. We would lose the volunteer momentum we have spent months building.

Could you clarify whether the zoning review is mandatory, or whether it can proceed in parallel with the permit process? If so, we would be happy to provide any additional documentation required. We are also open to scheduling a meeting with your department at your earliest convenience.

Thank you very much for your continued support of community initiatives.

Best regards,
Jessica Harmon
Riverdale Community Garden Committee`,
    questions: [
      {
        num: 1,
        question: 'What is the main purpose of this email?',
        options: {
          A: 'To invite Marcus to attend an open-house meeting',
          B: 'To ask for clarification about a delay in the permit process',
          C: 'To complain about the city\'s community garden policy',
          D: 'To provide the results of a public survey',
        },
        answer: 'B',
        explanation: 'Jessica specifically asks Marcus to clarify whether the zoning review is mandatory and whether it can run in parallel with the permit process — the core concern is the delay.',
      },
      {
        num: 2,
        question: 'What does Jessica say about community support for the project?',
        options: {
          A: 'Sixty residents attended the public consultation.',
          B: 'All respondents supported the expansion.',
          C: 'Approximately 85% of feedback respondents were in favour.',
          D: 'Support has decreased since the zoning notice was issued.',
        },
        answer: 'C',
        explanation: 'The email states "Nearly 85% of respondents expressed strong support for the project."',
      },
      {
        num: 3,
        question: 'Why is the three-month delay a problem for the committee?',
        options: {
          A: 'It conflicts with the city\'s budget approval schedule.',
          B: 'It would mean missing the growing season and losing volunteers.',
          C: 'The rented lot is only available until November.',
          D: 'The committee cannot afford another open-house meeting.',
        },
        answer: 'B',
        explanation: 'Jessica explains the delay would push planting past the first frost and cause the committee to lose the volunteer momentum built over months.',
      },
      {
        num: 4,
        question: 'What did the Riverdale Community Garden Committee do on August 5 and August 19?',
        options: {
          A: 'They submitted the permit application to the city.',
          B: 'They cleaned up the lot at Elm Street and Dufferin Avenue.',
          C: 'They held open-house meetings to gather resident feedback.',
          D: 'They met with Marcus Osei at City Hall.',
        },
        answer: 'C',
        explanation: 'The email says "we have already held two open-house meetings at the Riverdale Community Centre — one on August 5 and another on August 19."',
      },
      {
        num: 5,
        question: 'What does Jessica offer to do to help resolve the situation?',
        options: {
          A: 'Organize a third public consultation meeting',
          B: 'Hire a professional zoning consultant',
          C: 'Delay the project until the following spring',
          D: 'Provide extra documents and meet with the department',
        },
        answer: 'D',
        explanation: 'Jessica says she is "happy to provide any additional documentation required" and "open to scheduling a meeting with your department."',
      },
      {
        num: 6,
        question: 'What can be inferred about the lot at Elm Street and Dufferin Avenue?',
        options: {
          A: 'It is currently being used for commercial purposes.',
          B: 'It is not being used at present.',
          C: 'The city owns it but leases it to developers.',
          D: 'It was previously a community garden.',
        },
        answer: 'B',
        explanation: 'The email describes it as "the unused lot," which implies it is currently vacant.',
      },
    ],
  },
  {
    id: 'r2-s1',
    skill: 'READING',
    part: 2,
    partName: 'Reading to Apply a Diagram',
    source: 'Sample Set 1',
    passage: `NORTHVIEW PUBLIC LIBRARY — ROOM BOOKING GUIDE

The library offers four bookable spaces for community use. Review the chart below and the rules that follow before submitting your request.

ROOM CHART:
┌────────────────┬──────────┬──────────┬──────────────┬─────────────────────┐
│ Room           │ Capacity │ Fee/hour │ A/V Equipment│ Booking Lead Time   │
├────────────────┼──────────┼──────────┼──────────────┼─────────────────────┤
│ Maple Hall     │ 80       │ $45      │ Projector,   │ 14 days             │
│                │          │          │ Microphone   │                     │
├────────────────┼──────────┼──────────┼──────────────┼─────────────────────┤
│ Cedar Room     │ 30       │ $20      │ TV screen    │ 7 days              │
├────────────────┼──────────┼──────────┼──────────────┼─────────────────────┤
│ Birch Lounge   │ 12       │ $10      │ None         │ 3 days              │
├────────────────┼──────────┼──────────┼──────────────┼─────────────────────┤
│ Study Pod A/B  │ 4 each   │ Free     │ None         │ Same day            │
└────────────────┴──────────┴──────────┴──────────────┴─────────────────────┘

BOOKING RULES:
1. Rooms may be booked for a maximum of 4 consecutive hours per session.
2. Non-profit organizations receive a 20% discount on all room fees.
3. Cancellations made less than 48 hours before the booking will forfeit 50% of the fee.
4. A/V equipment must be requested at least 24 hours in advance of any booking.
5. No food or beverages permitted in Study Pods A or B.
6. Maple Hall requires a completed Noise Impact Form for any event over 2 hours.
7. Study Pods are for personal study only — no group events permitted.`,
    questions: [
      {
        num: 1,
        question: 'A community group of 25 people needs a room with a screen to display slides. Which room is the most cost-effective choice?',
        options: {
          A: 'Maple Hall',
          B: 'Cedar Room',
          C: 'Birch Lounge',
          D: 'Study Pod A',
        },
        answer: 'B',
        explanation: 'Cedar Room holds 30 people (enough for 25), has a TV screen for slides, and costs only $20/hour — far cheaper than Maple Hall at $45/hour.',
      },
      {
        num: 2,
        question: 'How much would a non-profit organization pay to book Cedar Room for 3 hours?',
        options: {
          A: '$45',
          B: '$48',
          C: '$54',
          D: '$60',
        },
        answer: 'B',
        explanation: 'Cedar Room costs $20/hour × 3 = $60 total. With the 20% non-profit discount: $60 × 0.80 = $48.',
      },
      {
        num: 3,
        question: 'A person wants to book Maple Hall for a 3-hour event next Saturday. According to the rules, what additional step is required?',
        options: {
          A: 'Reserve a microphone at least 24 hours before the event',
          B: 'Submit a Noise Impact Form',
          C: 'Obtain written approval from a library manager',
          D: 'Pay the full fee at least two weeks in advance',
        },
        answer: 'B',
        explanation: 'Rule 6 states that Maple Hall requires a completed Noise Impact Form for any event over 2 hours. A 3-hour event exceeds this threshold.',
      },
      {
        num: 4,
        question: 'Yuki booked Birch Lounge and paid $30 for a 3-hour session. She cancels 30 hours before the event. How much will she forfeit?',
        options: {
          A: '$0',
          B: '$10',
          C: '$15',
          D: '$30',
        },
        answer: 'C',
        explanation: 'Cancellations less than 48 hours before the booking forfeit 50% of the fee. 30 hours is less than 48, so she forfeits 50% of $30 = $15.',
      },
      {
        num: 5,
        question: 'Which of the following is NOT permitted at the library?',
        options: {
          A: 'Booking Cedar Room 5 days in advance',
          B: 'Bringing coffee into Birch Lounge',
          C: 'Using Study Pod B for a 4-person team meeting',
          D: 'Requesting A/V equipment 25 hours before an event',
        },
        answer: 'C',
        explanation: 'Rule 7 states that Study Pods are for personal study only — no group events permitted. A 4-person team meeting is a group event.',
      },
      {
        num: 6,
        question: 'A person decides to book Maple Hall for today. Can they complete the booking?',
        options: {
          A: 'Yes, because there is no minimum lead time for Maple Hall',
          B: 'No, because Maple Hall requires 14 days advance booking',
          C: 'Yes, if they pay an express booking fee',
          D: 'No, because Maple Hall is only available on weekdays',
        },
        answer: 'B',
        explanation: 'The chart shows Maple Hall requires a 14-day booking lead time, so a same-day booking is not possible.',
      },
    ],
  },
  {
    id: 'r3-s1',
    skill: 'READING',
    part: 3,
    partName: 'Reading for Information',
    source: 'Sample Set 1',
    passage: `URBAN HEAT ISLANDS: CAUSES, EFFECTS, AND SOLUTIONS

An urban heat island (UHI) occurs when a city experiences significantly higher temperatures than the surrounding rural areas. This phenomenon is primarily caused by human activities and the physical characteristics of urban environments. Understanding UHIs has become increasingly important as more than half the world's population now lives in cities.

CAUSES OF URBAN HEAT ISLANDS

The main driver of UHIs is the replacement of natural vegetation with hard surfaces such as concrete, asphalt, and roofing materials. Unlike soil and plants, these surfaces absorb more solar radiation and release it as heat, especially during the evening hours. Cities also generate heat through vehicle exhaust, industrial machinery, air conditioning units, and the millions of devices that power modern urban life.

Another contributing factor is the geometry of city streets. Tall buildings create "urban canyons" that trap heat and limit airflow. This effect is worsened when streets run parallel to prevailing winds, preventing natural ventilation that might otherwise cool the area.

EFFECTS ON HEALTH AND ENERGY USE

Elevated temperatures in cities directly increase demand for air conditioning, which in turn increases energy consumption and greenhouse gas emissions — creating a feedback loop. Studies have shown that for every 1°C rise in temperature above a certain threshold, electricity demand increases by 1.5 to 2 percent.

The health consequences are significant. Heat stress, dehydration, and heat stroke are more common in urban areas during heat waves. Vulnerable populations, including the elderly, young children, and those without access to air conditioning, face the greatest risk. In Canada, the 2021 heat dome event led to hundreds of heat-related deaths, disproportionately affecting low-income urban neighbourhoods.

MITIGATION STRATEGIES

Urban planners and policymakers are exploring several strategies to reduce UHIs. Green roofs — rooftop gardens covered with soil and vegetation — insulate buildings and cool the surrounding air through evapotranspiration. Some cities have implemented cool roof programs, requiring buildings to use reflective materials that reduce heat absorption.

Increasing urban tree canopy is widely regarded as one of the most cost-effective interventions. Trees provide shade, release water vapour, and can reduce surrounding temperatures by 2 to 8°C in their immediate vicinity. Cities such as Melbourne, Australia, and Singapore have set ambitious urban forest targets as part of their climate adaptation plans.

Permeable pavements, which allow rainwater to seep through the surface and cool the ground through evaporation, are increasingly being installed in parking lots and walkways. While effective, they require regular maintenance to prevent clogging.`,
    questions: [
      {
        num: 1,
        question: 'According to the passage, what is the main cause of urban heat islands?',
        options: {
          A: 'Population growth in cities',
          B: 'Replacement of vegetation with hard surfaces',
          C: 'Increasing use of air conditioning',
          D: 'The height of modern buildings',
        },
        answer: 'B',
        explanation: 'The passage states: "The main driver of UHIs is the replacement of natural vegetation with hard surfaces such as concrete, asphalt, and roofing materials."',
      },
      {
        num: 2,
        question: 'What does the passage say about the relationship between heat and electricity demand?',
        options: {
          A: 'Electricity demand increases by 1.5 to 2% per additional degree Celsius.',
          B: 'Air conditioning causes a 2°C rise in urban temperatures.',
          C: 'Each 1% increase in electricity use raises temperatures by 1°C.',
          D: 'Green roofs reduce electricity demand by 15–20%.',
        },
        answer: 'A',
        explanation: 'The passage states: "for every 1°C rise in temperature above a certain threshold, electricity demand increases by 1.5 to 2 percent."',
      },
      {
        num: 3,
        question: 'What is the "feedback loop" mentioned in the passage?',
        options: {
          A: 'Rising temperatures → more A/C use → more emissions → further temperature rise',
          B: 'More vehicles → more heat → more trees required → less space for roads',
          C: 'Cool roofs reflect heat → lower energy bills → more affordable housing',
          D: 'Green roofs reduce heat → less electricity use → lower city budgets',
        },
        answer: 'A',
        explanation: 'The passage explains that higher temperatures increase A/C demand, which increases energy use and greenhouse gas emissions, which warms the environment further — a self-reinforcing loop.',
      },
      {
        num: 4,
        question: 'According to the passage, which of the following groups faces the greatest health risk during heat waves?',
        options: {
          A: 'Factory workers and truck drivers',
          B: 'Wealthy urban residents who travel frequently',
          C: 'The elderly, young children, and those without air conditioning',
          D: 'Outdoor construction workers in rural areas',
        },
        answer: 'C',
        explanation: 'The passage specifically identifies "the elderly, young children, and those without access to air conditioning" as facing the greatest risk.',
      },
      {
        num: 5,
        question: 'What does the passage say about urban trees as a mitigation strategy?',
        options: {
          A: 'They are expensive but highly effective in all climates.',
          B: 'They can reduce nearby temperatures by 2 to 8°C.',
          C: 'They require the most maintenance of all strategies listed.',
          D: 'They are mainly effective in tropical cities like Singapore.',
        },
        answer: 'B',
        explanation: 'The passage states trees "can reduce surrounding temperatures by 2 to 8°C in their immediate vicinity."',
      },
      {
        num: 6,
        question: 'What is a disadvantage of permeable pavements mentioned in the passage?',
        options: {
          A: 'They are too expensive for most cities to install.',
          B: 'They are only effective in areas with heavy rainfall.',
          C: 'They need regular maintenance to prevent blockage.',
          D: 'They cause flooding in underground parking areas.',
        },
        answer: 'C',
        explanation: 'The passage states permeable pavements "require regular maintenance to prevent clogging."',
      },
    ],
  },
  {
    id: 'r4-s1',
    skill: 'READING',
    part: 4,
    partName: 'Reading for Viewpoints',
    source: 'Sample Set 1',
    passage: `SHOULD CITIES BAN SINGLE-USE PLASTICS?

YES — A Necessary Step for Our Oceans and Cities
By Priya Nair, Environmental Policy Analyst

Single-use plastics are among the most visible and damaging forms of pollution on the planet. Plastic bags, straws, foam containers, and disposable cutlery make up a significant portion of the litter found in urban parks, waterways, and ocean coastlines. Municipal bans on these items send a clear message that convenience should not come at the cost of environmental destruction.

Critics argue that bans inconvenience consumers and harm small businesses. However, the evidence from cities that have already implemented such measures — Vancouver, Toronto, and dozens of European capitals — suggests otherwise. Within two years of Vancouver's plastic bag ban, retailers reported adapting smoothly, and plastic bag litter decreased by over 50 percent. The short-term adjustment costs pale in comparison to the long-term savings on waste management and cleanup.

Proponents of voluntary reduction programmes miss a fundamental point: voluntary measures simply do not work at the scale required. Studies consistently show that without regulatory pressure, consumer behaviour changes only marginally. A ban, by contrast, creates a universal standard that eliminates any competitive disadvantage businesses might feel from going green alone.

NO — Bans Create Problems Without Solving the Root Issue
By David Marsh, Economist and Retail Consultant

Banning single-use plastics feels good but accomplishes little if the underlying waste management infrastructure is not improved. Many cities lack the composting and recycling facilities needed to handle the alternatives — paper, bioplastics, and cloth bags — that bans push consumers toward. These alternatives often have a higher carbon footprint per item, requiring far more energy and water to produce.

Furthermore, blanket bans disproportionately impact low-income consumers who rely on inexpensive single-use items for hygiene, food storage, and convenience. A reusable bag may cost five to ten dollars — a trivial amount for some, but a meaningful expense for those living paycheck to paycheck.

The more effective solution is extended producer responsibility (EPR): making manufacturers financially accountable for the end-of-life disposal of their products. This approach incentivizes companies to redesign packaging for recyclability without creating new burdens for consumers or retailers. Rather than banning what exists, we should build the systems that make responsible disposal easy and affordable for everyone.`,
    questions: [
      {
        num: 1,
        question: 'What is Priya Nair\'s main argument in favour of plastic bans?',
        options: {
          A: 'Plastic is the leading cause of ocean acidification.',
          B: 'Bans are a necessary response to widespread plastic pollution despite short-term costs.',
          C: 'Consumers prefer reusable alternatives when given a choice.',
          D: 'European cities have already achieved zero plastic waste.',
        },
        answer: 'B',
        explanation: 'Nair argues bans send a clear message and that short-term adjustment costs are outweighed by long-term environmental benefits — she explicitly says "convenience should not come at the cost of environmental destruction."',
      },
      {
        num: 2,
        question: 'Which evidence does Priya Nair use to counter the argument that bans harm businesses?',
        options: {
          A: 'European governments offered subsidies to offset retail losses.',
          B: 'Vancouver saw a 50% drop in bag litter and retailers adapted successfully.',
          C: 'A national survey showed 75% of consumers prefer reusable bags.',
          D: 'Plastic production costs increased by 30% since bans were introduced.',
        },
        answer: 'B',
        explanation: 'Nair cites Vancouver\'s experience: retailers adapted smoothly and plastic bag litter decreased by over 50 percent within two years.',
      },
      {
        num: 3,
        question: 'According to David Marsh, why might banning single-use plastics not solve the problem?',
        options: {
          A: 'Manufacturers will simply find a legal way to continue producing them.',
          B: 'Most plastic pollution originates from industrial rather than consumer sources.',
          C: 'Alternative materials can have higher carbon footprints and cities lack proper facilities.',
          D: 'Consumer habits are too deeply ingrained to change with regulation.',
        },
        answer: 'C',
        explanation: 'Marsh argues that alternatives like paper and bioplastics may have higher carbon footprints, and cities often lack the composting/recycling infrastructure to manage them.',
      },
      {
        num: 4,
        question: 'What does Marsh mean by "extended producer responsibility" (EPR)?',
        options: {
          A: 'Requiring retailers to extend the warranty period on reusable products',
          B: 'Making manufacturers pay for the disposal of the products they make',
          C: 'Expanding government agencies to oversee all packaging decisions',
          D: 'Banning plastics from all production facilities over a 10-year period',
        },
        answer: 'B',
        explanation: 'Marsh defines EPR as "making manufacturers financially accountable for the end-of-life disposal of their products."',
      },
      {
        num: 5,
        question: 'On which point do both writers AGREE?',
        options: {
          A: 'Single-use plastics cause significant environmental harm.',
          B: 'Voluntary reduction programs are the best approach.',
          C: 'Bans unfairly burden low-income consumers.',
          D: 'Businesses adapt easily to environmental regulations.',
        },
        answer: 'A',
        explanation: 'Both writers acknowledge plastic pollution is a real problem — Nair highlights ocean and urban litter; Marsh acknowledges the issue exists but disputes the solution. Neither disputes that single-use plastics are harmful.',
      },
      {
        num: 6,
        question: 'How does Nair respond to advocates of voluntary reduction programmes?',
        options: {
          A: 'She argues they are expensive and poorly organized.',
          B: 'She says they are effective but only in wealthier cities.',
          C: 'She claims they fail to create meaningful change without regulatory pressure.',
          D: 'She supports them as a complement to municipal bans.',
        },
        answer: 'C',
        explanation: 'Nair writes: "voluntary measures simply do not work at the scale required" and that without regulatory pressure "consumer behaviour changes only marginally."',
      },
    ],
  },
];

// ─────────────────────────────────────────────
// LISTENING — 6 Parts
// ─────────────────────────────────────────────

export const LISTENING_SETS: ReadingListeningSet[] = [
  {
    id: 'l1-s1',
    skill: 'LISTENING',
    part: 1,
    partName: 'Listening to Problem Solving',
    source: 'Sample Set 1',
    passage: `[Two neighbours, KAREN and THEO, are talking outside their apartment building.]

KAREN: Theo, I'm glad I ran into you. I wanted to ask — did you get a notice about the parking situation?

THEO: The one about the construction? Yeah, they're redoing the back lot, so residents can't park there for the next six weeks.

KAREN: Right. I've been parking on Maple Street, but last week I got a ticket. Apparently you need a permit to park there overnight.

THEO: Really? I didn't know that. I've been using the lot at the community centre. It's a bit of a walk, but they allow overnight parking and it's free.

KAREN: Oh, that's not bad. Is it safe at night, though? I work late shifts sometimes.

THEO: There are lights and a security camera. I've never had a problem. The only catch is you have to move your car by 8 AM on weekdays because of the kids' programs.

KAREN: That could be tricky for me on Tuesdays — I usually sleep in after a night shift. Do you know if there are any other options?

THEO: There's a paid lot on Durham Avenue. It's $8 a night, which adds up, but some residents have been splitting it — a few people on our floor put their cars in one spot and rotate.

KAREN: That actually sounds like a good idea. I'll ask around. Thanks for the tip, Theo.

THEO: No problem. Oh — and the building manager said she might be arranging a temporary deal with a lot nearby. Worth checking with her too.`,
    questions: [
      {
        num: 1,
        question: 'Why can residents not park in the back lot?',
        options: {
          A: 'It is being converted into a park.',
          B: 'It is under construction.',
          C: 'It has been closed due to vandalism.',
          D: 'It requires a new permit system.',
        },
        answer: 'B',
        explanation: 'Theo says "they\'re redoing the back lot, so residents can\'t park there for the next six weeks," indicating construction.',
      },
      {
        num: 2,
        question: 'What problem did Karen have when parking on Maple Street?',
        options: {
          A: 'The street is too far from her apartment.',
          B: 'She received a parking ticket for overnight parking.',
          C: 'Her car was towed away.',
          D: 'The spots were always taken.',
        },
        answer: 'B',
        explanation: 'Karen says "last week I got a ticket. Apparently you need a permit to park there overnight."',
      },
      {
        num: 3,
        question: 'What is a limitation of the community centre parking lot?',
        options: {
          A: 'It is not lit at night.',
          B: 'It is only free on weekends.',
          C: 'Cars must be removed by 8 AM on weekdays.',
          D: 'It is only available to community centre members.',
        },
        answer: 'C',
        explanation: 'Theo mentions "you have to move your car by 8 AM on weekdays because of the kids\' programs."',
      },
      {
        num: 4,
        question: 'Why is the 8 AM weekday rule a problem for Karen?',
        options: {
          A: 'She has an early morning gym class on Tuesdays.',
          B: 'She often sleeps late after working night shifts.',
          C: 'She drops her children at school before 8 AM.',
          D: 'She commutes before sunrise on weekdays.',
        },
        answer: 'B',
        explanation: 'Karen says "that could be tricky for me on Tuesdays — I usually sleep in after a night shift."',
      },
      {
        num: 5,
        question: 'What solution are some neighbours using at the Durham Avenue lot?',
        options: {
          A: 'Booking the lot for a full month at a discounted rate',
          B: 'Sharing one parking spot and taking turns',
          C: 'Petitioning the city for a residents-only zone',
          D: 'Using a carpooling app to share rides',
        },
        answer: 'B',
        explanation: 'Theo explains that "some residents have been splitting it — a few people on our floor put their cars in one spot and rotate."',
      },
    ],
  },
  {
    id: 'l2-s1',
    skill: 'LISTENING',
    part: 2,
    partName: 'Listening to a Daily Life Conversation',
    source: 'Sample Set 1',
    passage: `[SANDRA and PAUL are coworkers having lunch in the office break room.]

SANDRA: Paul, you look exhausted. Did you sleep okay?

PAUL: Not really. I stayed up way too late trying to finish that online course I signed up for.

SANDRA: Which one? I didn't know you were doing something like that.

PAUL: It's a data analytics certificate through Greenfield University — the one they offer through their continuing education department. I've been meaning to do it for about two years, but something always came up.

SANDRA: What made you finally start?

PAUL: Honestly? The department reorganization. When they announced some roles might be shifting to data-driven positions, I figured I should get ahead of it rather than scramble later.

SANDRA: That makes sense. How long is the program?

PAUL: Six months if you do it full-time, but I'm going at my own pace — probably closer to nine or ten months the way things are going.

SANDRA: Is it worth it? I mean, is the content good?

PAUL: It's really solid. The first four modules covered Excel and SQL basics, which I already knew, so those felt like a bit of a slow start. But now I'm into the fifth module — machine learning fundamentals — and I'm genuinely finding it challenging and interesting.

SANDRA: I've been thinking about doing something similar. Do you need a background in programming?

PAUL: Not for the early modules, no. But it does ramp up — I'd say basic coding comfort helps. There's also a pretty active online forum where other students post questions, and the instructors respond within a day or two. That part's been really helpful when I get stuck.

SANDRA: What's the cost like?

PAUL: It's $1,200 total, which I thought was reasonable for a recognized certificate. And my manager mentioned that if I complete it, the company will reimburse 70%.

SANDRA: That's a pretty good deal. Maybe I should look into it too.`,
    questions: [
      {
        num: 1,
        question: 'Why did Paul sign up for the data analytics course at this particular time?',
        options: {
          A: 'His manager required him to complete professional development.',
          B: 'He learned that his department may move toward data-focused roles.',
          C: 'He was offered a scholarship by Greenfield University.',
          D: 'A coworker recommended the course to him.',
        },
        answer: 'B',
        explanation: 'Paul says he acted because of "the department reorganization" — specifically that "some roles might be shifting to data-driven positions."',
      },
      {
        num: 2,
        question: 'How long has Paul been taking the course?',
        options: {
          A: 'He just started last week.',
          B: 'He is about halfway through a six-month timeline.',
          C: 'He has been taking it for about two years.',
          D: 'He is in the early modules and expects to finish in nine to ten months.',
        },
        answer: 'D',
        explanation: 'Paul is currently on the fifth module and says "probably closer to nine or ten months the way things are going."',
      },
      {
        num: 3,
        question: 'How does Paul describe the first four modules?',
        options: {
          A: 'Difficult but rewarding',
          B: 'Repetitive of content he already knew',
          C: 'Focused on machine learning basics',
          D: 'Poorly organized but useful',
        },
        answer: 'B',
        explanation: 'Paul says the first four modules covered Excel and SQL, which "I already knew, so those felt like a bit of a slow start."',
      },
      {
        num: 4,
        question: 'What does Paul say helped him when he got stuck in the course?',
        options: {
          A: 'Calling the university\'s support line',
          B: 'Reviewing recorded lectures',
          C: 'An online forum with responsive instructors',
          D: 'Study sessions with a coworker',
        },
        answer: 'C',
        explanation: 'Paul mentions "a pretty active online forum where other students post questions, and the instructors respond within a day or two."',
      },
      {
        num: 5,
        question: 'How much will Paul likely pay out of pocket for the course if his company reimbursement comes through?',
        options: {
          A: '$120',
          B: '$360',
          C: '$840',
          D: '$1,200',
        },
        answer: 'B',
        explanation: 'The course costs $1,200 and the company will reimburse 70% ($840), leaving Paul paying 30% = $360.',
      },
    ],
  },
  {
    id: 'l3-s1',
    skill: 'LISTENING',
    part: 3,
    partName: 'Listening for Information',
    source: 'Sample Set 1',
    passage: `[Radio announcement from a local station]

HOST: Good morning. I'm Elena Park, and you're listening to CFMR Community Radio. Before we get into today's music, I want to bring you some important announcements from the City of Ashford.

First, Ashford Public Transit is introducing its new Night Owl Bus Service starting this Monday, April 14th. Three new routes — Routes 51, 52, and 53 — will run from midnight to 4 AM, connecting the downtown core with the Westdale, Northridge, and Lakeview neighbourhoods. All routes will operate every 30 minutes. Riders should note that the Night Owl Service is not covered by the regular transit pass — there is a flat fare of $3.50 per trip, which can be paid by card only. No cash will be accepted.

Next, a reminder about the upcoming Ashford Spring Cleanup. Volunteers are needed on Saturday, April 19th, from 9 AM to noon. Meeting points have been set up at Riverside Park, Cedar Commons, and the Ashford Community Centre. All cleaning supplies will be provided. Participants are encouraged to wear sturdy shoes and bring water. Pre-registration is not required, but the city asks that groups larger than ten contact the Parks Department at cleanup@ashford.ca to coordinate.

Finally, the Ashford Public Library will be hosting its annual Youth Writing Contest awards ceremony on Thursday, April 17th, at 6:30 PM in the Main Branch auditorium. This year, over 400 entries were submitted in three age categories: Junior for ages 8 to 11, Intermediate for ages 12 to 15, and Senior for ages 16 to 18. The ceremony is free and open to the public. Light refreshments will be served.

Stay tuned — after the break, we'll be hearing from local jazz ensemble The Ridgemont Quartet.`,
    questions: [
      {
        num: 1,
        question: 'When does the Night Owl Bus Service begin?',
        options: {
          A: 'Friday, April 11th',
          B: 'Monday, April 14th',
          C: 'Saturday, April 19th',
          D: 'Thursday, April 17th',
        },
        answer: 'B',
        explanation: 'The host says the Night Owl Bus Service is "starting this Monday, April 14th."',
      },
      {
        num: 2,
        question: 'Which neighbourhood is NOT served by the Night Owl Bus Service?',
        options: {
          A: 'Westdale',
          B: 'Northridge',
          C: 'Lakeview',
          D: 'Ashford Heights',
        },
        answer: 'D',
        explanation: 'The three neighbourhoods mentioned are Westdale, Northridge, and Lakeview. Ashford Heights is not mentioned.',
      },
      {
        num: 3,
        question: 'How can riders pay the Night Owl fare?',
        options: {
          A: 'Cash or card',
          B: 'Regular transit pass only',
          C: 'Card payment only',
          D: 'Pre-paid tokens from transit offices',
        },
        answer: 'C',
        explanation: 'The announcement states: "can be paid by card only. No cash will be accepted."',
      },
      {
        num: 4,
        question: 'When should groups contact the Parks Department about the Spring Cleanup?',
        options: {
          A: 'If they are volunteering for the first time',
          B: 'If their group has more than ten people',
          C: 'If they want to reserve supplies in advance',
          D: 'If they plan to arrive after 10 AM',
        },
        answer: 'B',
        explanation: 'The announcement says "the city asks that groups larger than ten contact the Parks Department... to coordinate."',
      },
      {
        num: 5,
        question: 'What is the age range for the "Intermediate" category in the Youth Writing Contest?',
        options: {
          A: '8 to 11',
          B: '10 to 13',
          C: '12 to 15',
          D: '16 to 18',
        },
        answer: 'C',
        explanation: 'The host lists the categories: "Junior for ages 8 to 11, Intermediate for ages 12 to 15, and Senior for ages 16 to 18."',
      },
      {
        num: 6,
        question: 'What will happen after the break on the radio program?',
        options: {
          A: 'An interview with the Ashford mayor',
          B: 'More community announcements',
          C: 'A performance by The Ridgemont Quartet',
          D: 'A news report on the transit changes',
        },
        answer: 'C',
        explanation: 'The host says: "after the break, we\'ll be hearing from local jazz ensemble The Ridgemont Quartet."',
      },
    ],
  },
  {
    id: 'l4-s1',
    skill: 'LISTENING',
    part: 4,
    partName: 'Listening to a News Item',
    source: 'Sample Set 1',
    passage: `[TV news broadcast]

ANCHOR: A new study released today by the University of Harwick is raising questions about the long-term effectiveness of four-day work week trials. While many companies and governments have pointed to shorter work weeks as a productivity booster and mental health win, the Harwick study followed 200 companies over three years and found a more complex picture.

Lead researcher Dr. Amina Oduya explains that initial gains in employee satisfaction and output were real — but often faded after 12 to 18 months. In a number of cases, the compressed schedule led to longer actual work hours on the days employees did work, essentially cancelling out the rest benefits.

The study also identified a divide along industry lines. Service-sector employees, particularly in healthcare and customer support, saw fewer benefits than those in knowledge-based roles such as software development and marketing. Dr. Oduya attributed this to the fact that service roles require physical presence during set hours, making schedule flexibility less practical.

Despite these findings, the researchers stopped short of recommending a return to five-day schedules. Instead, they called for more tailored approaches — arguing that a blanket four-day policy may not suit every workplace. Dr. Oduya said companies should consider hybrid models that give employees some control over their schedules rather than applying a one-size-fits-all rule.

The federal government has been conducting its own pilot program with public sector employees since 2022 and has not yet released its findings. A spokesperson said results are expected later this year.`,
    questions: [
      {
        num: 1,
        question: 'What is the main finding of the University of Harwick study?',
        options: {
          A: 'Four-day work weeks are universally beneficial.',
          B: 'The benefits of four-day work weeks are more complex and less lasting than often claimed.',
          C: 'Knowledge workers perform better with five-day schedules.',
          D: 'Service-sector employees prefer shorter work weeks.',
        },
        answer: 'B',
        explanation: 'The anchor says the study found "a more complex picture" — initial gains faded after 12–18 months in many cases.',
      },
      {
        num: 2,
        question: 'How long did the Harwick study run?',
        options: {
          A: '12 to 18 months',
          B: '2 years',
          C: '3 years',
          D: '5 years',
        },
        answer: 'C',
        explanation: 'The broadcast states the study "followed 200 companies over three years."',
      },
      {
        num: 3,
        question: 'According to Dr. Oduya, why did service-sector employees benefit less from four-day work weeks?',
        options: {
          A: 'They tend to work from home and already have flexible schedules.',
          B: 'Their roles require physical presence during fixed hours.',
          C: 'They were not included in the original pilot programs.',
          D: 'Management in service sectors opposed the changes.',
        },
        answer: 'B',
        explanation: 'Dr. Oduya attributed the gap to service roles requiring "physical presence during set hours, making schedule flexibility less practical."',
      },
      {
        num: 4,
        question: 'What does the study recommend instead of returning to five-day weeks?',
        options: {
          A: 'A universal three-day weekend policy',
          B: 'Government regulation of working hours',
          C: 'Tailored approaches that give employees schedule control',
          D: 'Extended trial periods before adopting any new schedule',
        },
        answer: 'C',
        explanation: 'Dr. Oduya called for "hybrid models that give employees some control over their schedules rather than applying a one-size-fits-all rule."',
      },
      {
        num: 5,
        question: 'What do we know about the federal government\'s own pilot program?',
        options: {
          A: 'It concluded in 2022 with positive results.',
          B: 'It has been running since 2022 and results are pending.',
          C: 'It was cancelled after the Harwick study was published.',
          D: 'It applies only to healthcare workers.',
        },
        answer: 'B',
        explanation: 'The broadcast says the government pilot has been running "since 2022" and results "are expected later this year."',
      },
    ],
  },
  {
    id: 'l5-s1',
    skill: 'LISTENING',
    part: 5,
    partName: 'Listening to a Discussion',
    source: 'Sample Set 1',
    passage: `[Panel discussion on a local radio program about housing affordability]

HOST: Welcome back to City Matters. I'm joined today by two guests with very different takes on what cities should do about the housing crisis. We have Renata Voss, a housing policy researcher, and Gordon Hale, a developer and founder of Hale Urban Properties. Welcome, both.

RENATA: Thanks for having me.

GORDON: Happy to be here.

HOST: Renata, let's start with you. What's the biggest mistake cities are making on housing?

RENATA: The biggest mistake is treating housing purely as a market commodity. When we leave housing entirely to private developers, profit motives push construction toward high-end units that generate the best returns. That's fine for investors, but it doesn't help families who earn median incomes or less. We need meaningful investment in non-market housing — co-ops, community land trusts, and subsidized rentals.

GORDON: I respect Renata's perspective, but I'd push back on that framing. The reason housing is unaffordable is a supply problem. Cities have made it incredibly difficult to build — through zoning restrictions, lengthy approval processes, and opposition from existing residents who don't want density near them. If we cut red tape and let the market build more, costs will come down across the board.

HOST: But Gordon, critics say that trickle-down approach hasn't worked — cities have built plenty of condos, and prices are still rising.

GORDON: That's a fair point, but in cities where building has been consistently restricted — like many Canadian cities — even luxury supply matters because it frees up older units for lower-income renters. The evidence from Tokyo and Houston, where zoning is permissive, shows that more building does moderate prices.

RENATA: I don't disagree that supply matters, but Tokyo's model involves a lot of publicly driven planning, not just deregulation. And Houston's affordability comes with significant costs — sprawl, car dependency, and lack of green space. We shouldn't cherry-pick examples without looking at the full picture. Cities need to build more, yes, but they need to build the right things in the right ways.

HOST: What about the role of foreign investors and short-term rentals like Airbnb?

RENATA: Absolutely a contributing factor, particularly in major cities. Homes being used as investments rather than housing removes units from the long-term rental market. Cities should be empowering municipalities to apply vacancy taxes and restrict short-term rentals more aggressively.

GORDON: I'm more cautious there. Vacancy taxes are hard to administer and can have unintended consequences. Short-term rental restrictions hit small landlords as much as large platforms — someone renting a room to cover their mortgage isn't the same as a corporation owning dozens of units. Regulation needs to be targeted.

HOST: We'll have to leave it there for now. Thank you both for a thoughtful conversation.`,
    questions: [
      {
        num: 1,
        question: 'What does Renata Voss say is the biggest mistake cities are making?',
        options: {
          A: 'Investing too heavily in public housing',
          B: 'Treating housing as a market commodity and ignoring non-market options',
          C: 'Allowing too many short-term rentals',
          D: 'Restricting construction in downtown cores',
        },
        answer: 'B',
        explanation: 'Renata says "the biggest mistake is treating housing purely as a market commodity" and argues for non-market housing like co-ops and subsidized rentals.',
      },
      {
        num: 2,
        question: 'What does Gordon Hale say is the root cause of unaffordable housing?',
        options: {
          A: 'Speculation by foreign investors',
          B: 'A lack of non-market housing construction',
          C: 'Insufficient supply caused by restrictive zoning and approvals',
          D: 'High interest rates making mortgages unaffordable',
        },
        answer: 'C',
        explanation: 'Gordon says "The reason housing is unaffordable is a supply problem" caused by "zoning restrictions, lengthy approval processes, and opposition from existing residents."',
      },
      {
        num: 3,
        question: 'What examples does Gordon use to support his argument?',
        options: {
          A: 'London and New York, where rents have stabilized recently',
          B: 'Tokyo and Houston, where permissive zoning has moderated prices',
          C: 'Vancouver and Toronto, where supply is still insufficient',
          D: 'Germany and Sweden, where public housing is dominant',
        },
        answer: 'B',
        explanation: 'Gordon says "The evidence from Tokyo and Houston, where zoning is permissive, shows that more building does moderate prices."',
      },
      {
        num: 4,
        question: 'How does Renata respond to Gordon\'s use of Tokyo as an example?',
        options: {
          A: 'She agrees that Tokyo\'s model is ideal for Canadian cities.',
          B: 'She argues Tokyo\'s success is due to public planning, not just deregulation.',
          C: 'She says Tokyo has very different demographic trends.',
          D: 'She claims Tokyo\'s housing is still unaffordable by global standards.',
        },
        answer: 'B',
        explanation: 'Renata says "Tokyo\'s model involves a lot of publicly driven planning, not just deregulation," cautioning against cherry-picking examples.',
      },
      {
        num: 5,
        question: 'On what point do both Renata and Gordon AGREE?',
        options: {
          A: 'Foreign investment is the main driver of housing unaffordability.',
          B: 'Cities need to build more housing.',
          C: 'Vacancy taxes are an effective policy tool.',
          D: 'Short-term rentals should be completely banned.',
        },
        answer: 'B',
        explanation: 'Renata says "Cities need to build more, yes, but they need to build the right things." Gordon argues for cutting restrictions to enable more building. Both agree more supply is needed.',
      },
      {
        num: 6,
        question: 'What concern does Gordon raise about short-term rental restrictions?',
        options: {
          A: 'They would reduce tourism revenue for cities.',
          B: 'They cannot be enforced by local governments.',
          C: 'They affect small landlords as much as large platforms.',
          D: 'They would make vacant homes harder to sell.',
        },
        answer: 'C',
        explanation: 'Gordon says restrictions "hit small landlords as much as large platforms," giving the example of "someone renting a room to cover their mortgage."',
      },
    ],
  },
  {
    id: 'l6-s1',
    skill: 'LISTENING',
    part: 6,
    partName: 'Listening to Viewpoints',
    source: 'Sample Set 1',
    passage: `[Monologue by a climate scientist giving a public lecture]

Thank you for the opportunity to speak today. I want to talk about something that doesn't get enough attention in climate discussions: the tension between urgency and accuracy in public communication.

We are living through what many scientists, myself included, consider a genuine climate emergency. The Intergovernmental Panel on Climate Change has been clear: global average temperatures have already risen by approximately 1.1 degrees Celsius above pre-industrial levels, and without aggressive intervention, we are on track for between 2.5 and 4 degrees of warming by the end of the century — a scenario with deeply destabilizing consequences.

Given this urgency, many advocates argue that scientists should communicate with alarm rather than careful qualification. And I understand the logic — public attention is finite, and stark messaging cuts through. But I worry that this approach carries its own risks.

When scientists overstate or sensationalize — when we claim certainty we don't have — we invite legitimate criticism. And that criticism, justified or not, gives ammunition to those who want to dismiss climate science altogether. Trust in science is a long-term asset, and it is fragile. I've seen it damaged by well-intentioned exaggeration just as much as by deliberate misinformation.

That said, I am not arguing for false balance — presenting two equally weighted "sides" when the scientific consensus is overwhelming. Ninety-seven percent of actively publishing climate scientists agree on the fundamentals. That is not a debate. Presenting it as one is itself a distortion.

What I am advocating for is what I call "calibrated urgency" — communicating risk honestly, acknowledging uncertainty where it exists, but not allowing that uncertainty to become an excuse for inaction. The appropriate response to a fire alarm is not to wait for a full investigation before leaving the building. But it also shouldn't involve fabricating additional smoke.

I believe the public is more capable of holding nuanced truths than we sometimes give them credit for. Our job as scientists is not just to raise the alarm — it is to equip people with the most accurate picture we can so they can make informed decisions.

Thank you.`,
    questions: [
      {
        num: 1,
        question: 'What is the speaker\'s main concern about climate communication?',
        options: {
          A: 'Scientists are not speaking out frequently enough on climate issues.',
          B: 'Overstating certainty can damage trust in science.',
          C: 'Public attention to climate change is declining.',
          D: 'Media outlets are suppressing accurate climate information.',
        },
        answer: 'B',
        explanation: 'The speaker says: "Trust in science is a long-term asset... I\'ve seen it damaged by well-intentioned exaggeration." Their concern is that overclaiming erodes credibility.',
      },
      {
        num: 2,
        question: 'What projected warming does the speaker describe as possible by the end of the century without intervention?',
        options: {
          A: '1.1 degrees Celsius',
          B: '2.0 degrees Celsius',
          C: '2.5 to 4 degrees Celsius',
          D: '5 to 6 degrees Celsius',
        },
        answer: 'C',
        explanation: 'The speaker states: "we are on track for between 2.5 and 4 degrees of warming by the end of the century."',
      },
      {
        num: 3,
        question: 'What does the speaker mean by "false balance"?',
        options: {
          A: 'Reporting data that has not been peer reviewed',
          B: 'Giving equal weight to climate denial and scientific consensus',
          C: 'Showing only the most extreme climate projections',
          D: 'Balancing economic and environmental concerns equally',
        },
        answer: 'B',
        explanation: 'The speaker defines it as "presenting two equally weighted \'sides\' when the scientific consensus is overwhelming" — which distorts reality.',
      },
      {
        num: 4,
        question: 'What term does the speaker use to describe their preferred communication approach?',
        options: {
          A: 'Urgent realism',
          B: 'Cautious advocacy',
          C: 'Calibrated urgency',
          D: 'Scientific neutrality',
        },
        answer: 'C',
        explanation: 'The speaker explicitly coins the phrase "calibrated urgency" to describe communicating risk honestly while acknowledging uncertainty.',
      },
      {
        num: 5,
        question: 'What does the speaker say about the 97% statistic?',
        options: {
          A: 'It refers to the percentage of countries that have signed climate agreements.',
          B: 'It represents the proportion of climate scientists who agree on the fundamentals.',
          C: 'It measures the likelihood of exceeding 2 degrees of warming.',
          D: 'It is often misquoted by both sides of the debate.',
        },
        answer: 'B',
        explanation: 'The speaker says "Ninety-seven percent of actively publishing climate scientists agree on the fundamentals." This is about scientific consensus, not a treaty statistic.',
      },
      {
        num: 6,
        question: 'What does the fire alarm analogy in the speech illustrate?',
        options: {
          A: 'Climate risk requires immediate action even without complete certainty.',
          B: 'Scientists should wait for full data before making public statements.',
          C: 'False alarms are more damaging than real ones.',
          D: 'The public needs to be protected from alarming climate information.',
        },
        answer: 'A',
        explanation: 'The speaker says the right response to a fire alarm isn\'t to wait for an investigation — meaning uncertainty shouldn\'t prevent action, just as you don\'t need proof of a fire to evacuate.',
      },
    ],
  },
];

// ─────────────────────────────────────────────
// WRITING — 2 Tasks
// Task 1: Writing an Email
// Task 2: Responding to Survey Questions
// ─────────────────────────────────────────────

export const WRITING_SETS: WritingSet[] = [
  {
    id: 'w1-s1',
    skill: 'WRITING',
    part: 1,
    partName: 'Writing an Email',
    source: 'Sample Set 1',
    timeAllowed: '27 minutes',
    wordCount: '150–200 words',
    task: `A friend of yours is moving to your city from another country and needs help finding a place to live. Your friend has asked you for advice on what to look for and where to start.

Write an email to your friend. In your email:
• Suggest two or three specific neighbourhoods or areas and explain why
• Recommend one or two useful resources for finding accommodation
• Offer to help in at least one specific way`,
    sampleResponse: `Subject: Welcome to the city — tips for finding a place!

Hi Amara,

I'm so excited you're finally making the move! Finding the right neighbourhood is really important, so let me share a few thoughts.

I'd recommend looking at Riverdale or Northwood first. Riverdale has great transit connections and is close to the downtown core, so your commute would be easy. Northwood is a bit quieter and more affordable — perfect if you'd like more space. Both areas have good grocery stores and parks nearby.

For finding listings, I'd suggest checking Kijiji and Zumper. Both sites are updated daily and let you filter by price, size, and location. You can also join a few Facebook rental groups specific to the city — landlords often post there before putting ads on the big sites.

I know apartment hunting from abroad can feel overwhelming, so I'm happy to go to viewings on your behalf before you arrive. Just send me the listings you like and I'll check them out for you.

Can't wait to have you here!

Warm regards,
[Your name]`,
    scoringTips: [
      'Address ALL three bullet points — missing one will significantly lower your score.',
      'Use a friendly but clear tone appropriate for an email to a friend.',
      'Include specific details (neighbourhood names, website names) to demonstrate range and precision.',
      'Aim for 150–200 words. Going slightly over is acceptable; going significantly under is penalized.',
      'Use appropriate email conventions: a subject line, greeting, and closing.',
      'Vary your vocabulary — avoid repeating the same words (e.g., "place" / "apartment" / "listing" / "accommodation").',
    ],
  },
  {
    id: 'w2-s1',
    skill: 'WRITING',
    part: 2,
    partName: 'Responding to Survey Questions',
    source: 'Sample Set 1',
    timeAllowed: '26 minutes',
    wordCount: '150–200 words per response',
    task: `Read the following survey questions and write your responses.

Question 1: Your city is planning to redevelop a vacant lot near the downtown core. Some residents want it turned into a public park; others want affordable housing built there. Which option do you support, and why?

Question 2: Some people believe that working from home full-time is better for employees, while others prefer going to an office. Describe an advantage AND a disadvantage of each option.`,
    sampleResponse: `Question 1:
I believe the vacant lot should be used for affordable housing. While a park would certainly be a welcome addition to the downtown area, the city already faces a serious housing shortage. Many low- and middle-income residents are being priced out of the neighbourhood, and adding new housing units near transit and services would directly address this problem. Parks are valuable, but there are already several green spaces within walking distance of that location. Prioritizing housing would create lasting benefits for hundreds of families who need a place to live, whereas a park primarily benefits existing residents who can already afford to stay in the area.

Question 2:
Working from home offers flexibility, which helps employees balance personal responsibilities such as childcare or medical appointments. However, it can lead to feelings of isolation and make collaboration more difficult. Going into an office provides structure and makes face-to-face teamwork easier, which is especially important for creative projects. On the other hand, daily commutes add stress, cost, and time to an employee's day. Ultimately, the best arrangement depends on the individual's role and personal circumstances.`,
    scoringTips: [
      'Answer BOTH questions fully. Each response should be 150–200 words.',
      'For opinion questions, take a clear position and support it with specific reasons — avoid being neutral.',
      'For Question 2 (advantage/disadvantage), make sure you cover BOTH options AND provide both an advantage and a disadvantage of each.',
      'Use linking words to connect ideas: "However," "In addition," "On the other hand," "As a result."',
      'Avoid bullet points in your response — write in proper paragraphs.',
      'Demonstrate a range of vocabulary; avoid repeating the same adjectives.',
      'Proofread for grammar errors, especially subject-verb agreement and verb tense consistency.',
    ],
  },
];

// ─────────────────────────────────────────────
// SPEAKING — 8 Tasks
// ─────────────────────────────────────────────

export const SPEAKING_SETS: SpeakingSet[] = [
  {
    id: 's1-s1',
    skill: 'SPEAKING',
    part: 1,
    partName: 'Giving Advice',
    source: 'Sample Set 1',
    situation: 'Your friend is starting a new job next week and is very nervous. They have asked you for advice on how to make a good impression on their first day.',
    prompt: 'Give your friend 3 or 4 pieces of advice about how to succeed on their first day at a new job.',
    preparationTime: '30 seconds',
    responseTime: '90 seconds',
    sampleResponse: `Starting a new job can feel overwhelming, but a few small things can make a big difference.

First, I'd suggest arriving early — not just on time, but maybe 10 to 15 minutes before your shift starts. This gives you time to settle in, and it shows your employer that you're reliable and take the job seriously.

Second, try to listen more than you talk, especially in the beginning. Every workplace has its own way of doing things, and the fastest way to learn is to observe how people interact and what's expected before you jump in with your own ideas.

Third, introduce yourself to as many coworkers as possible and try to remember their names. People appreciate it when you make the effort to connect with them, and it helps you feel less like an outsider.

Finally, don't be afraid to ask questions if you're unsure about something. Asking early is much better than making a mistake because you assumed. Just make sure you're not asking the same question twice — take notes if you need to.

I hope your first day goes really well!`,
    scoringTips: [
      'Give exactly what the prompt asks: 3 or 4 pieces of advice — no more, no less.',
      'Use advice language naturally: "I\'d suggest," "It might help to," "One thing you could do is."',
      'Speak at a natural pace — not too fast. Aim for clear pronunciation over speed.',
      'Support each piece of advice with a brief reason (the "why" shows stronger English).',
      'End with a natural closing rather than stopping abruptly mid-thought.',
      'Aim to fill most of the 90 seconds without obviously padding your answer.',
    ],
  },
  {
    id: 's2-s1',
    skill: 'SPEAKING',
    part: 2,
    partName: 'Talking About a Personal Experience',
    source: 'Sample Set 1',
    situation: 'You are speaking with a friend.',
    prompt: 'Describe a time when you had to adapt to a significant change in your life. What was the change, how did you adapt, and what did you learn from the experience?',
    preparationTime: '30 seconds',
    responseTime: '60 seconds',
    sampleResponse: `A few years ago, I moved to a completely new city for work. I didn't know anyone there, and it was honestly quite disorienting at first.

To adapt, I decided to be intentional about building a routine quickly. I found a gym nearby, started exploring local coffee shops on weekends, and joined a community language class — partly to meet people and partly to improve my language skills.

The biggest change I had to make was becoming comfortable with being alone. Back home, I was always surrounded by family and friends, so the silence felt strange at first. Over time, I learned to use that quiet time productively — reading, cooking new recipes, and reflecting on what I actually wanted from life.

The most important thing I learned is that adapting isn't about being happy all the time — it's about building small routines and connections until your new place starts to feel like home. Looking back, that transition made me much more independent and resilient than I would have been otherwise.`,
    scoringTips: [
      'Structure your answer clearly: what was the change → how you adapted → what you learned.',
      'Use past tense correctly and consistently throughout.',
      'Be specific — mention actual actions you took, not vague generalities.',
      'You only have 60 seconds, so don\'t spend too long on the first part (setting up the story).',
      'Transition phrases help: "At first," "Over time," "Looking back," "As a result."',
      'End with the lesson or insight — this is what examiners are listening for.',
    ],
  },
  {
    id: 's3-s1',
    skill: 'SPEAKING',
    part: 3,
    partName: 'Describing a Scene',
    source: 'Sample Set 1',
    prompt: `Look at the image description below and describe what you see in as much detail as possible.

[IMAGE: A busy farmers\' market on a sunny Saturday morning. In the foreground, a vendor is arranging colourful vegetables on a wooden table. A young woman in a yellow jacket is examining a bunch of herbs. Two children are sitting on a low bench nearby, eating corn on the cob. In the background, a row of white canopy tents stretches into the distance, with shoppers browsing produce, flowers, and baked goods. A dog on a leash is sniffing the ground near a bakery stand.]`,
    preparationTime: '30 seconds',
    responseTime: '60 seconds',
    sampleResponse: `In this image, I can see a lively outdoor farmers' market taking place on what appears to be a bright sunny day.

In the foreground, a vendor is carefully arranging colourful vegetables — things like peppers and tomatoes — on a rustic wooden table. Nearby, a young woman wearing a distinctive yellow jacket is closely examining a bunch of fresh herbs, perhaps deciding whether to buy them.

Sitting on a low bench close by, two children are happily eating corn on the cob, which adds a fun, casual atmosphere to the scene.

If I look further into the background, I can see a long row of white canopy tents extending into the distance. Shoppers are browsing under them — I can make out a variety of stalls selling fresh produce, flowers, and what look like baked goods.

Near one of the bakery stands, a dog on a leash is sniffing the ground, which suggests many families have come to enjoy the market together.

Overall, the scene feels warm, lively, and community-focused — a typical weekend market atmosphere.`,
    scoringTips: [
      'Move systematically through the image: foreground → middle ground → background.',
      'Use spatial language: "In the foreground," "On the left," "In the background," "Nearby."',
      'Describe what you see AND what you can infer ("appears to be," "suggests that").',
      'Mention colours, actions, and relationships between people/objects.',
      'Don\'t just list items — connect them into flowing descriptions.',
      'Use the full 60 seconds. Organized, detailed answers score better than quick, sparse ones.',
    ],
  },
  {
    id: 's4-s1',
    skill: 'SPEAKING',
    part: 4,
    partName: 'Making Predictions',
    source: 'Sample Set 1',
    situation: 'You are talking with a friend who is interested in technology.',
    prompt: 'Many experts believe that artificial intelligence will significantly change the job market in the next 10 to 20 years. What changes do you think AI will bring to the workplace, and how should people prepare?',
    preparationTime: '30 seconds',
    responseTime: '90 seconds',
    sampleResponse: `I think AI is going to transform the job market in some pretty dramatic ways over the next couple of decades.

On the one hand, we're likely to see a lot of routine or repetitive tasks automated. Things like data entry, basic customer service, and certain types of manufacturing work will probably be handled by AI systems, which means some jobs will disappear or shrink significantly.

At the same time, though, I think new jobs will emerge that we can't fully predict yet. Just like how the internet created entirely new industries and roles, AI will likely do the same. Jobs that require creativity, empathy, and complex problem-solving — like therapy, education, or leadership roles — are less likely to be replaced because they rely on uniquely human skills.

As for how people should prepare: I'd say the most important thing is to focus on adaptability. That means staying curious, being willing to learn new tools, and developing skills that complement rather than compete with AI — things like critical thinking, communication, and collaboration.

I also think companies and governments have a responsibility here — investing in retraining programs and making sure the benefits of AI are distributed fairly rather than just concentrated at the top.`,
    scoringTips: [
      'Make specific, concrete predictions — not just "things will change."',
      'Use future tense and hedging language: "is likely to," "will probably," "I think," "might."',
      'Address BOTH parts: changes AND preparation.',
      'Balance optimistic and critical perspectives for a well-rounded answer.',
      'Use discourse markers: "On the one hand," "At the same time," "As for."',
      'Aim to speak for close to the full 90 seconds with organized, fluent delivery.',
    ],
  },
  {
    id: 's5-s1',
    skill: 'SPEAKING',
    part: 5,
    partName: 'Comparing and Persuading',
    source: 'Sample Set 1',
    situation: 'You are talking with a colleague at work.',
    prompt: `Your company is planning a team-building event. You have been asked to choose between two options:

Option A: A full-day outdoor hiking trip at a provincial park, 90 minutes outside the city.
Option B: A half-day cooking class in the city, followed by a shared meal.

Compare the two options and persuade your colleague that one option is better for the team.`,
    preparationTime: '60 seconds',
    responseTime: '60 seconds',
    sampleResponse: `Both options have their merits, but I'd strongly recommend the cooking class for our team.

The hiking trip sounds great in theory — fresh air, exercise, and time away from the office. But it does come with some real practical concerns. A 90-minute drive each way means we're spending three hours just in transit, which eats into the day significantly. And not everyone on our team is comfortable with long hikes — some colleagues have health conditions or physical limitations that could make them feel excluded rather than included.

The cooking class, on the other hand, is accessible to everyone regardless of fitness level. It's also genuinely interactive — people have to communicate, divide tasks, and work together to produce a meal, which naturally builds teamwork in a fun, low-pressure environment. And then everyone gets to enjoy the results together, which gives the event a really satisfying ending.

I also think the shared meal element is underrated. Some of the best conversations happen over food. It's informal, relaxed, and gives people a chance to connect in a way that a structured outdoor activity sometimes doesn't allow.

For a diverse team like ours, I think the cooking class is simply the smarter choice.`,
    scoringTips: [
      'Compare BOTH options before making your recommendation — don\'t just talk about the one you chose.',
      'Be persuasive: give reasons your listener would find compelling, not just personal preferences.',
      'Use comparative language: "more accessible," "less time-consuming," "a better fit for."',
      'Acknowledge the strengths of the option you\'re not choosing — this shows balance.',
      'Be direct about your recommendation and end confidently.',
      'You only have 60 seconds, so get to your recommendation quickly after a brief comparison.',
    ],
  },
  {
    id: 's6-s1',
    skill: 'SPEAKING',
    part: 6,
    partName: 'Dealing with a Difficult Situation',
    source: 'Sample Set 1',
    situation: 'You are speaking with your landlord.',
    prompt: 'Your landlord has sent you a notice saying your rent will increase by 20% starting next month. You believe this increase is unreasonable and possibly against local regulations. Call your landlord and explain your concerns, ask questions, and propose a solution.',
    preparationTime: '60 seconds',
    responseTime: '60 seconds',
    sampleResponse: `Hi, this is [name] calling about the rent increase notice I received earlier this week. I appreciate you sending the notice in advance, but I do have some concerns I'd like to discuss with you.

A 20% increase is quite significant — that's substantially above what I've seen in most rental guidelines. In our province, rent increases are typically subject to the annual rent increase guideline set by the government. If I'm not mistaken, this year's guideline is around 2.5%. I wanted to check with you directly before taking any further steps — is there a specific reason this increase falls outside the guideline?

I do want to be fair. If there have been major renovations or circumstances I'm not aware of, I'm open to having that conversation. But I'd appreciate you providing documentation or explanation to support an increase of this size.

In the meantime, I'd like to propose that we apply an increase that falls within the provincial guideline. This keeps things fair for both of us and avoids any formal disputes. I've been a reliable tenant for two years, and I'd like to continue renting here on good terms.

Could we find a time this week to talk this through? I'm available most evenings. Thank you for your time.`,
    scoringTips: [
      'Be assertive but polite — this is a sensitive negotiation, not an argument.',
      'State your concern clearly at the start: "I have some concerns about..."',
      'Reference facts or regulations to strengthen your position.',
      'Show willingness to understand the other party\'s perspective.',
      'End with a specific, concrete proposal and a next step.',
      'Use formal but natural language appropriate for a landlord-tenant conversation.',
    ],
  },
  {
    id: 's7-s1',
    skill: 'SPEAKING',
    part: 7,
    partName: 'Expressing Opinions',
    source: 'Sample Set 1',
    situation: 'You are in a conversation with a classmate.',
    prompt: 'Some people believe that university education should be free for all citizens, funded entirely by the government. Do you agree or disagree? Give your opinion with specific reasons and examples.',
    preparationTime: '30 seconds',
    responseTime: '90 seconds',
    sampleResponse: `I partially agree with this idea, though I think the reality is more nuanced than a straightforward yes or no.

On one hand, I strongly believe that cost should not be the reason talented people can't access higher education. Right now, many students from lower-income backgrounds graduate with enormous debt, which shapes the choices they make — they're often forced into high-paying fields just to repay loans, even if their true passion lies in teaching, social work, or the arts. A society that funds education broadly invests in its own future.

That said, I don't think entirely free university is the most efficient use of public money in all cases. There are countries like Germany and Norway where tuition is free or nearly free, and it works well — but it requires very high tax revenues and strong institutional systems to maintain quality.

A more practical approach might be a hybrid model: free or heavily subsidized education for students who demonstrate financial need, combined with income-based repayment systems that mean graduates only pay back what they can afford. This balances accessibility with fiscal responsibility.

So in short — I agree with the goal of making university genuinely accessible, but I'd advocate for smart, targeted funding rather than a blanket free-for-all policy.`,
    scoringTips: [
      'State your position clearly within the first few seconds.',
      'Give at least two reasons to support your view.',
      'Use examples — real countries, situations, or scenarios — to add depth.',
      'Acknowledging counterarguments and addressing them shows sophisticated reasoning.',
      'Use opinion language: "I strongly believe," "In my view," "It seems to me."',
      'Aim for a clear conclusion that echoes your opening position.',
    ],
  },
  {
    id: 's8-s1',
    skill: 'SPEAKING',
    part: 8,
    partName: 'Describing an Unusual Situation',
    source: 'Sample Set 1',
    situation: 'You are leaving a voicemail for a friend.',
    prompt: 'You arrived at the airport for a flight, only to discover that your flight was cancelled with no advance notice. You are stranded at the airport with no accommodation arranged. Leave a voicemail for a friend who lives nearby, explaining the situation and asking for help.',
    preparationTime: '30 seconds',
    responseTime: '60 seconds',
    sampleResponse: `Hey Sarah, it's me — I'm really sorry to be calling with this but I'm in a bit of a situation and I need your help.

So I arrived at the airport this afternoon for my flight to Vancouver, and when I got to the gate, I found out the flight has been completely cancelled — apparently there was a mechanical issue and there are no other flights available until tomorrow morning. The airline wasn't able to give me much advance notice, so I'm basically stranded here at the airport with no hotel booked.

I was wondering — and I completely understand if it's not possible — but would there be any chance I could stay at your place tonight? I know it's short notice, so if you can't, no worries at all and I'll figure something else out. But if it's okay, I could probably get to your place by around 7 tonight using the airport express train.

Could you give me a call back when you get this? I'm at the departures hall right now. I hope you're home — you'd really be saving me tonight!

Thanks so much. Talk soon.`,
    scoringTips: [
      'Start by identifying yourself and setting up the voicemail context.',
      'Explain the situation clearly: what happened, where you are, what you need.',
      'Use a natural, conversational but urgent tone — this is a real situation.',
      'Show politeness: acknowledge it\'s an imposition, offer an out ("if you can\'t, no worries").',
      'Include practical details: timing, how you\'d get there.',
      'End with a clear call to action and a warm closing.',
    ],
  },
];

// ─────────────────────────────────────────────
// Master index
// ─────────────────────────────────────────────

export const ALL_PAST_SETS: PastQuestionSet[] = [
  ...READING_SETS,
  ...LISTENING_SETS,
  ...WRITING_SETS,
  ...SPEAKING_SETS,
];

export function getSets(skill: Skill): PastQuestionSet[] {
  return ALL_PAST_SETS.filter((s) => s.skill === skill);
}

export function getSet(id: string): PastQuestionSet | undefined {
  return ALL_PAST_SETS.find((s) => s.id === id);
}
