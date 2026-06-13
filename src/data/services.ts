export interface ServiceDetail {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  imageAlt: string;
  description: string;
  sections: {
    heading: string;
    body: string;
  }[];
  closing: string;
}

export const services: ServiceDetail[] = [
  {
    slug: "relationships",
    title: "Relationships",
    tagline: "The relationship is usually not the real problem.",
    image: "/services/relationships.webp",
    imageAlt:
      "Two hands gently holding a ceramic mug on a wooden table in warm natural light",
    description:
      "The fights, the distance, the feeling of not being understood. It is real. But the relationship is usually just where something deeper is showing up. Something we have been carrying much longer than this. Therapy helps us see what that is so we can move from confusion to understanding ourselves better.",
    sections: [
      {
        heading: "It is not about fixing the relationship",
        body: "A lot of us grew up watching how the adults around us handled love, conflict, and closeness. We picked up things from that without knowing it. What it means to need someone. Whether it is okay to ask for things. What happens when we get too close. None of that was a decision we made. But it still shows up in how we are with people now. Therapy is a place to understand that, not to be told what we are doing wrong.",
      },
      {
        heading: "How we work together",
        body: "There is no single approach that fits everyone. Some of us need space to understand what is happening inside. Some of us need practical tools we can use right away. Most of us need both at different times. Sessions are shaped around that. The way we work together changes as we go, depending on what feels most useful at the time.",
      },
      {
        heading: "The other person does not need to be here",
        body: "This is not couples therapy. It is about understanding ourselves better so that our relationships feel less confusing. When we see our own part more clearly, it changes how we show up with everyone. Whether that means staying, repairing, or leaving, the decision comes from a clearer place.",
      },
    ],
    closing:
      "Understanding ourselves is where better relationships begin.",
  },
  {
    slug: "loneliness",
    title: "Loneliness",
    tagline: "You can be surrounded by people and still feel completely alone.",
    image: "/services/loneliness.webp",
    imageAlt:
      "A person sitting alone on a park bench looking out at a misty morning landscape",
    description:
      "Loneliness is not always about being alone. Sometimes it sits right in the middle of a full life. There are people around, conversations happening, a relationship that looks fine from the outside. But inside, something feels missing. A closeness that is not there. A sense of belonging that never quite lands. A feeling that no one really knows what is going on inside us. Therapy helps us understand what kind of loneliness we are actually carrying and what it needs.",
    sections: [
      {
        heading: "It shows up in more ways than we expect",
        body: "Most of us think loneliness means not having people around. But that is only one version of it. There is the kind where we have people in our life but no one who really knows us. The kind where we have one close person but no sense of belonging to anything larger. There is a loneliness that has nothing to do with people at all, where life itself feels empty or purposeless even when everything looks fine. And then there is feeling alone inside a relationship, sitting next to someone and still feeling unseen. None of these are the same thing. But they all feel like loneliness, and that can be confusing.",
      },
      {
        heading: "How we work together",
        body: "There is no single fix for loneliness because loneliness is not one thing. Sometimes what helps is understanding where the disconnection started, the early experiences that taught us to hide parts of ourselves to be accepted. Sometimes what helps is building specific skills for connection, or working through the anxiety that keeps us from letting people in. Sometimes it is sitting with the deeper question of what we are really looking for. Sessions are shaped around what is actually going on, using whatever approach fits best at the time.",
      },
      {
        heading: "It does not mean something is wrong with us",
        body: "Feeling lonely when the world around us is constantly connected can feel like a personal failure. Like everyone else figured out how to belong and we missed something. But loneliness usually is not about us being broken or not trying hard enough. It is often about something that was missing much earlier, something we learned to live without before we even had words for it. Understanding that changes how we relate to the feeling. It stops being something to fix and starts being something to listen to.",
      },
    ],
    closing:
      "Loneliness is not about needing more people. It is about being able to finally be known.",
  },
  {
    slug: "anxiety",
    title: "Anxiety",
    tagline: "The worry is not the problem. It is trying to tell us something.",
    image: "/services/anxiety.webp",
    imageAlt:
      "A journal open on a linen cloth with dried lavender sprigs beside it",
    description:
      "That constant hum in the background. The overthinking, the tightness, the need to have everything under control just to feel okay. Anxiety is exhausting, but it is not random. It usually makes a lot of sense once we understand where it started. Therapy is not about making the anxiety disappear. It is about understanding what it is responding to so it does not have to run the show.",
    sections: [
      {
        heading: "It is not always what it looks like",
        body: "Anxiety is not always a panic attack or a racing heart. Sometimes it is the quiet kind. The kind that looks like perfectionism, people-pleasing, overworking, or not being able to rest even when nothing is wrong. It can show up as needing to control every outcome, replaying conversations for hours, or a low-level dread that never fully goes away. Most of us do not even call it anxiety. We just say we are stressed, or tired, or that this is just how we are.",
      },
      {
        heading: "Where it usually comes from",
        body: "Anxiety is not a flaw in how we are wired. It is usually a response that made sense at some point. Maybe we grew up in an environment where things felt unpredictable, or where we had to stay alert to keep things from falling apart. Maybe we learned early that making a mistake meant losing something important. Over time, that alertness became the default. The alarm system got stuck, not because it is broken, but because it never got the signal that it is safe to come down.",
      },
      {
        heading: "What we work on",
        body: "In therapy, we do more than manage symptoms. We look at what is underneath the anxiety, the beliefs, the memories, the experiences that keep the nervous system on high alert. We also build practical tools to help regulate what is happening in the body, so that meeting uncertainty does not always feel like a threat. The goal is not to never feel anxious. It is to not be controlled by it.",
      },
    ],
    closing:
      "Anxiety is not the enemy. It is a part of us that learned to protect us the only way it knew how.",
  },
  {
    slug: "depression",
    title: "Depression",
    tagline: "Something has felt off for a while now.",
    image: "/services/depression.webp",
    imageAlt:
      "Rain droplets on a window pane with a blurred warm interior behind it",
    description:
      "Most of us who are going through this do not walk in saying I am depressed. We say something feels off. We say we are tired all the time, or that nothing excites us anymore, or that we are just going through the motions. From the outside, life looks fine. We are working, showing up, getting things done. But inside, something has gone quiet. And we do not know when it happened or how to get it back.",
    sections: [
      {
        heading: "It does not always have a name",
        body: "This is not always the kind of thing that has a clear starting point or an obvious cause. There was no single event, no breakdown, no moment where everything fell apart. It is more like a slow fade. Things that used to matter stopped mattering. We stopped looking forward to things. We started doing everything on autopilot, performing well enough that nobody around us noticed. And after a while we stopped noticing too. We just accepted that this is how life feels now.",
      },
      {
        heading: "What it might actually be about",
        body: "Sometimes what looks like depression is actually the weight of years of holding it together. For other people, for a career, for a family, for an image of who we are supposed to be. Sometimes it is a loss of meaning, where we look at the life we have built and cannot find ourselves in it anymore. Sometimes it is grief or anger or exhaustion that was never allowed a place. It does not always fit neatly into one explanation, and it does not need to. What matters is that we stop treating it like something to push through and start treating it like something worth understanding.",
      },
      {
        heading: "A place to stop being fine",
        body: "Therapy for this is not about being told to think positively or given a list of things to try. It is about having a space where we do not have to perform. Where we can say I do not know what is wrong with me and have that be taken seriously instead of brushed aside. We look at what has been building underneath, we work with it using whatever approach actually helps, and we make room for something to shift. At whatever pace feels right.",
      },
    ],
    closing:
      "We do not need a crisis to ask for help. If something has felt off for a while, that is reason enough.",
  },
  {
    slug: "for-women",
    title: "For Women",
    tagline: "Navigating what the world expects, and what you actually need.",
    image: "/services/for-women.webp",
    imageAlt:
      "Hands arranging wildflowers in a ceramic vase on a sunlit wooden table",
    description:
      "Working with women navigating the particular pressures that come with being a woman. At home, at work, in relationships, and inside ourselves.",
    sections: [
      {
        heading: "The weight of being everything to everyone",
        body: "Women are often expected to hold it all together. To be nurturing but not needy, ambitious but not threatening, independent but never alone. These expectations get internalized early, and they shape how you move through the world: what you allow yourself to feel, what you think you deserve, how much space you take up. Therapy can help you untangle what's yours from what was handed to you.",
      },
      {
        heading: "Topics we often explore",
        body: "Body image and the relationship with your physical self. Boundaries in relationships, at work, and with family. The pressure to perform femininity in specific ways. Navigating motherhood, or the decision not to. Career identity and the guilt that often comes with ambition. Hormonal changes and their emotional impact. These aren't small things. They shape your daily life, and they deserve proper attention.",
      },
      {
        heading: "A space shaped for you",
        body: "This isn't about empowerment slogans or surface-level self-care. It's about doing the deeper work of understanding how being a woman has shaped your emotional landscape, and making choices from a place of clarity rather than obligation. You get to define what strength, rest, and fulfilment look like on your own terms.",
      },
    ],
    closing:
      "You don't need permission to put yourself first. But sometimes you need a space where someone reminds you of that until you believe it.",
  },
  {
    slug: "trauma",
    title: "Trauma",
    tagline: "Not every wound leaves a visible mark.",
    image: "/services/trauma.webp",
    imageAlt:
      "Smooth stones stacked gently by a still pond with soft morning mist",
    description:
      "Trauma isn't always a single dramatic event. Sometimes it's the accumulation of things that were said, things that weren't, environments that felt unsafe, or experiences your body never fully moved through.",
    sections: [
      {
        heading: "Trauma is more common than you think",
        body: "When most people hear the word trauma, they think of catastrophic events. But trauma can also be quiet. It can be growing up in a home where your emotions were dismissed. Being bullied and never talking about it. Living in an environment where you had to be hypervigilant just to feel safe. These experiences may not seem 'big enough' to count, but their impact is real and lasting.",
      },
      {
        heading: "How trauma lives in the body",
        body: "Trauma doesn't just live in your memories. It lives in your nervous system. It's the tightness in your chest when someone raises their voice. The way you freeze in conflict. The difficulty trusting people even when they've given you no reason not to. Your body remembers what your mind may have filed away, and sometimes the healing needs to happen at that level too.",
      },
      {
        heading: "Healing at your own pace",
        body: "Trauma therapy is not about reliving the worst of what happened. It's about creating enough safety in the present that your nervous system can begin to let go of what it's been holding. We work slowly, checking in with what feels manageable, and never pushing you further than you're ready to go. Healing doesn't require you to be brave. It just requires you to be honest.",
      },
    ],
    closing:
      "You survived it. Now you get to decide how much of it you carry forward, and how much you're ready to put down.",
  },
  {
    slug: "self-esteem",
    title: "Self-Esteem",
    tagline: "The relationship that shapes every other one.",
    image: "/services/self-esteem.webp",
    imageAlt:
      "A mirror leaning against a white textured wall with soft morning light",
    description:
      "The way you see yourself shapes almost everything. How you speak up, how you love, what you let yourself want. We unpack where the 'never quite enough' came from, and build a quieter, steadier relationship with yourself.",
    sections: [
      {
        heading: "Where the inner critic comes from",
        body: "That voice inside you that says you're not good enough, not smart enough, not worthy of love. It didn't come from nowhere. It was built, often in childhood, from the messages you received about who you were supposed to be. Maybe you were compared to a sibling. Maybe affection was conditional. Maybe you learned that your value was tied to performance. Over time, those messages became the lens through which you see yourself.",
      },
      {
        heading: "How low self-esteem shows up",
        body: "It's not always obvious. It can look like saying yes when you mean no. Apologising for things that aren't your fault. Staying in situations that don't serve you because you don't believe you deserve better. It can also show up as overachieving, perfectionism, or constant comparison. These are all strategies for managing a deep belief that who you are, as you are, isn't enough.",
      },
      {
        heading: "Building something steadier",
        body: "Therapy for self-esteem isn't about affirmations or thinking positively. It's about understanding the story you've been telling yourself, where it came from, and whether it's still true. We work on separating who you are from what you do, and slowly building a relationship with yourself that's based on honesty rather than performance.",
      },
    ],
    closing:
      "You don't need to become someone else. You just need to stop abandoning the person you already are.",
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug);
}
