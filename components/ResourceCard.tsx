import type { Language } from "@/domain/i18n/copy";
import type { Resource } from "@/domain/resources/types";

export function ResourceCard({
  resource,
  onSave,
  language = "en"
}: {
  resource: Resource;
  onSave: (resource: Resource) => void;
  language?: Language;
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
        <a href={resource.official_url} target="_blank" rel="noreferrer">
          {language === "en" ? "Open original" : "Abrir original"}
        </a>
        <button onClick={() => onSave(resource)}>
          {language === "en" ? "Save to toolbox" : "Guardar"}
        </button>
      </div>
    </article>
  );
}
