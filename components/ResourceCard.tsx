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
        {resource.platforms?.length ? <span>{resource.platforms.join(" · ")}</span> : null}
        {resource.languages?.length ? <span>{resource.languages.join(", ")}</span> : null}
        {duration ? <span>{duration}</span> : null}
        {resource.accessibility?.length ? <span>{resource.accessibility.join(", ")}</span> : null}
        {cultural && cultural !== "unknown" ? <span>{cultural.replaceAll("_", " ")}</span> : null}
      </div>
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
