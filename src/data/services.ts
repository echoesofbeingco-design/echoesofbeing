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
    tagline: "It's not always about the other person.",
    image: "/services/relationships.webp",
    imageAlt:
      "Two hands gently holding a ceramic mug on a wooden table in warm natural light",
    description:
      "Sometimes it's not the relationship itself that's the problem. It's the patterns inside it. We work on understanding your part in it, with curiosity, not judgment.",
    sections: [
      {
        heading: "Why patterns matter more than problems",
        body: "Most people come to therapy saying something like 'my partner doesn't listen' or 'we keep having the same fight.' And while those experiences are real, what often sits underneath is a pattern that started long before this relationship. Maybe you learned early on that closeness means losing yourself. Or that asking for what you need will push people away. These beliefs, often invisible, shape the way you show up in every relationship you have.",
      },
      {
        heading: "What we explore together",
        body: "In our sessions, we look at the dynamics you find yourself repeating. The roles you fall into, the things you tolerate that don't sit right, the ways you protect yourself that end up creating distance. We also explore what healthy connection actually looks like for you, not what it's supposed to look like according to anyone else.",
      },
      {
        heading: "It takes two, but change starts with one",
        body: "You don't need your partner in the room to start doing meaningful work. Understanding your own attachment style, your triggers, and your needs gives you a clearer sense of what you're bringing to the table. And that clarity changes everything, whether you're trying to repair a relationship or deciding whether it's time to walk away.",
      },
    ],
    closing:
      "This work isn't about becoming a better partner for someone else. It's about becoming more honest with yourself about what you need, and learning how to ask for it without guilt.",
  },
  {
    slug: "loneliness",
    title: "Loneliness",
    tagline: "You can feel alone in a room full of people.",
    image: "/services/loneliness.webp",
    imageAlt:
      "A person sitting alone on a park bench looking out at a misty morning landscape",
    description:
      "Loneliness doesn't always look like isolation. Sometimes it sits right in the middle of a full life, surrounded by people, yet deeply unseen.",
    sections: [
      {
        heading: "The loneliness nobody talks about",
        body: "There's a kind of loneliness that has nothing to do with being alone. You might have friends, family, a partner, a social life that looks full from the outside. But inside, there's a quiet gap. A feeling of not being truly known. Of performing connection without actually feeling it. This kind of loneliness is confusing because you can't always explain it, and others might not understand it.",
      },
      {
        heading: "Where it often begins",
        body: "For many people, this feeling has roots in childhood. Maybe you grew up in a home where emotions weren't welcome. Or where you had to be a certain way to earn love. Over time, you learned to hide the parts of you that felt too much, too messy, or not enough. And now, even in your closest relationships, those parts stay hidden. The result is a kind of emotional distance that follows you everywhere.",
      },
      {
        heading: "How therapy helps",
        body: "Therapy offers something rare: a space where you can be fully seen without performing. Where you don't have to be interesting, or strong, or fine. We work on reconnecting you with the parts of yourself you've learned to keep quiet, and slowly building the kind of relationships where those parts are welcome.",
      },
    ],
    closing:
      "You don't have to earn belonging. Sometimes it starts with letting yourself be known, one honest conversation at a time.",
  },
  {
    slug: "anxiety",
    title: "Anxiety",
    tagline: "Your mind is trying to protect you. Let's understand how.",
    image: "/services/anxiety.webp",
    imageAlt:
      "A journal open on a linen cloth with dried lavender sprigs beside it",
    description:
      "We work on understanding what your anxiety is trying to protect you from, and how to meet uncertainty without being swallowed by it.",
    sections: [
      {
        heading: "Anxiety is not a flaw",
        body: "Anxiety often gets treated like something to fix or silence. But more often than not, it's a signal. It's your nervous system doing exactly what it was designed to do: keep you safe. The problem isn't that you feel anxious. It's that the alarm system is stuck on high, responding to things that aren't actually dangerous as though they are. Understanding this changes the way you relate to your own mind.",
      },
      {
        heading: "What anxiety can look like",
        body: "It's not always the obvious panic attack or racing heart. Sometimes it's the constant overthinking, the need to control outcomes, the quiet dread before a social situation, or the inability to rest even when nothing is wrong. It can show up as perfectionism, people-pleasing, procrastination, or an endless loop of 'what if.' These are all ways your mind is trying to manage a world that feels unpredictable.",
      },
      {
        heading: "What we work on",
        body: "In therapy, we go beyond just managing symptoms. We look at what's driving the anxiety: the beliefs, the past experiences, the unprocessed emotions underneath. We also build practical tools to help you regulate your nervous system, so that you can start meeting uncertainty with steadiness instead of fear. The goal isn't to never feel anxious. It's to not be run by it.",
      },
    ],
    closing:
      "Anxiety doesn't have to be the loudest voice in the room. With time and support, you can learn to hear it without obeying it.",
  },
  {
    slug: "depression",
    title: "Depression",
    tagline: "When everything feels heavier than it should.",
    image: "/services/depression.webp",
    imageAlt:
      "Rain droplets on a window pane with a blurred warm interior behind it",
    description:
      "When getting through the day feels heavier than it should, therapy can be a space to sit with that honestly, without having to perform being okay.",
    sections: [
      {
        heading: "It doesn't always look the way you think",
        body: "Depression isn't always lying in bed unable to move. Sometimes it looks like going through the motions, getting things done, showing up, smiling, but feeling hollow underneath. It can feel like a fog that sits over everything, making things that used to matter feel flat or far away. You might not even call it depression. You might just say you're tired, or stuck, or numb.",
      },
      {
        heading: "What might be underneath",
        body: "Depression often carries something deeper than sadness. It can be unexpressed anger, grief that was never given space, years of putting others first, or a sense that nothing you do is ever quite enough. Sometimes it's the body's way of shutting down after running on empty for too long. We explore what your depression might be holding, gently and without rushing.",
      },
      {
        heading: "A space to stop performing",
        body: "One of the most healing things therapy can offer is the chance to stop pretending. To say 'I'm not okay' and not have someone try to fix it immediately. We sit with what's real, we name what hasn't been named, and we slowly make room for something lighter. There's no pressure to feel better by a deadline. Healing moves at your pace.",
      },
    ],
    closing:
      "You don't have to wait until it gets worse to ask for help. If something feels off, that's enough of a reason to reach out.",
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
