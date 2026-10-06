export interface TechKeywordMapping {
  name: string;
  slug: string;
  aliases: string[];
}

export const TOPIC_CLUSTER_KEYWORDS: TechKeywordMapping[] = [
  { name: 'Redis', slug: 'redis', aliases: ['redis', 'redis caching', 'redis cluster'] },
  { name: 'Kafka', slug: 'kafka', aliases: ['kafka', 'apache kafka', 'kafka streams'] },
  { name: 'PostgreSQL', slug: 'postgresql', aliases: ['postgresql', 'postgres', 'psql'] },
  { name: 'Kubernetes', slug: 'kubernetes', aliases: ['kubernetes', 'k8s'] },
  { name: 'Docker', slug: 'docker', aliases: ['docker', 'docker container'] },
  { name: 'NestJS', slug: 'nestjs', aliases: ['nestjs', 'nest.js'] },
  { name: 'MongoDB', slug: 'mongodb', aliases: ['mongodb', 'mongo'] },
  { name: 'Next.js', slug: 'nextjs', aliases: ['next.js', 'nextjs'] },
];

/**
 * Parses raw text or markdown paragraphs and converts the FIRST un-linked occurrence
 * of key infrastructure technologies into internal topic hub links (/technologies/[slug]).
 *
 * Automatically skips text inside existing links [text](url), inline code `code`, or code blocks ```.
 */
export function autoLinkTopicClusters(content: string, linkedSlugsState?: Set<string>): string {
  if (!content || typeof content !== 'string') return content;

  const linkedSlugs = linkedSlugsState || new Set<string>();

  let processed = content;

  for (const tech of TOPIC_CLUSTER_KEYWORDS) {
    if (linkedSlugs.has(tech.slug)) continue;

    for (const alias of tech.aliases) {
      // Look for first word boundary match that is NOT already inside a markdown link [..](..), html tag <..>, or code block `..`
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match word boundaries ensuring it's not preceding/following word chars or markdown link syntax
      const regex = new RegExp(`(?<![\\[\\/\\w#])\\b(${escapedAlias})\\b(?![\\w\\]\\)])`, 'i');

      const match = regex.exec(processed);
      if (match && match.index !== undefined) {
        // Check if the match is inside code backticks or markdown brackets
        const beforeText = processed.slice(0, match.index);
        const backtickCount = (beforeText.match(/`/g) || []).length;
        const bracketOpen = (beforeText.match(/\[/g) || []).length;
        const bracketClose = (beforeText.match(/\]/g) || []).length;

        // If inside inline code or link text, skip
        if (backtickCount % 2 !== 0 || bracketOpen > bracketClose) {
          continue;
        }

        const matchedText = match[0];
        const replacement = `[${matchedText}](/technologies/${tech.slug})`;
        processed = processed.slice(0, match.index) + replacement + processed.slice(match.index + matchedText.length);
        linkedSlugs.add(tech.slug);
        break; // Process next technology keyword
      }
    }
  }

  return processed;
}
