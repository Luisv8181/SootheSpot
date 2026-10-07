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
  const duration = resource.duration_options_minutes?.length ? resource.duration_options_minutes.join(", ") + " min" : null;
  const format = resource.resource_type.replaceAll("-", " ");
  const context = resource.use_context?.filter((item) => item !== "independent-use").slice(0, 2);

  return (
    <article className="resource-card">
      <div className="resource-card-layout">
        <div className="resource-cover" aria-hidden="true">
          <span>{resource.resource_type === "book" ? "READ" : format.split(" ")[0].slice(0, 7).toUpperCase()}</span>
          <strong>{resource.resource_type === "book" ? "▤" : "✦"}</strong>
        </div>
        <div className="resource-card-main">
          <div className="resource-topline">
            <span className="resource-type">{format}</span>
            <span className="review-badge">{resource.review_status}</span>
          </div>
          <h3>{resource.name}</h3>
          {resource.authors?.length ? <p className="resource-authors">{resource.authors.join(", ")}{resource.publication_year ? " · " + resource.publication_year : ""}</p> : null}
          <p>{resource.description}</p>
        </div>
      </div>
      <div className="resource-meta">
        <span>{resource.publisher}</span>
        {resource.platforms?.length ? <span>{resource.platforms.join(" · ")}</span> : null}
        {resource.languages?.length ? <span>{resource.languages.join(", ")}</span> : null}
        {duration ? <span>{duration}</span> : null}
        {resource.accessibility?.length ? <span>{resource.accessibility.join(", ")}</span> : null}
        {cultural && cultural !== "unknown" ? <span>{cultural.replaceAll("_", " ")}</span> : null}
        {resource.page_count ? <span>{resource.page_count} pages</span> : null}
      </div>
      {context?.length ? (
        <div className="resource-context-row">
          <span>{language === "en" ? "Useful for" : "Útil para"}</span>
          {context.map((item) => <span className="resource-context-chip" key={item}>{item.replaceAll("-", " ")}</span>)}
        </div>
      ) : null}
      {resource.limitations && (
        <details className="resource-details">
          <summary>{language === "en" ? "Limits & context" : "Límites y contexto"}</summary>
          <p>{resource.limitations}</p>
          {resource.evidence_notes && <p><strong>{language === "en" ? "Evidence:" : "Evidencia:"}</strong> {resource.evidence_notes}</p>}
          {resource.privacy_notes && <p><strong>{language === "en" ? "Privacy:" : "Privacidad:"}</strong> {resource.privacy_notes}</p>}
        </details>
      )}
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
