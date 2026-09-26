"use client";

import type { Language } from "@/domain/i18n/copy";
import type { Tool } from "@/domain/tools/types";
import type { PersonalData } from "@/domain/data/storage";
import { resetFeedback } from "@/domain/data/actions";
import { localizeTool } from "@/domain/i18n/tools";

export function PersonalDataControls({ data, tools, language, update, onExport, onClear }: {
  data: PersonalData; tools: Tool[]; language: Language;
  update: (transform: (data: PersonalData) => PersonalData) => Promise<boolean>;
  onExport: () => void; onClear: () => void;
}) {
  const en = language === "en";
  return <section className="personal-controls" aria-labelledby="memory-title">
    <h2 id="memory-title">{en ? "Your memory, your choice" : "Tu memoria, tu decisión"}</h2>
    <p>{en ? "Your saved tools and feedback live in this browser. Export a copy before clearing browser data or moving devices. This demo has no account or cloud backup." : "Tus herramientas y comentarios se guardan en este navegador. Exporta una copia antes de borrar los datos del navegador o cambiar de dispositivo. Esta demo no tiene cuenta ni copia en la nube."}</p>
    <div className="control-actions">
      <button onClick={onExport}>{en ? "Export my data" : "Exportar mis datos"}</button>
      <button disabled={!data.feedback.length} onClick={() => {
        if (window.confirm(en ? "Delete all feedback? Your saved tools and hidden recommendations will stay." : "¿Borrar todos los comentarios? Se conservarán tus herramientas guardadas y las recomendaciones ocultas.")) update(resetFeedback);
      }}>{en ? "Reset learned history" : "Restablecer historial aprendido"}</button>
    </div>
    <p className="control-note">{en ? "The JSON export may contain personal information. Keep it somewhere private. Import is not available in this demo." : "La exportación JSON puede contener información personal. Guárdala en un lugar privado. Esta demo no permite importar datos."}</p>

    <details>
      <summary>{en ? "Hidden recommendations" : "Recomendaciones ocultas"} ({data.hiddenToolIds.length})</summary>
      <p>{en ? "These tools stay out of recommendations until you restore them. You can still open saved tools yourself." : "Estas herramientas no aparecen en las recomendaciones hasta que las restaures. Puedes seguir abriendo tus herramientas guardadas."}</p>
      {data.hiddenToolIds.map((id) => {
        const tool = tools.find((item) => item.id === id);
        return <div className="memory-row" key={id}>
          <span>{tool ? localizeTool(tool, language).title : id}</span>
          <button onClick={() => update((current) => ({ ...current, hiddenToolIds: current.hiddenToolIds.filter((hidden) => hidden !== id) }))}>{en ? "Restore" : "Restaurar"}</button>
        </div>;
      })}
    </details>
    <details>
      <summary>{en ? "Saved feedback" : "Comentarios guardados"} ({data.feedback.length})</summary>
      {data.feedback.map((entry, index) => {
        const tool = tools.find((item) => item.id === entry.toolId);
        const helpfulness = { "a-lot": en ? "A lot" : "Mucho", "a-little": en ? "A little" : "Un poco", "not-really": en ? "Not really" : "No mucho" }[entry.helpfulness];
        return <div className="memory-row" key={`${entry.createdAt}-${index}`}>
          <span>{tool ? localizeTool(tool, language).title : entry.toolId} · {helpfulness}<small>{new Date(entry.createdAt).toLocaleString(language)}</small></span>
          <button aria-label={`${en ? "Delete feedback for" : "Borrar comentario de"} ${tool?.title ?? entry.toolId}`} onClick={() => {
            if (window.confirm(en ? "Delete this feedback? This changes future matching." : "¿Borrar este comentario? Esto cambia las recomendaciones futuras.")) update((current) => ({ ...current, feedback: current.feedback.filter((item) => !(item.toolId === entry.toolId && item.createdAt === entry.createdAt && item.helpfulness === entry.helpfulness)) }));
          }}>{en ? "Delete" : "Borrar"}</button>
        </div>;
      })}
    </details>
    <button className="delete-tool-button" onClick={onClear}>{en ? "Clear my demo data" : "Borrar mis datos de la demo"}</button>
  </section>;
}
