export default function LegacyMarkup({ as: Tag = 'div', className, html }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
