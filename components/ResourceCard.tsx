import type { Resource } from "@/domain/resources/types";

export function ResourceCard({
  resource,
  onSave
}: {
  resource: Resource;
  onSave: (resource: Resource) => void;
}) {
  const cultural = resource.cultural_context?.adaptation_status;

  return (
    <article className="resource-card">
      <div className="resource-topline">
        <span className="resource-type">{resource.resource_type.replaceAll("-", " ")}</span>
        <span className="review-badge">{resource.review_status}</span>
      </div>
      <h3>{resource.name}</h3>
      <p>{resource.description}</p>
      <div className="resource-meta">
        <span>{resource.publisher}</span>
        {resource.languages?.length ? <span>{resource.languages.join(", ")}</span> : null}
        {cultural && cultural !== "unknown" ? <span>{cultural.replaceAll("_", " ")}</span> : null}
      </div>
      <div className="resource-actions">
        <a href={resource.official_url} target="_blank" rel="noreferrer">Open original</a>
        <button onClick={() => onSave(resource)}>Save to toolbox</button>
      </div>
    </article>
  );
}
