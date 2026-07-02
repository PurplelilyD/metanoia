"use client";

import { useEffect, useRef, useState } from "react";
import {
  Flame,
  Moon,
  Sun,
  Waves,
  BookOpen,
  Church,
  HeartHandshake,
  Layers,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TemperamentKey = "choleric" | "melancholic" | "sanguine" | "phlegmatic";

interface Question {
  id: number;
  temperament: TemperamentKey; // hidden from the user, used only for scoring
  text: string;
}

interface ListItem {
  title: string;
  body: string;
}

interface Profile {
  key: TemperamentKey;
  profileName: string;
  icon: LucideIcon;
  soulMeets: string;
  intro: string[];
  invitation: string[];
  strengthsIntro: string;
  strengths: ListItem[];
  strengthsClosing: string;
  trapName: string;
  trapIntro: string[];
  trapListA: string[];
  trapMiddle: string;
  trapDefinition: string;
  trapListB: string[];
  blindspots: ListItem[];
  desolationSummary: string;
  desolationClosing: string[];
  consolationText: string;
  desolationText: string;
  practiceName: string;
  practiceIntro: string;
  practiceSteps: ListItem[];
  keyQuestion: string;
  additionalPracticeName: string;
  additionalPracticeBody: string[];
  patronName: string;
  patronBody: string[];
  patronInvitation: string[];
}

/* ------------------------------------------------------------------ */
/*  Question bank                                                      */
/* ------------------------------------------------------------------ */

const QUESTIONS: Question[] = [
  { id: 1, temperament: "choleric", text: "When something at work, home, or parish feels disorganised, my first instinct is to step in, take charge, and get things moving." },
  { id: 2, temperament: "choleric", text: "I feel most alive when I am building something meaningful for God, such as leading a project, solving a problem, or improving a ministry." },
  { id: 3, temperament: "choleric", text: "When people are slow, unclear, or indecisive, I can become impatient because I already see what needs to be done." },
  { id: 4, temperament: "choleric", text: "In prayer, I sometimes struggle to simply rest with God because I feel I should be doing more, achieving more, or fixing something." },
  { id: 5, temperament: "melancholic", text: "I often replay conversations, decisions, or sins in my mind, wondering whether I did the right thing or could have done better." },
  { id: 6, temperament: "melancholic", text: "I am drawn to quiet prayer, beauty, sacred music, silence, or order because they help me feel close to God." },
  { id: 7, temperament: "melancholic", text: "When I fall short spiritually, I can be very hard on myself and may feel unworthy to approach God until I have \"sorted myself out.\"" },
  { id: 8, temperament: "melancholic", text: "I prefer to understand things deeply before acting, even if others think I am overthinking or taking too long." },
  { id: 9, temperament: "sanguine", text: "I feel spiritually encouraged when I am surrounded by joyful people, meaningful conversations, praise, fellowship, or parish community." },
  { id: 10, temperament: "sanguine", text: "I often start prayer routines, spiritual books, or parish commitments with enthusiasm, but I can struggle to continue once the excitement fades." },
  { id: 11, temperament: "sanguine", text: "When I am stressed, I usually look for someone to talk to, laugh with, or be around so I do not feel alone." },
  { id: 12, temperament: "sanguine", text: "I can say yes quickly to activities, ministries, or gatherings, then later realise I may have overcommitted myself." },
  { id: 13, temperament: "phlegmatic", text: "I feel closest to God through simple, steady, peaceful practices rather than intense spiritual experiences or complicated plans." },
  { id: 14, temperament: "phlegmatic", text: "When conflict arises at work, home, or parish, I tend to stay quiet or give way because I do not want to make things worse." },
  { id: 15, temperament: "phlegmatic", text: "I often know what I should do spiritually or practically, but I delay starting because it feels easier to keep things as they are." },
  { id: 16, temperament: "phlegmatic", text: "I am usually dependable and calm, but I may avoid difficult conversations or bold decisions unless someone else pushes me." },
];

const SCALE_LABELS: Record<number, string> = {
  1: "Not at all like me",
  2: "Slightly like me",
  3: "Sometimes like me",
  4: "Mostly like me",
  5: "Very much like me",
};

const GROUPS: Record<TemperamentKey, number[]> = {
  choleric: [1, 2, 3, 4],
  melancholic: [5, 6, 7, 8],
  sanguine: [9, 10, 11, 12],
  phlegmatic: [13, 14, 15, 16],
};

const TEMPERAMENT_LABEL: Record<TemperamentKey, string> = {
  choleric: "Choleric",
  melancholic: "Melancholic",
  sanguine: "Sanguine",
  phlegmatic: "Phlegmatic",
};

const PERFECTIONISM_NOTE =
  "Your desire to love God well is sincere. But be careful not to confuse the voice of God with the voice of relentless self-accusation. The Holy Spirit convicts with clarity and hope. Desolation accuses with heaviness and despair.";

/* ------------------------------------------------------------------ */
/*  Blend notes                                                        */
/* ------------------------------------------------------------------ */

interface BlendNote {
  title: string;
  strengths: string;
  risk: string;
  pastoral: string;
}

const BLEND_NOTES: Record<string, BlendNote> = {
  "choleric-melancholic": {
    title: "Choleric + Melancholic — The Intense Achiever-Reflector",
    strengths:
      "Disciplined, purposeful, serious, principled, capable of deep work and leadership.",
    risk: "Harsh self-expectations, control, perfectionism, spiritual pressure.",
    pastoral: "God is not asking you to become your own saviour.",
  },
  "choleric-sanguine": {
    title: "Choleric + Sanguine — The Charismatic Leader",
    strengths:
      "Inspiring, energetic, persuasive, community-building, action-oriented.",
    risk: "Overcommitting, impatience, needing visible results, moving too quickly.",
    pastoral: "The Holy Spirit is not always in the loudest momentum.",
  },
  "choleric-phlegmatic": {
    title: "Choleric + Phlegmatic — The Steady Organiser",
    strengths:
      "Practical, dependable, calm under pressure, able to lead without excessive drama.",
    risk: "Quiet stubbornness, delayed emotional processing, frustration when pushed too far.",
    pastoral: "Strength should remain open to tenderness.",
  },
  "melancholic-sanguine": {
    title: "Melancholic + Sanguine — The Sensitive Relational",
    strengths:
      "Emotionally rich, compassionate, expressive, creative, able to connect deeply.",
    risk: "Mood swings, approval-seeking, overthinking relationships, feeling spiritually unstable.",
    pastoral: "Your feelings are real, but they are not always the final truth.",
  },
  "melancholic-phlegmatic": {
    title: "Melancholic + Phlegmatic — The Quiet Contemplative",
    strengths: "Gentle, thoughtful, faithful, reflective, reverent, patient.",
    risk: "Withdrawal, discouragement, avoidance, low confidence, fear of burdening others.",
    pastoral: "God may be inviting you out of hiding, not out of gentleness.",
  },
  "phlegmatic-sanguine": {
    title: "Sanguine + Phlegmatic — The Warm Companion",
    strengths: "Approachable, kind, peaceful, friendly, easy to trust.",
    risk: "Lack of follow-through, avoiding hard truths, drifting spiritually, people-pleasing.",
    pastoral: "Love is not only warmth; love also chooses fidelity.",
  },
};

function getBlendKey(a: TemperamentKey, b: TemperamentKey) {
  return [a, b].sort().join("-");
}

/* ------------------------------------------------------------------ */
/*  Profiles                                                            */
/* ------------------------------------------------------------------ */

const PROFILES: Record<TemperamentKey, Profile> = {
  choleric: {
    key: "choleric",
    profileName: "The Mission-Driven Builder",
    icon: Flame,
    soulMeets: "Your soul often meets God through mission.",
    intro: [
      "You are naturally wired for action, responsibility, and purpose. When something matters, you do not want to sit around discussing it endlessly. You want to move, decide, build, lead, fix, and bring things into reality.",
      "This can be a powerful gift in the spiritual life. God often works through people who are willing to carry responsibility, organise others, make courageous decisions, and begin what others are afraid to start.",
      "At your best, you are not simply ambitious. You are apostolic. You want your life to count. You want your faith to bear fruit. You may be drawn to serving in parish leadership, organising retreats, building ministries, mentoring others, solving problems, or bringing structure where there is confusion.",
    ],
    invitation: [
      "God does not only love you when you are useful.",
      "You are not merely His worker. You are His beloved child.",
    ],
    strengthsIntro: "Your temperament is designed to excel in:",
    strengths: [
      { title: "Courageous obedience", body: "You can act when others hesitate. Once you see what is right, you are often willing to move. This gives you strength in difficult seasons where faith requires decision, sacrifice, and endurance." },
      { title: "Leadership and stewardship", body: "You can bring order, direction, and momentum to communities. You may be the person who sees what needs to be done and has the courage to begin." },
      { title: "Zeal for mission", body: "You are not satisfied with a passive faith. You want your prayer, work, and service to matter. This can make you a strong instrument for evangelisation, parish renewal, family leadership, and social impact." },
      { title: "Resilience under pressure", body: "You can keep going when life is demanding. In a fast-paced environment, you may be able to carry responsibilities that others find overwhelming." },
    ],
    strengthsClosing:
      "When surrendered to grace, your drive becomes holy zeal. Your leadership becomes service. Your strength becomes protection for others.",
    trapName: "The Checklist Trap",
    trapIntro: [
      "Your main spiritual danger is not laziness. It is control.",
      "You may unconsciously approach your spiritual life like a project plan:",
    ],
    trapListA: [
      "I prayed.",
      "I served.",
      "I improved.",
      "I fixed the problem.",
      "I completed the task.",
      "I am progressing.",
    ],
    trapMiddle:
      "There is nothing wrong with discipline. But the danger is that prayer becomes performance.",
    trapDefinition:
      "The \"checklist trap\" for you is believing that holiness means producing visible results. But Catholic holiness is not only about effectiveness. It is about union with God.",
    trapListB: [
      "Why are others not as committed?",
      "Why is the parish so inefficient?",
      "Why do I have to do everything?",
      "Why am I still struggling when I am trying so hard?",
      "What is the next thing I must achieve for God?",
    ],
    blindspots: [
      { title: "Pride disguised as responsibility", body: "You may think you are simply being responsible, but beneath that may be a hidden belief that everything depends on you." },
      { title: "Impatience disguised as zeal", body: "You may become frustrated with people who need more time, tenderness, or encouragement." },
      { title: "Control disguised as care", body: "You may say you want what is best, but struggle to let others contribute in their own way." },
      { title: "Prayer as duty, not intimacy", body: "You may know how to work for God, but find it harder to rest with God." },
    ],
    desolationSummary:
      "In Ignatian terms, desolation for you may look like agitation, urgency, irritation, resentment, and the feeling that if you stop, everything will fall apart.",
    desolationClosing: [
      "The voice of God usually does not sound like panic.",
      "The Holy Spirit may challenge you, but He does not bully you.",
    ],
    consolationText:
      "Courageous action, humble leadership, energy for mission, desire to serve rather than control.",
    desolationText:
      "Irritation, control, harshness, resentment when others do not cooperate, prayer becoming another task.",
    practiceName: "Ignatian Examen",
    practiceIntro:
      "The Ignatian Examen is especially helpful for you because it teaches you to notice God's presence, not just your own productivity.",
    practiceSteps: [
      { title: "Give thanks", body: "Begin by naming one gift from the day. This softens the need to control." },
      { title: "Ask for light", body: "Ask the Holy Spirit to show you the truth gently." },
      { title: "Review the day", body: "Notice where you acted from love, and where you acted from pride, fear, impatience, or control." },
      { title: "Ask for mercy", body: "Do not punish yourself. Receive forgiveness." },
      { title: "Choose one grace for tomorrow", body: "Not ten improvements. One grace." },
    ],
    keyQuestion:
      "Lord, where did I serve You today, and where did I try to replace You?",
    additionalPracticeName: "Silent Adoration",
    additionalPracticeBody: [
      "Spend time before the Blessed Sacrament without an agenda. Do not bring a long list. Do not try to \"achieve\" a perfect holy hour.",
      "Simply sit before Christ and let yourself be seen.",
      "This will feel inefficient at first. That is exactly why it is healing.",
    ],
    patronName: "St. Paul the Apostle",
    patronBody: [
      "St. Paul's zeal, courage, leadership, and missionary fire make him a strong companion for you. But his conversion also reveals the purification of the driven soul. His strength had to be humbled before it could become fully fruitful.",
    ],
    patronInvitation: [
      "Your saintly invitation is not to become less strong.",
      "It is to become surrendered.",
    ],
  },

  melancholic: {
    key: "melancholic",
    profileName: "The Deep-Hearted Seeker",
    icon: Moon,
    soulMeets: "Your soul often meets God through depth.",
    intro: [
      "You are naturally reflective, serious, thoughtful, and sensitive to meaning. You do not want a shallow life. You want truth. You want depth. You want beauty. You want things to be real.",
      "You may be drawn to silence, sacred music, Scripture, tradition, reverent liturgy, meaningful conversations, and spaces where the soul can breathe. You may notice details others miss. You may feel deeply, think deeply, and carry questions for a long time.",
      "You may have a strong conscience and a sincere desire to love God well. This is a gift. You probably do not want a casual or careless faith. You want integrity.",
    ],
    invitation: [
      "God's mercy is not a reward for those who have analysed themselves perfectly.",
      "Mercy is the place where the soul begins again.",
    ],
    strengthsIntro: "Your temperament is designed to excel in:",
    strengths: [
      { title: "Depth of prayer", body: "You can enter silence, reflection, and contemplation more naturally than others. You may be able to sit with Scripture, beauty, sorrow, or mystery in a profound way." },
      { title: "Love for truth", body: "You do not want easy answers. You want what is real. This can make you faithful in study, discernment, moral reflection, and spiritual growth." },
      { title: "Reverence and seriousness", body: "You may instinctively understand that God is holy, worship matters, and the interior life should not be treated lightly." },
      { title: "Compassion through suffering", body: "Because you feel deeply, you may become very gentle with others who are wounded, grieving, lonely, or spiritually burdened." },
    ],
    strengthsClosing:
      "When surrendered to grace, your depth becomes wisdom. Your sensitivity becomes compassion. Your seriousness becomes reverence rather than heaviness.",
    trapName: "Excessive Self-Examination",
    trapIntro: [
      "Your main spiritual danger is not superficiality. It is excessive self-examination.",
      "You may unconsciously approach the spiritual life like a moral audit:",
    ],
    trapListA: [
      "Did I pray correctly?",
      "Was that sin mortal or venial?",
      "Did I confess properly?",
      "Was my intention pure enough?",
      "Did I discern correctly?",
      "Am I truly pleasing to God?",
    ],
    trapMiddle:
      "A well-formed conscience is good. But an anxious conscience can become a prison.",
    trapDefinition:
      "Your \"checklist trap\" is believing that holiness requires emotional certainty, perfect clarity, or complete inner purity before you can trust God's love.",
    trapListB: [
      "I should have done better.",
      "Maybe my confession was not complete enough.",
      "Maybe I am not truly sorry.",
      "Maybe God is disappointed in me.",
      "I need to fix myself before I can pray properly.",
    ],
    blindspots: [
      { title: "Scrupulosity disguised as devotion", body: "You may think constant self-checking is holiness, when it may actually be desolation." },
      { title: "Perfectionism disguised as reverence", body: "You may fear making mistakes so much that you delay acting, serving, or receiving joy." },
      { title: "Isolation disguised as depth", body: "You may withdraw because you feel misunderstood, but prolonged isolation may deepen discouragement." },
      { title: "Sorrow mistaken for humility", body: "Feeling bad about yourself is not the same as being humble. True humility receives truth and mercy together." },
    ],
    desolationSummary:
      "In Ignatian terms, desolation for you may sound like accusation, heaviness, hopelessness, looping thoughts, and the feeling that you are never doing enough.",
    desolationClosing: [
      "The Holy Spirit convicts with clarity and hope.",
      "The enemy accuses with confusion and despair.",
      "That distinction is very important for your soul.",
    ],
    consolationText:
      "Peaceful depth, honest repentance without despair, attraction to beauty, truth, silence, and mercy.",
    desolationText:
      "Scrupulosity, discouragement, excessive guilt, analysis paralysis, feeling unworthy of God's mercy.",
    practiceName: "Lectio Divina",
    practiceIntro:
      "Lectio Divina is deeply nourishing for you because it allows Scripture to move from analysis into relationship.",
    practiceSteps: [
      { title: "Read", body: "Slowly read a short Gospel passage." },
      { title: "Reflect", body: "Notice one word, phrase, or image that draws you." },
      { title: "Respond", body: "Speak honestly to God about what is stirred in you." },
      { title: "Rest", body: "Stop analysing. Let God love you." },
    ],
    keyQuestion: "Lord, what word of mercy are You speaking to me today?",
    additionalPracticeName: "Mercy-Based Examen",
    additionalPracticeBody: [
      "Your Examen should not become another self-criticism exercise. Keep it gentle and short.",
      "Use only three questions: Where did I receive love today? Where did I resist love today? What mercy is Jesus offering me now?",
      "Do not spend too long reviewing sins unless guided by a confessor or spiritual director. For your temperament, endless reviewing can become spiritually harmful.",
    ],
    patronName: "St. Thérèse of Lisieux",
    patronBody: [
      "St. Thérèse is a beautiful companion for the sensitive, perfectionistic, deeply interior soul. Her \"little way\" teaches that holiness is not about becoming impressive before God, but about trusting Him like a child.",
    ],
    patronInvitation: [
      "Your saintly invitation is not to care less about holiness.",
      "It is to trust mercy more than self-measurement.",
    ],
  },

  sanguine: {
    key: "sanguine",
    profileName: "The Joyful Witness",
    icon: Sun,
    soulMeets: "Your soul often meets God through community and joy.",
    intro: [
      "You are naturally relational, expressive, warm, and responsive to people. You may find energy in conversation, community, worship, encouragement, laughter, and shared experiences. Faith becomes real to you when it is lived with others.",
      "You may be the person who helps a parish feel welcoming. You may draw others in, lift the mood, initiate conversations, invite people to events, or remind serious people that joy is also holy.",
      "At your best, you reveal something very important about the Gospel: Christianity is not merely a set of rules or private duties. It is good news. It is communion. It is joy.",
    ],
    invitation: [
      "God is still present when the feeling fades.",
      "Love becomes mature when it remains faithful beyond excitement.",
    ],
    strengthsIntro: "Your temperament is designed to excel in:",
    strengths: [
      { title: "Evangelising through warmth", body: "You can make faith feel approachable. People may open up to you because you are friendly, expressive, and emotionally present." },
      { title: "Joyful praise", body: "You may connect easily with worship, music, retreats, testimonies, prayer groups, and moments of shared grace." },
      { title: "Encouragement", body: "You can help others feel seen, included, and hopeful. This is a real spiritual gift." },
      { title: "Relational faith", body: "You understand that the Christian life is not meant to be lived alone. You can help build community where others might remain isolated." },
    ],
    strengthsClosing:
      "When surrendered to grace, your joy becomes witness. Your warmth becomes charity. Your enthusiasm becomes missionary energy.",
    trapName: "Inconsistency",
    trapIntro: [
      "Your main spiritual danger is not coldness. It is inconsistency.",
      "You may begin with great enthusiasm:",
    ],
    trapListA: [
      "A new prayer routine.",
      "A Bible study.",
      "A novena.",
      "A retreat high.",
      "A ministry commitment.",
      "A parish project.",
      "A spiritual book.",
    ],
    trapMiddle:
      "But when the emotion fades, boredom comes, or life becomes busy, you may quietly move on.",
    trapDefinition:
      "Your \"checklist trap\" is believing that if you felt inspired, you have already changed. In reality, inspiration is often only the beginning of grace. The fruit comes through perseverance.",
    trapListB: [
      "I do not feel close to God today, so maybe prayer is not working.",
      "This routine feels boring now.",
      "I will restart when I feel motivated.",
      "I said yes because I was excited, but now I feel overwhelmed.",
      "I need people around me or I feel spiritually dry.",
    ],
    blindspots: [
      { title: "Emotional highs mistaken for spiritual growth", body: "A powerful retreat or worship experience can be real, but it must be integrated into daily fidelity." },
      { title: "Overcommitting disguised as generosity", body: "You may say yes quickly because you want to help, connect, or be involved. But too many yeses can lead to guilt, resentment, or unfinished commitments." },
      { title: "Avoiding silence", body: "Silence may feel uncomfortable because it removes stimulation, affirmation, and distraction." },
      { title: "Depending on affirmation", body: "You may feel spiritually strong when others encourage you, but weak when no one notices." },
    ],
    desolationSummary:
      "In Ignatian terms, desolation for you may look like restlessness, distraction, spiritual boredom, comparison, fear of missing out, or chasing another emotional experience.",
    desolationClosing: [
      "God is not absent just because prayer feels ordinary.",
      "Sometimes the most loving prayer is the one you keep when it feels simple, dry, and unseen.",
    ],
    consolationText:
      "Joy in community, gratitude, praise, generosity, renewed desire to love others.",
    desolationText:
      "Restlessness, inconsistency, avoiding silence, seeking emotional highs, depending too much on affirmation.",
    practiceName: "The Rosary",
    practiceIntro:
      "The Rosary is especially helpful for you because it gives your heart something relational, rhythmic, imaginative, and steady. It allows you to pray with Mary, meditate on the life of Jesus, and stay anchored even when your feelings change.",
    practiceSteps: [
      { title: "One decade a day.", body: "" },
      { title: "Same time each day.", body: "" },
      { title: "Offer it for one person.", body: "" },
      { title: "Picture the Gospel scene.", body: "" },
      { title: "Do not worry about doing it perfectly.", body: "" },
    ],
    keyQuestion:
      "Mary, help me stay close to Jesus even when I am distracted or inconsistent.",
    additionalPracticeName: "One Small Rule of Life",
    additionalPracticeBody: [
      "Instead of starting many spiritual practices at once, choose one small commitment for 30 days.",
      "Examples: one decade of the Rosary daily, five minutes of Gospel reading, Sunday Mass plus one weekday Mass when possible, one act of hidden charity each day, or a short night prayer before sleeping.",
      "Your growth will come not from more excitement, but from holy consistency.",
    ],
    patronName: "St. Philip Neri",
    patronBody: [
      "St. Philip Neri is a joyful, relational, humorous, deeply holy saint who shows that Christian joy can be profoundly transformative. He drew people to God through warmth, friendship, humility, and delight.",
    ],
    patronInvitation: [
      "Your saintly invitation is not to become less joyful.",
      "It is to let joy mature into faithful love.",
    ],
  },

  phlegmatic: {
    key: "phlegmatic",
    profileName: "The Steady Peacemaker",
    icon: Waves,
    soulMeets: "Your soul often meets God through calm, routine, and simple faithfulness.",
    intro: [
      "You are naturally calm, steady, gentle, and peace-loving. You may not seek the spotlight, but people may experience you as safe, dependable, and easy to be with. You may prefer quiet service over dramatic gestures.",
      "In a loud, rushed, high-pressure world, your temperament carries an important gift: you remind others that God is not frantic.",
      "You may not need intense spiritual experiences to believe that God is near. You may find Him in ordinary duties, quiet prayer, small acts of service, and peaceful presence.",
    ],
    invitation: [
      "Peace is not the same as avoidance.",
      "Sometimes God's peace gives you the courage to act.",
    ],
    strengthsIntro: "Your temperament is designed to excel in:",
    strengths: [
      { title: "Stability", body: "You can be faithful without needing attention. You may be the person who keeps showing up quietly." },
      { title: "Peaceful presence", body: "You can calm anxious environments. Your steadiness can help others feel grounded." },
      { title: "Gentle service", body: "You may serve without needing recognition. This hiddenness can be deeply Christlike." },
      { title: "Patience", body: "You may be slower to anger and less reactive than others. This can make you a source of reconciliation." },
    ],
    strengthsClosing:
      "When surrendered to grace, your calm becomes trust. Your steadiness becomes perseverance. Your gentleness becomes strength.",
    trapName: "Inertia",
    trapIntro: [
      "Your main spiritual danger is not aggression. It is inertia.",
      "You may avoid what feels difficult, disruptive, or uncomfortable:",
    ],
    trapListA: [
      "A hard conversation.",
      "A needed decision.",
      "A new commitment.",
      "A confession you have delayed.",
      "A ministry invitation.",
      "A change in routine.",
      "A step of courage.",
    ],
    trapMiddle:
      "But sometimes calm is not peace. Sometimes calm is simply avoidance.",
    trapDefinition:
      "Your \"checklist trap\" is believing that as long as things are calm, everything is spiritually fine.",
    trapListB: [
      "I will deal with it later.",
      "It is not that serious.",
      "I do not want to upset anyone.",
      "Someone else will probably handle it.",
      "I know I should pray, but I will start when life feels easier.",
    ],
    blindspots: [
      { title: "Avoidance disguised as peace", body: "You may keep external peace while ignoring the inner call to act." },
      { title: "Comfort mistaken for discernment", body: "The easier path is not always the path of God." },
      { title: "Passivity disguised as humility", body: "You may think you are being humble by stepping back, when God may actually be asking you to contribute." },
      { title: "Delayed obedience", body: "You may know the next right step, but postpone it until the grace loses urgency." },
    ],
    desolationSummary:
      "In Ignatian terms, desolation for you may look like dullness, numbness, delay, avoidance, and low-grade spiritual sleepiness.",
    desolationClosing: [
      "God's invitation to you is usually gentle but concrete.",
      "Not everything needs to be solved today.",
      "But one faithful step may need to be taken today.",
    ],
    consolationText:
      "Quiet trust, steady faithfulness, calm obedience, gentle service, willingness to take one small step.",
    desolationText:
      "Apathy, delay, passivity, conflict avoidance, confusing comfort with peace.",
    practiceName: "Simple Daily Examen",
    practiceIntro:
      "The Ignatian Examen works well for you when it is short, concrete, and action-oriented.",
    practiceSteps: [
      { title: "Thank God for one simple gift today.", body: "" },
      { title: "Ask: \"Where was I peaceful in You?\"", body: "" },
      { title: "Ask: \"Where did I avoid Your invitation?\"", body: "" },
      { title: "Ask for mercy.", body: "" },
      { title: "Choose one small act of obedience for tomorrow.", body: "" },
    ],
    keyQuestion:
      "Lord, what is the one small step You are asking me not to delay?",
    additionalPracticeName: "Fixed-Time Prayer",
    additionalPracticeBody: [
      "Because you may struggle with inertia, avoid vague spiritual goals like \"I will pray more.\"",
      "Choose a fixed rhythm: a morning offering after waking, one decade of the Rosary after lunch, five minutes of silence before bed, Sunday Mass plus one weekday act of service, or monthly confession on a set week.",
      "Do not make the practice too ambitious. Your path to holiness is steady faithfulness.",
    ],
    patronName: "St. Joseph",
    patronBody: [
      "St. Joseph is a strong companion for the quiet, steady, faithful soul. He does not speak in Scripture, yet his obedience is decisive. He listens, protects, acts, and serves without needing attention.",
    ],
    patronInvitation: [
      "Your saintly invitation is not to become louder.",
      "It is to become courageously faithful.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Scoring engine                                                      */
/* ------------------------------------------------------------------ */

interface ScoreResult {
  scores: Record<TemperamentKey, number>;
  order: TemperamentKey[];
  dominant: TemperamentKey;
  secondary: TemperamentKey;
  isBlended: boolean;
  perfectionismFlag: boolean;
}

function computeScores(answers: Record<number, number>): ScoreResult {
  const scores = {} as Record<TemperamentKey, number>;
  (Object.keys(GROUPS) as TemperamentKey[]).forEach((key) => {
    scores[key] = GROUPS[key].reduce((sum, id) => sum + (answers[id] || 0), 0);
  });

  const order = (Object.keys(scores) as TemperamentKey[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const dominant = order[0];
  const secondary = order[1];
  const isBlended = scores[dominant] - scores[secondary] <= 2;
  const perfectionismFlag = (answers[5] ?? 0) >= 4 && (answers[7] ?? 0) >= 4;

  return { scores, order, dominant, secondary, isBlended, perfectionismFlag };
}

/* ------------------------------------------------------------------ */
/*  Small UI building blocks                                            */
/* ------------------------------------------------------------------ */

function ScaleSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={selected}
            aria-label={SCALE_LABELS[n]}
            onClick={() => onChange(n)}
            className={[
              "h-11 w-11 shrink-0 rounded-full border-2 text-sm font-medium",
              "flex items-center justify-center transition-all duration-200 ease-out",
              selected
                ? "scale-110 border-[#D4AF37] bg-[#D4AF37] text-[#0A192F] shadow-md shadow-[#D4AF37]/30"
                : "border-[#0A192F]/15 bg-[#FDFBF7] text-[#0A192F]/35 hover:border-[#D4AF37]/60 hover:text-[#0A192F]/60",
            ].join(" ")}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: Question;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#0A192F]/10 bg-white p-5 shadow-sm shadow-[#0A192F]/5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
        Question {index + 1} of {QUESTIONS.length}
      </p>
      <p className="mb-6 font-serif text-lg leading-snug text-[#0A192F]">
        {question.text}
      </p>
      <ScaleSelector value={value} onChange={onChange} />
      <div className="mt-3 flex justify-between text-[10px] text-[#0A192F]/40">
        <span>Not at all like me</span>
        <span>Very much like me</span>
      </div>
    </div>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-[#0A192F]/80">
          {p}
        </p>
      ))}
    </div>
  );
}

function NumberedList({ items }: { items: ListItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A192F]/5 text-[11px] font-semibold text-[#0A192F]/60">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0A192F]">{item.title}</p>
            {item.body && (
              <p className="mt-0.5 text-sm leading-relaxed text-[#0A192F]/70">
                {item.body}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuoteBlock({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5 border-l-2 border-[#D4AF37]/40 pl-4">
      {items.map((q, i) => (
        <p key={i} className="text-sm italic leading-relaxed text-[#0A192F]/60">
          "{q}"
        </p>
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  icon: Icon,
}: {
  eyebrow: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-[#D4AF37]" />}
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0A192F]/45">
        {eyebrow}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

const initialAnswers: Record<number, number | null> = QUESTIONS.reduce(
  (acc, q) => ({ ...acc, [q.id]: null }),
  {}
);

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<number, number | null>>(
    initialAnswers
  );
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const reportRef = useRef<HTMLDivElement | null>(null);

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => setRevealed(true), 30);
      const scrollT = setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => {
        clearTimeout(t);
        clearTimeout(scrollT);
      };
    }
  }, [submitted]);

  function handleSubmit() {
    if (!allAnswered) {
      setTriedSubmit(true);
      return;
    }
    setSubmitted(true);
  }

  function handleRetake() {
    setAnswers(initialAnswers);
    setSubmitted(false);
    setRevealed(false);
    setTriedSubmit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const results = submitted
    ? computeScores(answers as Record<number, number>)
    : null;
  const profile = results ? PROFILES[results.dominant] : null;
  const DominantIcon = profile?.icon ?? Flame;
  const blendNote =
    results && results.isBlended
      ? BLEND_NOTES[getBlendKey(results.dominant, results.secondary)]
      : null;

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-20">
      {/* Header */}
      <div className="border-b border-[#0A192F]/10 bg-[#FDFBF7] px-6 pb-8 pt-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
          Anima Companion
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[#0A192F]">Know Thyself</h1>
        <div className="mx-auto mt-4 h-px w-10 bg-[#D4AF37]" />
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-[#0A192F]/55">
          A temperament reflection to help you know the soul God gave you to
          sanctify.
        </p>
      </div>

      <div className="mx-auto max-w-md px-5 pt-8">
        {/* Scale legend */}
        <div className="mb-6 rounded-2xl border border-[#0A192F]/10 bg-white p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A192F]/40">
            Rating scale
          </p>
          <div className="grid grid-cols-1 gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-2 text-xs text-[#0A192F]/65">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A192F]/5 text-[10px] font-semibold text-[#0A192F]/60">
                  {n}
                </span>
                <span>{SCALE_LABELS[n]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-1.5 flex justify-between text-[11px] text-[#0A192F]/45">
            <span>Progress</span>
            <span>
              {answeredCount} of {QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0A192F]/8">
            <div
              className="h-full rounded-full bg-[#D4AF37] transition-all duration-500 ease-out"
              style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <QuestionCard
              key={q.id}
              index={i}
              question={q}
              value={answers[q.id]}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold tracking-wide",
              "transition-all duration-200",
              submitted
                ? "cursor-default bg-[#0A192F]/10 text-[#0A192F]/40"
                : "bg-[#D4AF37] text-[#0A192F] hover:bg-[#c29f2e] active:scale-[0.99]",
            ].join(" ")}
          >
            {submitted ? "Report Generated" : "Submit & Generate My Report"}
            {!submitted && <ChevronRight className="h-4 w-4" />}
          </button>
          {!allAnswered && triedSubmit && !submitted && (
            <p className="mt-3 text-center text-xs text-[#0A192F]/45">
              Answer all {QUESTIONS.length} questions to reveal your report.
            </p>
          )}
        </div>

        {/* -------------------------------------------------------- */}
        {/*  Report                                                    */}
        {/* -------------------------------------------------------- */}
        {submitted && results && profile && (
          <div
            ref={reportRef}
            className={[
              "relative mt-14 transition-all duration-700 ease-out",
              revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            ].join(" ")}
          >
            <div className="absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#FDFBF7] bg-[#0A192F] shadow-lg">
              <DominantIcon className="h-6 w-6 text-[#D4AF37]" />
            </div>

            <div className="space-y-8 rounded-2xl border border-[#0A192F]/10 bg-white px-6 pb-8 pt-10 shadow-xl shadow-[#0A192F]/10">
              {/* Title */}
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Your Dominant Temperament — {TEMPERAMENT_LABEL[profile.key]}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#0A192F]">
                  {profile.profileName}
                </h2>
                <p className="mt-1 text-sm italic text-[#0A192F]/50">
                  {profile.soulMeets}
                </p>
                <div className="mx-auto my-5 h-px w-10 bg-[#D4AF37]" />
                <Paragraphs items={profile.intro} />
              </div>

              {/* Invitation callout */}
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF7] p-4 text-center">
                {profile.invitation.map((line, i) => (
                  <p
                    key={i}
                    className="text-sm font-medium leading-relaxed text-[#0A192F]"
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Score breakdown */}
              <div>
                <SectionHeading eyebrow="Your Scores" />
                <div className="space-y-2.5">
                  {results.order.map((key) => {
                    const score = results.scores[key];
                    const pct = (score / 20) * 100;
                    const isDominant = key === results.dominant;
                    const isSecondary = key === results.secondary;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-[#0A192F]/65">
                          {TEMPERAMENT_LABEL[key]}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0A192F]/8">
                          <div
                            className={[
                              "h-full rounded-full transition-all duration-1000 ease-out",
                              isDominant
                                ? "bg-[#D4AF37]"
                                : isSecondary
                                ? "bg-[#0A192F]/50"
                                : "bg-[#0A192F]/20",
                            ].join(" ")}
                            style={{ width: revealed ? `${pct}%` : "0%" }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs text-[#0A192F]/50">
                          {score}/20
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blend card */}
              {blendNote && (
                <div className="rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF7] p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#D4AF37]" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                      Blended Temperament Result
                    </p>
                  </div>
                  <p className="mb-3 font-serif text-base text-[#0A192F]">
                    {blendNote.title}
                  </p>
                  <p className="mb-2 text-sm leading-relaxed text-[#0A192F]/75">
                    <span className="font-semibold text-[#0A192F]">Strengths: </span>
                    {blendNote.strengths}
                  </p>
                  <p className="mb-3 text-sm leading-relaxed text-[#0A192F]/75">
                    <span className="font-semibold text-[#0A192F]">Risk: </span>
                    {blendNote.risk}
                  </p>
                  <p className="text-sm italic leading-relaxed text-[#0A192F]/60">
                    {blendNote.pastoral}
                  </p>
                </div>
              )}

              {/* Strengths */}
              <div>
                <SectionHeading eyebrow="Spiritual Core Strengths" />
                <p className="mb-4 text-sm leading-relaxed text-[#0A192F]/70">
                  {profile.strengthsIntro}
                </p>
                <NumberedList items={profile.strengths} />
                <p className="mt-4 text-sm italic leading-relaxed text-[#0A192F]/60">
                  {profile.strengthsClosing}
                </p>
              </div>

              {/* Checklist trap & blindspots */}
              <div>
                <SectionHeading eyebrow={`${profile.trapName} & Blindspots`} />
                <Paragraphs items={profile.trapIntro} />
                <div className="my-4">
                  <QuoteBlock items={profile.trapListA} />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-[#0A192F]/70">
                  {profile.trapMiddle}
                </p>
                <p className="mb-4 text-sm leading-relaxed text-[#0A192F]/70">
                  {profile.trapDefinition}
                </p>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]/40">
                  You may struggle with thoughts like
                </p>
                <div className="mb-5">
                  <QuoteBlock items={profile.trapListB} />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#0A192F]/40">
                  Your blindspots may include
                </p>
                <NumberedList items={profile.blindspots} />
              </div>

              {/* Perfectionism pastoral note */}
              {results.perfectionismFlag && (
                <div className="rounded-xl border border-[#D4AF37]/40 bg-[#FDFBF7] p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-[#D4AF37]" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                      A Gentle Word
                    </p>
                  </div>
                  <p className="text-sm italic leading-relaxed text-[#0A192F]/80">
                    {PERFECTIONISM_NOTE}
                  </p>
                </div>
              )}

              {/* Consolation / Desolation */}
              <div>
                <SectionHeading eyebrow="Consolation & Desolation" />
                <p className="mb-4 text-sm leading-relaxed text-[#0A192F]/70">
                  {profile.desolationSummary}
                </p>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF7] p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                        Consolation may look like
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-[#0A192F]/75">
                      {profile.consolationText}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#0A192F]/10 bg-[#FDFBF7] p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <TrendingDown className="h-3.5 w-3.5 text-[#0A192F]/40" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A192F]/40">
                        Desolation may look like
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-[#0A192F]/75">
                      {profile.desolationText}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  {profile.desolationClosing.map((line, i) => (
                    <p
                      key={i}
                      className="text-sm italic leading-relaxed text-[#0A192F]/60"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Custom blueprint */}
              <div>
                <SectionHeading eyebrow="Your Custom Blueprint" icon={BookOpen} />
                <p className="mb-1 font-serif text-lg text-[#0A192F]">
                  {profile.practiceName}
                </p>
                <p className="mb-4 text-sm leading-relaxed text-[#0A192F]/70">
                  {profile.practiceIntro}
                </p>
                <NumberedList items={profile.practiceSteps} />

                <div className="mt-5 rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF7] p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Your Key Question
                  </p>
                  <p className="text-sm italic leading-relaxed text-[#0A192F]">
                    {profile.keyQuestion}
                  </p>
                </div>

                <p className="mb-1 mt-6 font-serif text-lg text-[#0A192F]">
                  {profile.additionalPracticeName}
                </p>
                <Paragraphs items={profile.additionalPracticeBody} />
              </div>

              {/* Patron saint */}
              <div>
                <SectionHeading eyebrow="Patron Saint" icon={Church} />
                <p className="mb-2 font-serif text-lg text-[#0A192F]">
                  {profile.patronName}
                </p>
                <Paragraphs items={profile.patronBody} />
                <div className="mt-3 space-y-1">
                  {profile.patronInvitation.map((line, i) => (
                    <p
                      key={i}
                      className="text-sm font-medium italic leading-relaxed text-[#0A192F]/80"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetake}
                className="mx-auto flex w-fit items-center justify-center gap-1.5 text-xs text-[#0A192F]/55 underline decoration-[#0A192F]/20 underline-offset-4 transition-colors hover:text-[#0A192F]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake the assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
