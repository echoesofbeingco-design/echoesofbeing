/**
 * Time-based creative greetings for the community page.
 * Each time period has multiple options — one is picked randomly.
 */

const morningGreetings = [
  "A new morning, a fresh page",
  "The day is still young and gentle",
  "Good morning, hope you slept okay",
  "Soft mornings make for honest words",
  "The morning light is here for you",
  "A quiet start to a new chapter",
  "Mornings like these are worth pausing in",
];

const afternoonGreetings = [
  "Taking a breath this afternoon?",
  "The afternoon is a good time to check in",
  "Halfway through the day. How are you holding up?",
  "An afternoon pause can make all the difference",
  "Hope your day has been kind so far",
  "The middle of the day, the middle of the story",
  "Afternoons are for reflection",
];

const eveningGreetings = [
  "The evening is yours to unwind",
  "As the day winds down, so can you",
  "Evenings are for the thoughts we carry gently",
  "A quiet evening to sit with what matters",
  "Hope this evening brings you some peace",
  "The day is done, you showed up, and that counts",
  "Evenings are softer. Take your time.",
];

const nightGreetings = [
  "The night is a safe place for honest thoughts",
  "Late nights and quiet reflections",
  "Can't sleep? You're not the only one",
  "The world is quieter now, space for your thoughts",
  "Night time, your time",
  "Some of the most honest conversations happen after dark",
  "Still up? This is a good place to be",
];

function getTimeBasedGreetings(): string[] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return morningGreetings;
  if (hour >= 12 && hour < 17) return afternoonGreetings;
  if (hour >= 17 && hour < 21) return eveningGreetings;
  return nightGreetings;
}

export function getGreeting(): string {
  const greetings = getTimeBasedGreetings();
  return greetings[Math.floor(Math.random() * greetings.length)];
}

const followUps = [
  "Anything on your mind today?",
  "Want to share what you're carrying?",
  "Feel like putting something into words?",
  "Sometimes writing it down helps.",
  "Your words matter here.",
  "This is a safe space to share.",
];

export function getFollowUp(): string {
  return followUps[Math.floor(Math.random() * followUps.length)];
}
