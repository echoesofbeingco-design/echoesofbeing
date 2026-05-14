export const COMMUNITY_TOPICS = [
  { value: "general", label: "General", icon: "chat" },
  { value: "anxiety", label: "Anxiety", icon: "waves" },
  { value: "depression", label: "Depression", icon: "cloud" },
  { value: "relationships", label: "Relationships", icon: "link" },
  { value: "self-esteem", label: "Self-Esteem", icon: "seedling" },
  { value: "loneliness", label: "Loneliness", icon: "bird" },
  { value: "trauma", label: "Trauma & Healing", icon: "butterfly" },
  { value: "for-women", label: "For Women", icon: "flower" },
  { value: "gratitude", label: "Gratitude", icon: "sun" },
  { value: "wins", label: "Small Wins", icon: "star" },
] as const;

export type CommunityTopic = (typeof COMMUNITY_TOPICS)[number]["value"];

export const TOPIC_VALUES = COMMUNITY_TOPICS.map((t) => t.value);

export function getTopicLabel(value: string): string {
  const topic = COMMUNITY_TOPICS.find((t) => t.value === value);
  return topic ? topic.label : value;
}

export function getTopicIcon(value: string): string {
  const topic = COMMUNITY_TOPICS.find((t) => t.value === value);
  return topic ? topic.icon : "chat";
}
